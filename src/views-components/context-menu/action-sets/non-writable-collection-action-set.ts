// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { ContextMenuActionSet } from "../context-menu-action-set";
import { ToggleFavoriteAction } from "../actions/favorite-action";
import { toggleFavorite } from "~/store/favorites/favorites-actions";
import { ShareIcon, CopyIcon, DetailsIcon } from "~/components/icon/icon";
import { favoritePanelActions } from "~/store/favorite-panel/favorite-panel-action";
import { openCollectionCopyDialog } from "~/store/collections/collection-copy-actions";
import { ToggleTrashAction } from "~/views-components/context-menu/actions/trash-action";
import { toggleCollectionTrashed } from "~/store/trash/trash-actions";
import { openSharingDialog } from '~/store/sharing-dialog/sharing-dialog-actions';
import { toggleDetailsPanel } from '~/store/details-panel/details-panel-action';

export const nonWritableCollectionActionSet: ContextMenuActionSet = [[
    {
        icon: ShareIcon,
        name: "Share",
        execute: (dispatch, { uuid }) => {
            dispatch<any>(openSharingDialog(uuid));
        }
    },
    {
        component: ToggleFavoriteAction,
        execute: (dispatch, resource) => {
            dispatch<any>(toggleFavorite(resource)).then(() => {
                dispatch<any>(favoritePanelActions.REQUEST_ITEMS());
            });
        }
    },
    {
        icon: CopyIcon,
        name: "Copy to project",
        execute: (dispatch, resource) => {
            dispatch<any>(openCollectionCopyDialog(resource));
        }

    },
    {
        icon: DetailsIcon,
        name: "View details",
        execute: dispatch => {
            dispatch<any>(toggleDetailsPanel());
        }
    },
    {
        component: ToggleTrashAction,
        execute: (dispatch, resource) => {
            dispatch<any>(toggleCollectionTrashed(resource.uuid, resource.isTrashed!!));
        }
    },
]];
