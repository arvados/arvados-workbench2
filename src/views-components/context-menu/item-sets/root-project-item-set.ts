// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { ContextMenuItemGroup } from "../../../components/context-menu/context-menu";
import { ContextMenuItemSet } from "../../../components/context-menu/context-menu-item-set";
import actions from "../../../store/project/project-action";
import { IconTypes } from "../../../components/icon/icon";

export const rootProjectItemSet: ContextMenuItemSet = {
    getItems: () => items,
    handleItem: (dispatch, item, resource) => {
        if (item.name === "New project") {
            dispatch(actions.OPEN_PROJECT_CREATOR({ ownerUuid: resource.uuid }));
        }
    }
};

const items: ContextMenuItemGroup[] = [[{
    icon: IconTypes.FOLDER,
    name: "New project"
}]];