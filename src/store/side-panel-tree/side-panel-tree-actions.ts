// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { Dispatch } from 'redux';
import { treePickerActions } from "~/store/tree-picker/tree-picker-actions";
import { RootState } from '~/store/store';
import { ServiceRepository } from '~/services/services';
import { FilterBuilder } from '~/services/api/filter-builder';
import { resourcesActions } from '~/store/resources/resources-actions';
import { getTreePicker, TreePicker } from '~/store/tree-picker/tree-picker';
import { getNodeAncestors, getNodeAncestorsIds, getNode, TreeNode, initTreeNode, TreeNodeStatus } from '~/models/tree';
import { ProjectResource } from '~/models/project';
import { OrderBuilder } from '~/services/api/order-builder';
import { ResourceKind } from '~/models/resource';
import { GroupContentsResourcePrefix } from '~/services/groups-service/groups-service';
import { GroupClass } from '~/models/group';

export enum SidePanelTreeCategory {
    PROJECTS = 'Projects',
    SHARED_WITH_ME = 'Shared with me',
    WORKFLOWS = 'Workflows',
    FAVORITES = 'Favorites',
    TRASH = 'Trash'
}

export const SIDE_PANEL_TREE = 'sidePanelTree';

export const getSidePanelTree = (treePicker: TreePicker) =>
    getTreePicker<ProjectResource | string>(SIDE_PANEL_TREE)(treePicker);

export const getSidePanelTreeBranch = (uuid: string) => (treePicker: TreePicker): Array<TreeNode<ProjectResource | string>> => {
    const tree = getSidePanelTree(treePicker);
    if (tree) {
        const ancestors = getNodeAncestors(uuid)(tree);
        const node = getNode(uuid)(tree);
        if (node) {
            return [...ancestors, node];
        }
    }
    return [];
};

const SIDE_PANEL_CATEGORIES = [
    SidePanelTreeCategory.WORKFLOWS,
    SidePanelTreeCategory.FAVORITES,
    SidePanelTreeCategory.TRASH,
];

export const isSidePanelTreeCategory = (id: string) => SIDE_PANEL_CATEGORIES.some(category => category === id);

export const initSidePanelTree = () =>
    (dispatch: Dispatch, _: () => RootState, { authService }: ServiceRepository) => {
        const rootProjectUuid = authService.getUuid() || '';
        const nodes = SIDE_PANEL_CATEGORIES.map(id => initTreeNode({ id, value: id }));
        const projectsNode = initTreeNode({ id: rootProjectUuid, value: SidePanelTreeCategory.PROJECTS });
        const sharedNode = initTreeNode({ id: SidePanelTreeCategory.SHARED_WITH_ME, value: SidePanelTreeCategory.SHARED_WITH_ME });
        dispatch(treePickerActions.LOAD_TREE_PICKER_NODE_SUCCESS({
            id: '',
            pickerId: SIDE_PANEL_TREE,
            nodes: [projectsNode, sharedNode, ...nodes]
        }));
        SIDE_PANEL_CATEGORIES.forEach(category => {
            dispatch(treePickerActions.LOAD_TREE_PICKER_NODE_SUCCESS({
                id: category,
                pickerId: SIDE_PANEL_TREE,
                nodes: []
            }));
        });
    };

export const loadSidePanelTreeProjects = (projectUuid: string) =>
    async (dispatch: Dispatch, getState: () => RootState, services: ServiceRepository) => {
        const treePicker = getTreePicker(SIDE_PANEL_TREE)(getState().treePicker);
        const node = treePicker ? getNode(projectUuid)(treePicker) : undefined;
        if (projectUuid === SidePanelTreeCategory.SHARED_WITH_ME) {
            await dispatch<any>(loadSharedRoot);
        } else if (node || projectUuid === '') {
            await dispatch<any>(loadProject(projectUuid));
        }
    };

const loadProject = (projectUuid: string) =>
    async (dispatch: Dispatch, _: () => RootState, services: ServiceRepository) => {
        dispatch(treePickerActions.LOAD_TREE_PICKER_NODE({ id: projectUuid, pickerId: SIDE_PANEL_TREE }));
        const params = {
            filters: new FilterBuilder()
                .addEqual('ownerUuid', projectUuid)
                .getFilters(),
            order: new OrderBuilder<ProjectResource>()
                .addAsc('name')
                .getOrder()
        };
        const { items } = await services.projectService.list(params);
        dispatch(treePickerActions.LOAD_TREE_PICKER_NODE_SUCCESS({
            id: projectUuid,
            pickerId: SIDE_PANEL_TREE,
            nodes: items.map(item => initTreeNode({ id: item.uuid, value: item })),
        }));
        dispatch(resourcesActions.SET_RESOURCES(items));
    };

const loadSharedRoot = async (dispatch: Dispatch, _: () => RootState, services: ServiceRepository) => {
    dispatch(treePickerActions.LOAD_TREE_PICKER_NODE({ id: SidePanelTreeCategory.SHARED_WITH_ME, pickerId: SIDE_PANEL_TREE }));

    const params = {
        filters:  `[${new FilterBuilder()
            .addIsA('uuid', ResourceKind.PROJECT)
            .addEqual('groupClass', GroupClass.PROJECT)
            .getFilters()}]`,
        order: new OrderBuilder<ProjectResource>()
            .addAsc('name', GroupContentsResourcePrefix.PROJECT)
            .getOrder(),
    };

    const { items } = await services.groupsService.shared(params);

    dispatch(treePickerActions.LOAD_TREE_PICKER_NODE_SUCCESS({
        id: SidePanelTreeCategory.SHARED_WITH_ME,
        pickerId: SIDE_PANEL_TREE,
        nodes: items.map(item => initTreeNode({ id: item.uuid, value: item })),
    }));

    dispatch(resourcesActions.SET_RESOURCES(items));
};

export const activateSidePanelTreeItem = (id: string) =>
    async (dispatch: Dispatch, getState: () => RootState) => {
        const node = getSidePanelTreeNode(id)(getState().treePicker);
        if (node && !node.active) {
            dispatch(treePickerActions.ACTIVATE_TREE_PICKER_NODE({ id, pickerId: SIDE_PANEL_TREE }));
        }
        if (!isSidePanelTreeCategory(id)) {
            await dispatch<any>(activateSidePanelTreeProject(id));
        }
    };

export const activateSidePanelTreeProject = (id: string) =>
    async (dispatch: Dispatch, getState: () => RootState) => {
        const { treePicker } = getState();
        const node = getSidePanelTreeNode(id)(treePicker);
        if (node && node.status !== TreeNodeStatus.LOADED) {
            await dispatch<any>(loadSidePanelTreeProjects(id));
        } else if (node === undefined) {
            await dispatch<any>(activateSidePanelTreeBranch(id));
        }
        dispatch(treePickerActions.EXPAND_TREE_PICKER_NODES({
            ids: getSidePanelTreeNodeAncestorsIds(id)(treePicker),
            pickerId: SIDE_PANEL_TREE
        }));
        dispatch<any>(expandSidePanelTreeItem(id));
    };

export const activateSidePanelTreeBranch = (id: string) =>
    async (dispatch: Dispatch, _: void, services: ServiceRepository) => {
        const ancestors = await services.ancestorsService.ancestors(id, services.authService.getUuid() || '');
        const isShared = ancestors.every(({ uuid }) => uuid !== services.authService.getUuid());
        if (isShared) {
            await dispatch<any>(loadSidePanelTreeProjects(SidePanelTreeCategory.SHARED_WITH_ME));
        }
        for (const ancestor of ancestors) {
            await dispatch<any>(loadSidePanelTreeProjects(ancestor.uuid));
        }
        dispatch(treePickerActions.EXPAND_TREE_PICKER_NODES({
            ids: [
                ...(isShared ? [SidePanelTreeCategory.SHARED_WITH_ME] : []),
                ...ancestors.map(ancestor => ancestor.uuid)
            ],
            pickerId: SIDE_PANEL_TREE
        }));
        dispatch(treePickerActions.ACTIVATE_TREE_PICKER_NODE({ id, pickerId: SIDE_PANEL_TREE }));
    };

export const toggleSidePanelTreeItemCollapse = (id: string) =>
    async (dispatch: Dispatch, getState: () => RootState) => {
        const node = getSidePanelTreeNode(id)(getState().treePicker);
        if (node && node.status === TreeNodeStatus.INITIAL) {
            await dispatch<any>(loadSidePanelTreeProjects(node.id));
        }
        dispatch(treePickerActions.TOGGLE_TREE_PICKER_NODE_COLLAPSE({ id, pickerId: SIDE_PANEL_TREE }));
    };

export const expandSidePanelTreeItem = (id: string) =>
    async (dispatch: Dispatch, getState: () => RootState) => {
        const node = getSidePanelTreeNode(id)(getState().treePicker);
        if (node && !node.expanded) {
            dispatch(treePickerActions.TOGGLE_TREE_PICKER_NODE_COLLAPSE({ id, pickerId: SIDE_PANEL_TREE }));
        }
    };

export const getSidePanelTreeNode = (id: string) => (treePicker: TreePicker) => {
    const sidePanelTree = getTreePicker(SIDE_PANEL_TREE)(treePicker);
    return sidePanelTree
        ? getNode(id)(sidePanelTree)
        : undefined;
};

export const getSidePanelTreeNodeAncestorsIds = (id: string) => (treePicker: TreePicker) => {
    const sidePanelTree = getTreePicker(SIDE_PANEL_TREE)(treePicker);
    return sidePanelTree
        ? getNodeAncestorsIds(id)(sidePanelTree)
        : [];
};
