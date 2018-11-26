// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { ContextMenuActionSet } from "~/views-components/context-menu/context-menu-action-set";
import { AdvancedIcon, RemoveIcon, AttributesIcon } from "~/components/icon/icon";
import { openSshKeyRemoveDialog, openSshKeyAttributesDialog } from '~/store/auth/auth-action';

export const sshKeyActionSet: ContextMenuActionSet = [[{
    name: "Attributes",
    icon: AttributesIcon,
    execute: (dispatch, { index }) => {
        dispatch<any>(openSshKeyAttributesDialog(index!));
    }
}, {
    name: "Advanced",
    icon: AdvancedIcon,
    execute: (dispatch, { uuid, index }) => {
        // ToDo
    }
}, {
    name: "Remove",
    icon: RemoveIcon,
    execute: (dispatch, { uuid }) => {
        dispatch<any>(openSshKeyRemoveDialog(uuid));
    }
}]];