// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { Dispatch } from 'redux';
import { navigateToFavorites, navigateTo, navigateToTrash, navigateToSharedWithMe, navigateToWorkflows } from '../navigation/navigation-action';
import { snackbarActions } from '~/store/snackbar/snackbar-actions';
import { SidePanelTreeId, isSidePanelTreeId } from '~/store/side-panel-tree/side-panel-trees-actions';

export const navigateFromSidePanel = (id: string) =>
    (dispatch: Dispatch) => {
        if (isSidePanelTreeId(id)) {
            dispatch<any>(getSidePanelTreeCategoryAction(id));
        } else {
            dispatch<any>(navigateTo(id));
        }
    };

const getSidePanelTreeCategoryAction = (id: string) => {
    switch (id) {
        case SidePanelTreeId.FAVORITES:
            return navigateToFavorites;
        case SidePanelTreeId.TRASH:
            return navigateToTrash;
        case SidePanelTreeId.SHARED:
            return navigateToSharedWithMe;
        case SidePanelTreeId.WORKFLOWS:
            return navigateToWorkflows;
        default:
            return sidePanelTreeCategoryNotAvailable(id);
    }
};

const sidePanelTreeCategoryNotAvailable = (id: string) =>
    snackbarActions.OPEN_SNACKBAR({
        message: `${id} not available`,
        hideDuration: 3000,
    });
