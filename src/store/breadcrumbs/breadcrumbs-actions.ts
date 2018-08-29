// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { Dispatch } from 'redux';
import { RootState } from '~/store/store';
import { Breadcrumb } from '~/components/breadcrumbs/breadcrumbs';
import { getResource } from '~/store/resources/resources';
import { TreePicker } from '../tree-picker/tree-picker';
import { getSidePanelTreeBranch } from '../side-panel-tree/side-panel-tree-actions';
import { propertiesActions } from '../properties/properties-actions';

export const BREADCRUMBS = 'breadcrumbs';

export interface ResourceBreadcrumb extends Breadcrumb {
    uuid: string;
}

export const setBreadcrumbs = (breadcrumbs: Breadcrumb[]) =>
    propertiesActions.SET_PROPERTY({ key: BREADCRUMBS, value: breadcrumbs });

const getSidePanelTreeBreadcrumbs = (uuid: string) => (treePicker: TreePicker): ResourceBreadcrumb[] => {
    const nodes = getSidePanelTreeBranch(uuid)(treePicker);
    return nodes.map(node =>
        typeof node.value === 'string'
            ? { label: node.value, uuid: node.nodeId }
            : { label: node.value.name, uuid: node.value.uuid });
};

export const setSidePanelBreadcrumbs = (uuid: string) =>
    (dispatch: Dispatch, getState: () => RootState) => {
        const { treePicker } = getState();
        const breadcrumbs = getSidePanelTreeBreadcrumbs(uuid)(treePicker);
        dispatch(setBreadcrumbs(breadcrumbs));
    };

export const setProjectBreadcrumbs = setSidePanelBreadcrumbs;

export const setCollectionBreadcrumbs = (collectionUuid: string) =>
    (dispatch: Dispatch, getState: () => RootState) => {
        const { resources } = getState();
        const collection = getResource(collectionUuid)(resources);
        if (collection) {
            dispatch<any>(setProjectBreadcrumbs(collection.ownerUuid));
        }
    };