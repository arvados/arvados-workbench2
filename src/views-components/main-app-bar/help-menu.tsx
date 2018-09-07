// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import * as React from "react";
import { MenuItem, Typography, ListSubheader } from "@material-ui/core";
import { DropdownMenu } from "~/components/dropdown-menu/dropdown-menu";
import { ImportContactsIcon, HelpIcon } from "~/components/icon/icon";
import { ArvadosTheme } from '~/common/custom-theme';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';

type CssRules = 'link' | 'icon' | 'title' | 'linkTitle';

const styles: StyleRulesCallback<CssRules> = (theme: ArvadosTheme) => ({
    link: {
        textDecoration: 'none',
        color: 'inherit',
        width: '100%',
        display: 'flex'
    },
    icon: {
        width: '16px',
        height: '16px'
    },
    title: {
        paddingBottom: theme.spacing.unit * 0.5,
        paddingLeft: theme.spacing.unit * 2,
        paddingTop: theme.spacing.unit * 0.5,
        outline: 'none',
    },
    linkTitle: {
        marginLeft: theme.spacing.unit
    },
});

const links = [
    {
        title: "Public Pipelines and Data sets",
        link: "https://dev.arvados.org/projects/arvados/wiki/Public_Pipelines_and_Datasets",
    },
    {
        title: "Tutorials and User guide",
        link: "http://doc.arvados.org/user/",
    },
    {
        title: "API Reference",
        link: "http://doc.arvados.org/api/",
    },
    {
        title: "SDK Reference",
        link: "http://doc.arvados.org/sdk/"
    },
];

export const HelpMenu = withStyles(styles)(
    ({ classes }: WithStyles<CssRules>) =>
        <DropdownMenu
            icon={<HelpIcon />}
            id="help-menu"
            title="Help">
            <MenuItem disabled>Help</MenuItem>
            {
                links.map(link =>
                    <MenuItem key={link.title}>
                        <a href={link.link} target="_blank" className={classes.link}>
                            <ImportContactsIcon className={classes.icon} />
                            <Typography variant="body1" className={classes.linkTitle}>{link.title}</Typography>
                        </a>
                    </MenuItem>
                )
            }
        </DropdownMenu>
);