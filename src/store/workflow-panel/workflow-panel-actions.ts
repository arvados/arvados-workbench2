// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { Dispatch } from 'redux';
import { RootState } from '~/store/store';
import { ServiceRepository } from '~/services/services';
import { bindDataExplorerActions } from '~/store/data-explorer/data-explorer-action';
import { propertiesActions } from '~/store/properties/properties-actions';

export const WORKFLOW_PANEL_ID = "workflowPanel";
const UUID_PREFIX_PROPERTY_NAME = 'uuidPrefix';

export const workflowPanelActions = bindDataExplorerActions(WORKFLOW_PANEL_ID);

export const loadWorkflowPanel = () =>
    (dispatch: Dispatch, getState: () => RootState, services: ServiceRepository) => {
        dispatch(workflowPanelActions.REQUEST_ITEMS());
    };

export const setUuidPrefix = (uuidPrefix: string) =>
    propertiesActions.SET_PROPERTY({ key: UUID_PREFIX_PROPERTY_NAME, value: uuidPrefix });

export const getUuidPrefix = (state: RootState) =>{
    return state.properties.uuidPrefix;
};