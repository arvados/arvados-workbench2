// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { default as unionize, ofType, UnionOf } from "unionize";
import { Dispatch } from "redux";

import { RootState } from "../../store";
import { ServiceRepository } from "~/services/services";
import { CollectionResource } from '~/models/collection';
import { initialize } from 'redux-form';
import { collectionPanelActions } from "../../collection-panel/collection-panel-action";
import { ContextMenuResource } from "../../context-menu/context-menu-reducer";
import { updateDetails } from "~/store/details-panel/details-panel-action";

export const collectionUpdaterActions = unionize({
    OPEN_COLLECTION_UPDATER: ofType<{ uuid: string }>(),
    CLOSE_COLLECTION_UPDATER: ofType<{}>(),
    UPDATE_COLLECTION_SUCCESS: ofType<{}>(),
}, {
    tag: 'type',
    value: 'payload'
});


export const COLLECTION_FORM_NAME = 'collectionEditDialog';

export const openUpdater = (item: ContextMenuResource) =>
    (dispatch: Dispatch, getState: () => RootState) => {
        if (item) {
            dispatch(collectionUpdaterActions.OPEN_COLLECTION_UPDATER({ uuid: item.uuid }));
            dispatch(initialize(COLLECTION_FORM_NAME, { name: item.name, description: item.description }));
        }
    };

export const updateCollection = (collection: Partial<CollectionResource>) =>
    (dispatch: Dispatch, getState: () => RootState, services: ServiceRepository) => {
        const { uuid } = getState().collections.updater;
        return services.collectionService
            .update(uuid, collection)
            .then(collection => {
                    dispatch(collectionPanelActions.LOAD_COLLECTION_SUCCESS({ item: collection as CollectionResource }));
                    dispatch(collectionUpdaterActions.UPDATE_COLLECTION_SUCCESS());
                    dispatch<any>(updateDetails(collection));
                }
            );
    };

export type CollectionUpdaterAction = UnionOf<typeof collectionUpdaterActions>;