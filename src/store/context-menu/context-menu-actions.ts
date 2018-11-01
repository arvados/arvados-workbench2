// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { unionize, ofType, UnionOf } from '~/common/unionize';
import { ContextMenuPosition } from "./context-menu-reducer";
import { ContextMenuKind } from '~/views-components/context-menu/context-menu';
import { Dispatch } from 'redux';
import { RootState } from '~/store/store';
import { getResource } from '../resources/resources';
import { ProjectResource } from '~/models/project';
import { UserResource } from '~/models/user';
import { isSidePanelTreeCategory } from '~/store/side-panel-tree/side-panel-tree-actions';
import { extractUuidKind, ResourceKind } from '~/models/resource';
import { matchProcessRoute } from '~/routes/routes';
import { Process } from '~/store/processes/process';

export const contextMenuActions = unionize({
    OPEN_CONTEXT_MENU: ofType<{ position: ContextMenuPosition, resource: ContextMenuResource }>(),
    CLOSE_CONTEXT_MENU: ofType<{}>()
});

export type ContextMenuAction = UnionOf<typeof contextMenuActions>;

export type ContextMenuResource = {
    name: string;
    uuid: string;
    ownerUuid: string;
    description?: string;
    kind: ResourceKind,
    menuKind: ContextMenuKind;
    isTrashed?: boolean;
};
export const isKeyboardClick = (event: React.MouseEvent<HTMLElement>) =>
    event.nativeEvent.detail === 0;
export const openContextMenu = (event: React.MouseEvent<HTMLElement>, resource: ContextMenuResource) =>
    (dispatch: Dispatch) => {
        event.preventDefault();
        const { left, top } = event.currentTarget.getBoundingClientRect();
        dispatch(
            contextMenuActions.OPEN_CONTEXT_MENU({
                position: {
                    x: event.clientX || left,
                    y: event.clientY || top,
                },
                resource
            })
        );
    };

export const openRootProjectContextMenu = (event: React.MouseEvent<HTMLElement>, projectUuid: string) =>
    (dispatch: Dispatch, getState: () => RootState) => {
        const res = getResource<UserResource>(projectUuid)(getState().resources);
        if (res) {
            dispatch<any>(openContextMenu(event, {
                name: '',
                uuid: res.uuid,
                ownerUuid: res.uuid,
                kind: res.kind,
                menuKind: ContextMenuKind.ROOT_PROJECT,
                isTrashed: false
            }));
        }
    };

export const openProjectContextMenu = (event: React.MouseEvent<HTMLElement>, projectUuid: string) =>
    (dispatch: Dispatch, getState: () => RootState) => {
        event.preventDefault();
        const res = getResource<ProjectResource>(projectUuid)(getState().resources);
        if (res) {
            dispatch<any>(openContextMenu(event, {
                name: res.name,
                uuid: res.uuid,
                kind: res.kind,
                menuKind: ContextMenuKind.PROJECT,
                ownerUuid: res.ownerUuid,
                isTrashed: res.isTrashed
            }));
        }
    };

export const openSidePanelContextMenu = (event: React.MouseEvent<HTMLElement>, id: string) =>
    (dispatch: Dispatch, getState: () => RootState) => {
        if (!isSidePanelTreeCategory(id)) {
            const kind = extractUuidKind(id);
            if (kind === ResourceKind.USER) {
                dispatch<any>(openRootProjectContextMenu(event, id));
            } else if (kind === ResourceKind.PROJECT) {
                dispatch<any>(openProjectContextMenu(event, id));
            }
        }
    };

export const openProcessContextMenu = (event: React.MouseEvent<HTMLElement>, process: Process) =>
    (dispatch: Dispatch, getState: () => RootState) => {
        const resource = {
            uuid: process.containerRequest.uuid,
            ownerUuid: '',
            kind: ResourceKind.PROCESS,
            name: '',
            description: '',
            menuKind: ContextMenuKind.PROCESS
        };
        dispatch<any>(openContextMenu(event, resource));
    };

export const resourceKindToContextMenuKind = (uuid: string) => {
    const kind = extractUuidKind(uuid);
    switch (kind) {
        case ResourceKind.PROJECT:
            return ContextMenuKind.PROJECT;
        case ResourceKind.COLLECTION:
            return ContextMenuKind.COLLECTION_RESOURCE;
        case ResourceKind.PROCESS:
            return ContextMenuKind.PROCESS_RESOURCE;
        case ResourceKind.USER:
            return ContextMenuKind.ROOT_PROJECT;
        default:
            return;
    }
};
