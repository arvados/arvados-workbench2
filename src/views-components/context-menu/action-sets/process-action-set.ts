// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { ContextMenuActionSet } from "~/views-components/context-menu/context-menu-action-set";
import { ToggleFavoriteAction } from "~/views-components/context-menu/actions/favorite-action";
import { toggleFavorite } from "~/store/favorites/favorites-actions";
import {
    RenameIcon, ShareIcon, MoveToIcon, CopyIcon, DetailsIcon, ProvenanceGraphIcon,
    AdvancedIcon, RemoveIcon, ReRunProcessIcon, LogIcon, InputIcon, CommandIcon, OutputIcon
} from "~/components/icon/icon";
import { favoritePanelActions } from "~/store/favorite-panel/favorite-panel-action";
import { navigateToProcessLogs } from '~/store/navigation/navigation-action';
import { openMoveProcessDialog } from '~/store/processes/process-move-actions';
import { openProcessUpdateDialog } from "~/store/processes/process-update-actions";
import { openCopyProcessDialog } from '~/store/processes/process-copy-actions';
import { openProcessCommandDialog } from '~/store/processes/process-command-actions';
import { detailsPanelActions } from '~/store/details-panel/details-panel-action';
import { openSharingDialog } from "~/store/sharing-dialog/sharing-dialog-actions";
import { openAdvancedTabDialog } from "~/store/advanced-tab/advanced-tab";

export const processActionSet: ContextMenuActionSet = [[
    {
        icon: RenameIcon,
        name: "Edit process",
        execute: (dispatch, resource) => {
            dispatch<any>(openProcessUpdateDialog(resource));
        }
    },
    {
        icon: ShareIcon,
        name: "Share",
        execute: (dispatch, { uuid }) => {
            dispatch<any>(openSharingDialog(uuid));
        }
    },
    {
        icon: MoveToIcon,
        name: "Move to",
        execute: (dispatch, resource) => {
            dispatch<any>(openMoveProcessDialog(resource));
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
            dispatch<any>(openCopyProcessDialog(resource));
        }
    },
    {
        icon: ReRunProcessIcon,
        name: "Re-run process",
        execute: (dispatch, resource) => {
            // add code
        }
    },
    {
        icon: InputIcon,
        name: "Inputs",
        execute: (dispatch, resource) => {
            // add code
        }
    },
    {
        icon: OutputIcon,
        name: "Outputs",
        execute: (dispatch, resource) => {
            // add code
        }
    },
    {
        icon: CommandIcon,
        name: "Command",
        execute: (dispatch, resource) => {
            dispatch<any>(openProcessCommandDialog(resource.uuid));
        }
    },
    {
        icon: DetailsIcon,
        name: "View details",
        execute: dispatch => {
            dispatch(detailsPanelActions.TOGGLE_DETAILS_PANEL());
        }
    },
    {
        icon: LogIcon,
        name: "Log",
        execute: (dispatch, resource) => {
            dispatch<any>(navigateToProcessLogs(resource.uuid));
        }
    },
    {
        icon: ProvenanceGraphIcon,
        name: "Provenance graph",
        execute: (dispatch, resource) => {
            // add code
        }
    },
    {
        icon: AdvancedIcon,
        name: "Advanced",
        execute: (dispatch, resource) => {
            dispatch<any>(openAdvancedTabDialog(resource.uuid));
        }
    },
    {
        icon: RemoveIcon,
        name: "Remove",
        execute: (dispatch, resource) => {
            // add code
        }
    }
]];
