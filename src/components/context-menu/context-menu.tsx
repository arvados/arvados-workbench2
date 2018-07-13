// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0
import * as React from "react";
import { Popover, List, ListItem, ListItemIcon, ListItemText, Divider } from "@material-ui/core";
import { DefaultTransformOrigin } from "../popover/helpers";
import IconBase, { IconTypes } from "../icon/icon";
import { ContextMenuItemSet } from "./context-menu-item-set";

export interface ContextMenuItem {
    name: string;
    icon: IconTypes;
}

export type ContextMenuItemGroup = ContextMenuItem[];

export interface ContextMenuProps {
    anchorEl?: HTMLElement;
    itemSet: ContextMenuItemSet;
    onItemClick: (action: ContextMenuItem) => void;
    onClose: () => void;
}

export default class ContextMenu extends React.PureComponent<ContextMenuProps> {
    render() {
        const { anchorEl, itemSet, onClose, onItemClick } = this.props;
        const items = itemSet.getItems();
        return <Popover
            anchorEl={anchorEl}
            open={!!anchorEl}
            onClose={onClose}
            transformOrigin={DefaultTransformOrigin}
            anchorOrigin={DefaultTransformOrigin}
            onContextMenu={this.handleContextMenu}>
            <List dense>
                {items.map((group, groupIndex) =>
                    <React.Fragment key={groupIndex}>
                        {group.map((item, actionIndex) =>
                            <ListItem
                                button
                                key={actionIndex}
                                onClick={() => onItemClick(item)}>
                                <ListItemIcon>
                                    <IconBase icon={item.icon} />
                                </ListItemIcon>
                                <ListItemText>
                                    {item.name}
                                </ListItemText>
                            </ListItem>)}
                        {groupIndex < items.length - 1 && <Divider />}
                    </React.Fragment>)}
            </List>
        </Popover>;
    }

    handleContextMenu = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        this.props.onClose();
    }
}
