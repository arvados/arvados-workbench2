// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { unionize, ofType, UnionOf } from "~/common/unionize";
import { TreeNode, initTreeNode, getNodeDescendants, getNodeDescendantsIds, getNodeValue, TreeNodeStatus, getNode } from '~/models/tree';
import { Dispatch } from 'redux';
import { RootState } from '~/store/store';
import { ServiceRepository } from '~/services/services';
import { FilterBuilder } from '~/services/api/filter-builder';
import { pipe, map, values, mapValues } from 'lodash/fp';
import { ResourceKind } from '~/models/resource';
import { GroupContentsResource } from '../../services/groups-service/groups-service';
import { CollectionDirectory, CollectionFile } from '../../models/collection-file';
import { getTreePicker, TreePicker } from './tree-picker';
import { ProjectsTreePickerItem } from '~/views-components/projects-tree-picker/generic-projects-tree-picker';
import { updateResources } from '../resources/resources-actions';

export const treePickerActions = unionize({
    LOAD_TREE_PICKER_NODE: ofType<{ id: string, pickerId: string }>(),
    LOAD_TREE_PICKER_NODE_SUCCESS: ofType<{ id: string, nodes: Array<TreeNode<any>>, pickerId: string }>(),
    TOGGLE_TREE_PICKER_NODE_COLLAPSE: ofType<{ id: string, pickerId: string }>(),
    ACTIVATE_TREE_PICKER_NODE: ofType<{ id: string, pickerId: string, relatedTreePickers?: string[] }>(),
    DEACTIVATE_TREE_PICKER_NODE: ofType<{ pickerId: string }>(),
    TOGGLE_TREE_PICKER_NODE_SELECTION: ofType<{ id: string, pickerId: string }>(),
    SELECT_TREE_PICKER_NODE: ofType<{ id: string | string[], pickerId: string }>(),
    DESELECT_TREE_PICKER_NODE: ofType<{ id: string | string[], pickerId: string }>(),
    EXPAND_TREE_PICKER_NODES: ofType<{ ids: string[], pickerId: string }>(),
    RESET_TREE_PICKER: ofType<{ pickerId: string }>()
});

export type TreePickerAction = UnionOf<typeof treePickerActions>;

export const getProjectsTreePickerIds = (pickerId: string) => ({
    home: `${pickerId}_home`,
    shared: `${pickerId}_shared`,
    favorites: `${pickerId}_favorites`,
});

export const getAllNodes = <Value>(pickerId: string, filter = (node: TreeNode<Value>) => true) => (state: TreePicker) =>
    pipe(
        () => values(getProjectsTreePickerIds(pickerId)),

        ids => ids
            .map(id => getTreePicker<Value>(id)(state)),

        trees => trees
            .map(getNodeDescendants(''))
            .reduce((allNodes, nodes) => allNodes.concat(nodes), []),

        allNodes => allNodes
            .reduce((map, node) =>
                filter(node)
                    ? map.set(node.id, node)
                    : map, new Map<string, TreeNode<Value>>())
            .values(),

        uniqueNodes => Array.from(uniqueNodes),
    )();
export const getSelectedNodes = <Value>(pickerId: string) => (state: TreePicker) =>
    getAllNodes<Value>(pickerId, node => node.selected)(state);
    
export const initProjectsTreePicker = (pickerId: string) =>
    async (dispatch: Dispatch, _: () => RootState, services: ServiceRepository) => {
        const { home, shared, favorites } = getProjectsTreePickerIds(pickerId);
        dispatch<any>(initUserProject(home));
        dispatch<any>(initSharedProject(shared));
        dispatch<any>(initFavoritesProject(favorites));
    };

interface ReceiveTreePickerDataParams<T> {
    data: T[];
    extractNodeData: (value: T) => { id: string, value: T, status?: TreeNodeStatus };
    id: string;
    pickerId: string;
}
export const receiveTreePickerData = <T>(params: ReceiveTreePickerDataParams<T>) =>
    (dispatch: Dispatch) => {
        const { data, extractNodeData, id, pickerId, } = params;
        dispatch(treePickerActions.LOAD_TREE_PICKER_NODE_SUCCESS({
            id,
            nodes: data.map(item => initTreeNode(extractNodeData(item))),
            pickerId,
        }));
        dispatch(treePickerActions.TOGGLE_TREE_PICKER_NODE_COLLAPSE({ id, pickerId }));
    };

interface LoadProjectParams {
    id: string;
    pickerId: string;
    includeCollections?: boolean;
    includeFiles?: boolean;
    loadShared?: boolean;
}
export const loadProject = (params: LoadProjectParams) =>
    async (dispatch: Dispatch, _: () => RootState, services: ServiceRepository) => {
        const { id, pickerId, includeCollections = false, includeFiles = false, loadShared = false } = params;

        dispatch(treePickerActions.LOAD_TREE_PICKER_NODE({ id, pickerId }));

        const filters = pipe(
            (fb: FilterBuilder) => includeCollections
                ? fb.addIsA('uuid', [ResourceKind.PROJECT, ResourceKind.COLLECTION])
                : fb.addIsA('uuid', [ResourceKind.PROJECT]),
            fb => fb.getFilters(),
        )(new FilterBuilder());

        const { items } = await services.groupsService.contents(loadShared ? '' : id, { filters, excludeHomeProject: loadShared || undefined });
        dispatch(updateResources(items));
        dispatch<any>(receiveTreePickerData<GroupContentsResource>({
            id,
            pickerId,
            data: items,
            extractNodeData: item => ({
                id: item.uuid,
                value: item,
                status: item.kind === ResourceKind.PROJECT
                    ? TreeNodeStatus.INITIAL
                    : includeFiles
                        ? TreeNodeStatus.INITIAL
                        : TreeNodeStatus.LOADED
            }),
        }));
    };

export const loadCollection = (id: string, pickerId: string) =>
    async (dispatch: Dispatch, getState: () => RootState, services: ServiceRepository) => {
        dispatch(treePickerActions.LOAD_TREE_PICKER_NODE({ id, pickerId }));

        const picker = getTreePicker<ProjectsTreePickerItem>(pickerId)(getState().treePicker);
        if (picker) {

            const node = getNode(id)(picker);
            if (node && 'kind' in node.value && node.value.kind === ResourceKind.COLLECTION) {

                const files = await services.collectionService.files(node.value.portableDataHash);
                const data = getNodeDescendants('')(files).map(node => node.value);

                dispatch<any>(receiveTreePickerData<CollectionDirectory | CollectionFile>({
                    id,
                    pickerId,
                    data,
                    extractNodeData: value => ({
                        id: value.id,
                        status: TreeNodeStatus.LOADED,
                        value,
                    }),
                }));
            }
        }
    };


export const initUserProject = (pickerId: string) =>
    async (dispatch: Dispatch<any>, getState: () => RootState, services: ServiceRepository) => {
        const uuid = services.authService.getUuid();
        if (uuid) {
            dispatch(receiveTreePickerData({
                id: '',
                pickerId,
                data: [{ uuid, name: 'Projects' }],
                extractNodeData: value => ({
                    id: value.uuid,
                    status: TreeNodeStatus.INITIAL,
                    value,
                }),
            }));
        }
    };
export const loadUserProject = (pickerId: string, includeCollections = false, includeFiles = false) =>
    async (dispatch: Dispatch<any>, getState: () => RootState, services: ServiceRepository) => {
        const uuid = services.authService.getUuid();
        if (uuid) {
            dispatch(loadProject({ id: uuid, pickerId, includeCollections, includeFiles }));
        }
    };


export const initSharedProject = (pickerId: string) =>
    async (dispatch: Dispatch<any>, getState: () => RootState, services: ServiceRepository) => {
        dispatch(receiveTreePickerData({
            id: '',
            pickerId,
            data: [{ uuid: 'Shared with me', name: 'Shared with me' }],
            extractNodeData: value => ({
                id: value.uuid,
                status: TreeNodeStatus.INITIAL,
                value,
            }),
        }));
    };

export const initFavoritesProject = (pickerId: string) =>
    async (dispatch: Dispatch<any>, getState: () => RootState, services: ServiceRepository) => {
        dispatch(receiveTreePickerData({
            id: '',
            pickerId,
            data: [{ uuid: 'Favorites', name: 'Favorites' }],
            extractNodeData: value => ({
                id: value.uuid,
                status: TreeNodeStatus.INITIAL,
                value,
            }),
        }));
    };

interface LoadFavoritesProjectParams {
    pickerId: string;
    includeCollections?: boolean;
    includeFiles?: boolean;
}
export const loadFavoritesProject = (params: LoadFavoritesProjectParams) =>
    async (dispatch: Dispatch<any>, getState: () => RootState, services: ServiceRepository) => {
        const { pickerId, includeCollections = false, includeFiles = false } = params;
        const uuid = services.authService.getUuid();
        if (uuid) {

            const filters = pipe(
                (fb: FilterBuilder) => includeCollections
                    ? fb.addIsA('headUuid', [ResourceKind.PROJECT, ResourceKind.COLLECTION])
                    : fb.addIsA('headUuid', [ResourceKind.PROJECT]),
                fb => fb.getFilters(),
            )(new FilterBuilder());

            const { items } = await services.favoriteService.list(uuid, { filters });

            dispatch<any>(receiveTreePickerData<GroupContentsResource>({
                id: 'Favorites',
                pickerId,
                data: items,
                extractNodeData: item => ({
                    id: item.uuid,
                    value: item,
                    status: item.kind === ResourceKind.PROJECT
                        ? TreeNodeStatus.INITIAL
                        : includeFiles
                            ? TreeNodeStatus.INITIAL
                            : TreeNodeStatus.LOADED
                }),
            }));
        }
    };
