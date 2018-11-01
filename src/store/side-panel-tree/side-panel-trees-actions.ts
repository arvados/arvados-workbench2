// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { Dispatch } from 'redux';
import { initSharedProject, initUserProject, receiveTreePickerData } from '../tree-picker/tree-picker-actions';
import { TreeNodeStatus } from '~/models/tree';
import { values, includes, __ } from 'lodash/fp';

export enum SidePanelTreeId {
    HOME = 'sidePanelUserTree',
    SHARED = 'sidePanelSharedTree',
    WORKFLOWS = 'sidePanelWorkflowsTree',
    RECENT = 'sidePanelRecentTree',
    FAVORITES = 'sidePanelFavoritesTree',
    TRASH = 'sidePanelTrashTree',
}

export const isSidePanelTreeId = includes(__, values(SidePanelTreeId));

export const initSidePanelTrees = (dispatch: Dispatch<any>) => {
    dispatch(initUserProject(SidePanelTreeId.HOME));
    dispatch(initSharedProject(SidePanelTreeId.SHARED));
    dispatch(initSidePanelTree(SidePanelTreeId.WORKFLOWS, 'Workflows'));
    dispatch(initSidePanelTree(SidePanelTreeId.RECENT, 'Recently open'));
    dispatch(initSidePanelTree(SidePanelTreeId.FAVORITES, 'Favorites'));
    dispatch(initSidePanelTree(SidePanelTreeId.TRASH, 'Trash'));
};

const initSidePanelTree = (pickerId: string, name: string) =>
    receiveTreePickerData({
        id: '',
        pickerId,
        data: [{ uuid: pickerId, name }],
        extractNodeData: value => ({
            id: value.uuid,
            status: TreeNodeStatus.LOADED,
            value,
        }),
    });
