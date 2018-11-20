// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import { ArvadosTheme } from '~/common/custom-theme';
import { Button, Grid, Typography } from '@material-ui/core';
import { connect, DispatchProp } from "react-redux";

type CssRules = 'root' | 'center' | 'title' | 'subtitle' | 'button' | 'container';

const styles: StyleRulesCallback<CssRules> = (theme: ArvadosTheme) => ({
    root: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
        marginTop: 200,
        width: 500
    },
    center: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    container: {
        display: 'flex',
        flexFlow: 'column'
    },
    title: {
        marginBottom: theme.spacing.unit * 2,
        color: theme.palette.grey["800"]
    },
    subtitle: {
        fontWeight: 600,
        marginBottom: theme.spacing.unit * 2,
    },
    button: {
        alignSelf: 'flex-end',
        marginTop: theme.spacing.unit
    }
});

interface FirstLoginDialogData {
    customHTML?: string;
}

type FirstLoginDialogProps = FirstLoginDialogData & DispatchProp<any> & WithStyles<CssRules>;

const createMarkup = (customHTML: any) => ({
    __html: customHTML
});

export const FirstLoginDialog = withStyles(styles)(connect()(
    ({ classes, customHTML, dispatch }: FirstLoginDialogProps) =>
        customHTML ?
            <div dangerouslySetInnerHTML={createMarkup(customHTML)} /> :
            <div className={classes.center}>
                <Paper className={classes.root} elevation={1}>
                    <Grid container direction="column" item xs justify="center">
                        <Grid item className={classes.container}>
                            <Typography variant="title" className={classes.title}>
                                Arvados - Steps for Registration
                            </Typography>
                            <Typography variant="body1" className={classes.subtitle}>
                                Please follow this step stated below in order to register for Arvados.
                            </Typography>
                            <Typography>
                                1. Complete the Arvados User Training. <a href="#">Click here to go to the training</a><br />
                                2. After the completion, please send an email with your training certificate
                                to <a href="#">glomgn_arvadosadmin@msxdl.roche.com</a> to request the activation of your account.<br />
                                3. After the activation, you can login into Arvados with your Roche email and password.
                            </Typography>
                            <Button
                                className={classes.button}
                                variant="contained"
                                color="primary"
                                size="small"
                            >
                                Refresh
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </div>
));