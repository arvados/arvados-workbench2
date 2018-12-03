// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { ContextMenuActionSet } from "../context-menu-action-set";
import { RenameIcon, RemoveIcon } from "~/components/icon/icon";
import { DownloadCollectionFileAction } from "../actions/download-collection-file-action";
import { openFileRemoveDialog, openRenameFileDialog } from '~/store/collection-panel/collection-panel-files/collection-panel-files-actions';
import { OpenCollectionFileAction } from '~/views-components/context-menu/actions/open-collection-file-action';


export const collectionFilesItemActionSet: ContextMenuActionSet = [[{
    component: OpenCollectionFileAction,
    execute: () => { return; }
},{
    name: "Rename",
    icon: RenameIcon,
    execute: (dispatch, resource) => {
        dispatch<any>(openRenameFileDialog({ name: resource.name, id: resource.uuid }));
    }
}, {
    component: DownloadCollectionFileAction,
    execute: () => { return; }
}, {
    name: "Remove",
    icon: RemoveIcon,
    execute: (dispatch, resource) => {
        dispatch<any>(openFileRemoveDialog(resource.uuid));
    }
}]];
