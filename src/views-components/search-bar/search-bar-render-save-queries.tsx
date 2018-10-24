// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import * as React from 'react';
import { withStyles, WithStyles, StyleRulesCallback, List, ListItem, ListItemText, ListItemSecondaryAction, Tooltip, IconButton, Button } from '@material-ui/core';
import { ArvadosTheme } from '~/common/custom-theme';
import { RemoveIcon, EditSavedQueryIcon } from '~/components/icon/icon';
import { SearchBarAdvanceFormData } from '~/models/search-bar';

type CssRules = 'root' | 'listItem' | 'listItemText' | 'button';

const styles: StyleRulesCallback<CssRules> = (theme: ArvadosTheme) => ({
    root: {
        padding: '0px'
    },
    listItem: {
        paddingLeft: theme.spacing.unit,
        paddingRight: theme.spacing.unit * 2
    },
    listItemText: {
        fontSize: '0.8125rem',
        color: theme.palette.grey["900"]
    },
    button: {
        padding: '6px',
        marginRight: theme.spacing.unit
    }
});

export interface SearchBarRenderSavedQueriesDataProps {
    savedQueries: SearchBarAdvanceFormData[];
}

export interface SearchBarRenderSavedQueriesActionProps {
    onSearch: (searchValue: string) => void;
    deleteSavedQuery: (id: number) => void;
    editSavedQuery: (data: SearchBarAdvanceFormData, id: number) => void;
}

type SearchBarRenderSavedQueriesProps = SearchBarRenderSavedQueriesDataProps 
    & SearchBarRenderSavedQueriesActionProps 
    & WithStyles<CssRules>;

export const SearchBarRenderSavedQueries = withStyles(styles)(
    ({ classes, savedQueries, onSearch, editSavedQuery, deleteSavedQuery }: SearchBarRenderSavedQueriesProps) =>
        <List component="nav" className={classes.root}>
            {savedQueries.map((query, index) => 
                <ListItem button key={index} className={classes.listItem}>
                    <ListItemText disableTypography 
                        secondary={query.searchQuery} 
                        onClick={() => onSearch(query.searchQuery)} 
                        className={classes.listItemText} />
                    <ListItemSecondaryAction>
                        <Tooltip title="Edit">
                            <IconButton aria-label="Edit" onClick={() => editSavedQuery(query, index)} className={classes.button}>
                                <EditSavedQueryIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove">
                            <IconButton aria-label="Remove" onClick={() => deleteSavedQuery(index)} className={classes.button}>
                                <RemoveIcon />
                            </IconButton>
                        </Tooltip>
                    </ListItemSecondaryAction>
                </ListItem>
            )}
    </List>);