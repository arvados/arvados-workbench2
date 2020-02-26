// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { connect } from "react-redux";
import { RootState } from "~/store/store";
import { contextMenuActions, ContextMenuResource } from "~/store/context-menu/context-menu-actions";
import { ContextMenu as ContextMenuComponent, ContextMenuProps, ContextMenuItem } from "~/components/context-menu/context-menu";
import { createAnchorAt } from "~/components/popover/helpers";
import { ContextMenuActionSet, ContextMenuAction } from "./context-menu-action-set";
import { Dispatch } from "redux";
import { memoize } from 'lodash';
type DataProps = Pick<ContextMenuProps, "anchorEl" | "items" | "open"> & { resource?: ContextMenuResource };
const mapStateToProps = (state: RootState): DataProps => {
    const { open, position, resource } = state.contextMenu;
    return {
        anchorEl: resource ? createAnchorAt(position) : undefined,
        items: getMenuActionSet(resource),
        open,
        resource
    };
};

type ActionProps = Pick<ContextMenuProps, "onClose"> & { onItemClick: (item: ContextMenuItem, resource?: ContextMenuResource) => void };
const mapDispatchToProps = (dispatch: Dispatch): ActionProps => ({
    onClose: () => {
        dispatch(contextMenuActions.CLOSE_CONTEXT_MENU());
    },
    onItemClick: (action: ContextMenuAction, resource?: ContextMenuResource) => {
        dispatch(contextMenuActions.CLOSE_CONTEXT_MENU());
        if (resource) {
            action.execute(dispatch, resource);
        }
    }
});

const handleItemClick = memoize(
    (resource: DataProps['resource'], onItemClick: ActionProps['onItemClick']): ContextMenuProps['onItemClick'] =>
        item => {
            onItemClick(item, resource);
        }
);

const mergeProps = ({ resource, ...dataProps }: DataProps, actionProps: ActionProps): ContextMenuProps => ({
    ...dataProps,
    ...actionProps,
    onItemClick: handleItemClick(resource, actionProps.onItemClick)
});


export const ContextMenu = connect(mapStateToProps, mapDispatchToProps, mergeProps)(ContextMenuComponent);

const menuActionSets = new Map<string, ContextMenuActionSet>();

export const addMenuActionSet = (name: string, itemSet: ContextMenuActionSet) => {
    menuActionSets.set(name, itemSet);
};

const emptyActionSet: ContextMenuActionSet = [];
const getMenuActionSet = (resource?: ContextMenuResource): ContextMenuActionSet => {
    return resource ? menuActionSets.get(resource.menuKind) || emptyActionSet : emptyActionSet;
};

export enum ContextMenuKind {
    API_CLIENT_AUTHORIZATION = "ApiClientAuthorization",
    ROOT_PROJECT = "RootProject",
    PROJECT = "Project",
    PROJECT_ADMIN = "ProjectAdmin",
    RESOURCE = "Resource",
    FAVORITE = "Favorite",
    TRASH = "Trash",
    COLLECTION_FILES = "CollectionFiles",
    COLLECTION_FILES_ITEM = "CollectionFilesItem",
    COLLECTION_FILES_NOT_SELECTED = "CollectionFilesNotSelected",
    COLLECTION = 'Collection',
    NON_WRITABLE_COLLECTION = 'NonWritableCollection',
    COLLECTION_ADMIN = 'CollectionAdmin',
    COLLECTION_RESOURCE = 'CollectionResource',
    TRASHED_COLLECTION = 'TrashedCollection',
    PROCESS = "Process",
    PROCESS_ADMIN = 'ProcessAdmin',
    PROCESS_RESOURCE = 'ProcessResource',
    PROCESS_LOGS = "ProcessLogs",
    REPOSITORY = "Repository",
    SSH_KEY = "SshKey",
    VIRTUAL_MACHINE = "VirtualMachine",
    KEEP_SERVICE = "KeepService",
    USER = "User",
    NODE = "Node",
    GROUPS = "Group",
    GROUP_MEMBER = "GroupMember",
    LINK = "Link",
}
