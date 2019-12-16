// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { Dispatch, MiddlewareAPI } from "redux";
import { DataExplorerMiddlewareService, listResultsToDataExplorerItemsMeta } from "~/store/data-explorer/data-explorer-middleware-service";
import { RootState } from "~/store/store";
import { ServiceRepository } from "~/services/services";
import { snackbarActions, SnackbarKind } from '~/store/snackbar/snackbar-actions';
import { getDataExplorer } from "~/store/data-explorer/data-explorer-reducer";
import { FilterBuilder } from '~/services/api/filter-builder';
import { updateResources } from '~/store/resources/resources-actions';
import { getCurrentGroupDetailsPanelUuid, GroupDetailsPanelActions } from '~/store/group-details-panel/group-details-panel-actions';
import { LinkClass } from '~/models/link';

export class GroupDetailsPanelMiddlewareService extends DataExplorerMiddlewareService {

    constructor(private services: ServiceRepository, id: string) {
        super(id);
    }

    async requestItems(api: MiddlewareAPI<Dispatch, RootState>) {

        const dataExplorer = getDataExplorer(api.getState().dataExplorer, this.getId());
        const groupUuid = getCurrentGroupDetailsPanelUuid(api.getState().properties);

        if (!dataExplorer || !groupUuid) {

            api.dispatch(groupsDetailsPanelDataExplorerIsNotSet());

        } else {

            try {

                const permissions = await this.services.permissionService.list({

                    filters: new FilterBuilder()
                        .addEqual('tail_uuid', groupUuid)
                        .addEqual('link_class', LinkClass.PERMISSION)
                        .getFilters()

                });

                api.dispatch(updateResources(permissions.items));

                const users = await this.services.userService.list({

                    filters: new FilterBuilder()
                        .addIn('uuid', permissions.items.map(item => item.headUuid))
                        .getFilters()

                });

                api.dispatch(GroupDetailsPanelActions.SET_ITEMS({
                    ...listResultsToDataExplorerItemsMeta(permissions),
                    items: users.items.map(item => item.uuid),
                }));

                api.dispatch(updateResources(users.items));

            } catch (e) {

                api.dispatch(couldNotFetchGroupDetailsContents());

            }
        }
    }
}

const groupsDetailsPanelDataExplorerIsNotSet = () =>
    snackbarActions.OPEN_SNACKBAR({
        message: 'Group details panel is not ready.',
        kind: SnackbarKind.ERROR
    });

const couldNotFetchGroupDetailsContents = () =>
    snackbarActions.OPEN_SNACKBAR({
        message: 'Could not fetch group details.',
        kind: SnackbarKind.ERROR
    });
