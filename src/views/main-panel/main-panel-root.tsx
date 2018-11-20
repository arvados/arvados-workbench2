// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import * as React from 'react';
import { StyleRulesCallback, WithStyles, withStyles, Grid, LinearProgress } from '@material-ui/core';
import { User } from "~/models/user";
import { ArvadosTheme } from '~/common/custom-theme';
import { WorkbenchPanel } from '~/views/workbench/workbench';
import { LoginPanel } from '~/views/login-panel/login-panel';
import { WorkbenchLoadingScreen } from '~/views/workbench/workbench-loading-screen';
import { MainAppBar } from '~/views-components/main-app-bar/main-app-bar';
import { FirstLoginDialog } from "~/views-components/first-login-dialog/first-login-dialog";

type CssRules = 'root';

const styles: StyleRulesCallback<CssRules> = (theme: ArvadosTheme) => ({
    root: {
        overflow: 'hidden',
        width: '100vw',
        height: '100vh'
    }
});

export interface MainPanelRootDataProps {
    user?: User;
    working: boolean;
    loading: boolean;
    buildInfo: string;
}

type MainPanelRootProps = MainPanelRootDataProps & WithStyles<CssRules>;

export const MainPanelRoot = withStyles(styles)(
    ({ classes, loading, working, user, buildInfo }: MainPanelRootProps) => {
        if (loading) {
            return <WorkbenchLoadingScreen />;
        }
        if (1) {
            return <FirstLoginDialog />;
        }
        return (
            <>
                <MainAppBar
                    user={user}
                    buildInfo={buildInfo}>
                    {working ? <LinearProgress color="secondary" /> : null}
                </MainAppBar>
                <Grid container direction="column" className={classes.root}>
                    {user ? <WorkbenchPanel /> : <LoginPanel />}
                </Grid>
            </>
        );
    });