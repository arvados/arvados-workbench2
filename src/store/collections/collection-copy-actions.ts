// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { Dispatch } from "redux";
import { dialogActions } from "store/dialog/dialog-actions";
import { FormErrors, initialize, startSubmit, stopSubmit } from 'redux-form';
import { resetPickerProjectTree } from 'store/project-tree-picker/project-tree-picker-actions';
import { RootState } from 'store/store';
import { ServiceRepository } from 'services/services';
import { getCommonResourceServiceError, CommonResourceServiceError } from 'services/common-service/common-resource-service';
import { CopyFormDialogData } from 'store/copy-dialog/copy-dialog';
import { progressIndicatorActions } from "store/progress-indicator/progress-indicator-actions";
import { initProjectsTreePicker } from 'store/tree-picker/tree-picker-actions';

export const COLLECTION_COPY_FORM_NAME = 'collectionCopyFormName';

export const openCollectionCopyDialog = (resource: { name: string, uuid: string }) =>
    (dispatch: Dispatch) => {
        dispatch<any>(resetPickerProjectTree());
        dispatch<any>(initProjectsTreePicker(COLLECTION_COPY_FORM_NAME));
        const initialData: CopyFormDialogData = { name: `Copy of: ${resource.name}`, ownerUuid: '', uuid: resource.uuid };
        dispatch<any>(initialize(COLLECTION_COPY_FORM_NAME, initialData));
        dispatch(dialogActions.OPEN_DIALOG({ id: COLLECTION_COPY_FORM_NAME, data: {} }));
    };

export const copyCollection = (resource: CopyFormDialogData) =>
    async (dispatch: Dispatch, getState: () => RootState, services: ServiceRepository) => {
        dispatch(startSubmit(COLLECTION_COPY_FORM_NAME));
        try {
            const collection = await services.collectionService.get(resource.uuid);
            const newCollection = await services.collectionService.create({ ...collection, ownerUuid: resource.ownerUuid, name: resource.name });
            dispatch(dialogActions.CLOSE_DIALOG({ id: COLLECTION_COPY_FORM_NAME }));
            return newCollection;
        } catch (e) {
            const error = getCommonResourceServiceError(e);
            if (error === CommonResourceServiceError.UNIQUE_NAME_VIOLATION) {
                dispatch(stopSubmit(
                    COLLECTION_COPY_FORM_NAME,
                    { ownerUuid: 'A collection with the same name already exists in the target project.' } as FormErrors
                ));
            } else {
                dispatch(dialogActions.CLOSE_DIALOG({ id: COLLECTION_COPY_FORM_NAME }));
                throw new Error('Could not copy the collection.');
            }
            return;
        } finally {
            dispatch(progressIndicatorActions.STOP_WORKING(COLLECTION_COPY_FORM_NAME));
        }
    };
