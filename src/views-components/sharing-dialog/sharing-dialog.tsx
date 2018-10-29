// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { compose, Dispatch } from 'redux';
import { connect } from 'react-redux';

import * as React from 'react';
import { connectSharingDialog, saveSharingDialogChanges, hasChanges } from '~/store/sharing-dialog/sharing-dialog-actions';
import { WithDialogProps } from '~/store/dialog/with-dialog';
import { RootState } from '~/store/store';

import SharingDialogComponent, { SharingDialogDataProps, SharingDialogActionProps } from './sharing-dialog-component';
import { SharingDialogContent } from './sharing-dialog-content';
import { connectAdvancedViewSwitch, AdvancedViewSwitchInjectedProps } from './advanced-view-switch';

const mapStateToProps = (state: RootState, { advancedViewOpen, ...props }: WithDialogProps<string> & AdvancedViewSwitchInjectedProps): SharingDialogDataProps => ({
    ...props,
    saveEnabled: hasChanges(state),
    advancedEnabled: !advancedViewOpen,
    children: <SharingDialogContent {...{ advancedViewOpen }} />,
});

const mapDispatchToProps = (dispatch: Dispatch, { toggleAdvancedView, ...props }: WithDialogProps<string> & AdvancedViewSwitchInjectedProps): SharingDialogActionProps => ({
    ...props,
    onClose: props.closeDialog,
    onExited: toggleAdvancedView,
    onSave: () => {
        dispatch<any>(saveSharingDialogChanges);
    },
    onAdvanced: toggleAdvancedView,
});

export const SharingDialog = compose(
    connectAdvancedViewSwitch,
    connectSharingDialog,
    connect(mapStateToProps, mapDispatchToProps)
)(SharingDialogComponent);
