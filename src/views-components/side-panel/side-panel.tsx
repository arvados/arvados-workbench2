// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import * as React from 'react';
import { connect } from 'react-redux';
import { SidePanelTrees as SidePanelTreesComponent, SidePanelTreesProps } from '~/views-components/side-panel-tree/side-panel-tree';
import { navigateFromSidePanel } from '~/store/side-panel/side-panel-action';
import { Grid } from '@material-ui/core';
import { SidePanelButton } from '~/views-components/side-panel-button/side-panel-button';
import { openSidePanelContextMenu } from '~/store/context-menu/context-menu-actions';

export const SidePanel = () =>
    <Grid item xs>
        <SidePanelButton />
        <SidePanelTrees />
    </Grid>;

const dispatchProps: SidePanelTreesProps = {
    toggleItemActive: (_, { id }) => navigateFromSidePanel(id),
    onContextMenu: (event, { id }) => openSidePanelContextMenu(event, id),
};

const SidePanelTrees = connect(
    null,
    dispatchProps
)(SidePanelTreesComponent);
