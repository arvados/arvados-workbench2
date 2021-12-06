// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { Dispatch } from "redux";
import { FormErrors, initialize, startSubmit, stopSubmit } from 'redux-form';
import { RootState } from "store/store";
import { collectionPanelActions } from "store/collection-panel/collection-panel-action";
import { dialogActions } from "store/dialog/dialog-actions";
import { getCommonResourceServiceError, CommonResourceServiceError } from "services/common-service/common-resource-service";
import { ServiceRepository } from "services/services";
import { CollectionResource } from 'models/collection';
import { progressIndicatorActions } from "store/progress-indicator/progress-indicator-actions";
import { snackbarActions, SnackbarKind } from "../snackbar/snackbar-actions";
import { updateResources } from "../resources/resources-actions";
import { loadDetailsPanel } from "../details-panel/details-panel-action";
import { getResource } from "store/resources/resources";

export interface CollectionUpdateFormDialogData {
    uuid: string;
    name: string;
    description?: string;
    storageClassesDesired?: string[];
}

export const COLLECTION_UPDATE_FORM_NAME = 'collectionUpdateFormName';

export const openCollectionUpdateDialog = (resource: CollectionUpdateFormDialogData) =>
    (dispatch: Dispatch) => {
        dispatch(initialize(COLLECTION_UPDATE_FORM_NAME, resource));
        dispatch(dialogActions.OPEN_DIALOG({ id: COLLECTION_UPDATE_FORM_NAME, data: {} }));
    };

export const updateCollection = (collection: CollectionUpdateFormDialogData) =>
    (dispatch: Dispatch, getState: () => RootState, services: ServiceRepository) => {
        const uuid = collection.uuid || '';
        dispatch(startSubmit(COLLECTION_UPDATE_FORM_NAME));
        dispatch(progressIndicatorActions.START_WORKING(COLLECTION_UPDATE_FORM_NAME));

        const cachedCollection = getResource<CollectionResource>(collection.uuid)(getState().resources);
        services.collectionService.update(uuid, {
            name: collection.name,
            storageClassesDesired: collection.storageClassesDesired,
            description: collection.description }
        ).then(updatedCollection => {
            updatedCollection = {...cachedCollection, ...updatedCollection};
            dispatch(collectionPanelActions.LOAD_COLLECTION_SUCCESS({ item: updatedCollection as CollectionResource }));
            dispatch(dialogActions.CLOSE_DIALOG({ id: COLLECTION_UPDATE_FORM_NAME }));
            dispatch(progressIndicatorActions.STOP_WORKING(COLLECTION_UPDATE_FORM_NAME));
            dispatch(snackbarActions.OPEN_SNACKBAR({
                message: "Collection has been successfully updated.",
                hideDuration: 2000,
                kind: SnackbarKind.SUCCESS
            }));
            dispatch<any>(updateResources([updatedCollection]));
            dispatch<any>(loadDetailsPanel(updatedCollection.uuid));
        }).catch (e => {
            dispatch(progressIndicatorActions.STOP_WORKING(COLLECTION_UPDATE_FORM_NAME));
            const error = getCommonResourceServiceError(e);
            if (error === CommonResourceServiceError.UNIQUE_NAME_VIOLATION) {
                dispatch(stopSubmit(COLLECTION_UPDATE_FORM_NAME, { name: 'Collection with the same name already exists.' } as FormErrors));
            } else {
                dispatch(dialogActions.CLOSE_DIALOG({ id: COLLECTION_UPDATE_FORM_NAME }));
                dispatch(snackbarActions.OPEN_SNACKBAR({
                    message: e.errors.join(''),
                    hideDuration: 2000,
                    kind: SnackbarKind.ERROR }));
                }
            }
        );
    };
