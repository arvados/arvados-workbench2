// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import * as React from "react";
import { ListItemIcon, ListItemText, Button, ListItem } from "@material-ui/core";
import { DownloadIcon, IconType } from "../../../components/icon/icon";

export const DownloadAction = (props: { href?: string, download?: string, onClick?: () => void, icon?: IconType }) => {
    const targetProps = props.download ? {} : { target: '_blank' };
    const downloadProps = props.download ? { download: props.download } : {};
    return props.href
        ? <a
            style={{ textDecoration: 'none' }}
            href={props.href}
            onClick={props.onClick}
            {...targetProps}
            {...downloadProps}>
            <ListItem button>
                {props.icon &&
                    <ListItemIcon>
                        <props.icon />
                    </ListItemIcon>
                }
                <ListItemText>
                    Download
            </ListItemText>
            </ListItem>
        </a >
        : null;
};