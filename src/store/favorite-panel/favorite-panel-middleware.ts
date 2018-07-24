// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { Middleware } from "redux";
import { dataExplorerActions } from "../data-explorer/data-explorer-action";
import { favoriteService } from "../../services/services";
import { RootState } from "../store";
import { getDataExplorer } from "../data-explorer/data-explorer-reducer";
import { FilterBuilder } from "../../common/api/filter-builder";
import { DataColumns } from "../../components/data-table/data-table";
import { ProcessResource } from "../../models/process";
import { OrderBuilder } from "../../common/api/order-builder";
import { GroupContentsResourcePrefix } from "../../services/groups-service/groups-service";
import { SortDirection } from "../../components/data-table/data-column";
import {
    columns,
    FAVORITE_PANEL_ID,
    FavoritePanelColumnNames,
    FavoritePanelFilter
} from "../../views/favorite-panel/favorite-panel";
import { FavoritePanelItem, resourceToDataItem } from "../../views/favorite-panel/favorite-panel-item";
import { LinkResource } from "../../models/link";

export const favoritePanelMiddleware: Middleware = store => next => {
    next(dataExplorerActions.SET_COLUMNS({ id: FAVORITE_PANEL_ID, columns }));

    return action => {

        const handlePanelAction = <T extends { id: string }>(handler: (data: T) => void) =>
            (data: T) => {
                next(action);
                if (data.id === FAVORITE_PANEL_ID) {
                    handler(data);
                }
            };

        dataExplorerActions.match(action, {
            SET_PAGE: handlePanelAction(() => {
                store.dispatch(dataExplorerActions.REQUEST_ITEMS({ id: FAVORITE_PANEL_ID }));
            }),
            SET_ROWS_PER_PAGE: handlePanelAction(() => {
                store.dispatch(dataExplorerActions.REQUEST_ITEMS({ id: FAVORITE_PANEL_ID }));
            }),
            SET_FILTERS: handlePanelAction(() => {
                store.dispatch(dataExplorerActions.RESET_PAGINATION({ id: FAVORITE_PANEL_ID }));
                store.dispatch(dataExplorerActions.REQUEST_ITEMS({ id: FAVORITE_PANEL_ID }));
            }),
            TOGGLE_SORT: handlePanelAction(() => {
                store.dispatch(dataExplorerActions.REQUEST_ITEMS({ id: FAVORITE_PANEL_ID }));
            }),
            SET_SEARCH_VALUE: handlePanelAction(() => {
                store.dispatch(dataExplorerActions.RESET_PAGINATION({ id: FAVORITE_PANEL_ID }));
                store.dispatch(dataExplorerActions.REQUEST_ITEMS({ id: FAVORITE_PANEL_ID }));
            }),
            REQUEST_ITEMS: handlePanelAction(() => {
                const state = store.getState() as RootState;
                const dataExplorer = getDataExplorer(state.dataExplorer, FAVORITE_PANEL_ID);
                const columns = dataExplorer.columns as DataColumns<FavoritePanelItem, FavoritePanelFilter>;
                const typeFilters = getColumnFilters(columns, FavoritePanelColumnNames.TYPE);
                const statusFilters = getColumnFilters(columns, FavoritePanelColumnNames.STATUS);
                const sortColumn = dataExplorer.columns.find(({ sortDirection }) => Boolean(sortDirection && sortDirection !== "none"));
                const sortDirection = sortColumn && sortColumn.sortDirection === SortDirection.Asc ? SortDirection.Asc : SortDirection.Desc;
                if (typeFilters.length > 0) {
                    favoriteService
                        .list(state.projects.currentItemId, {
                            limit: dataExplorer.rowsPerPage,
                            offset: dataExplorer.page * dataExplorer.rowsPerPage,
                            order: sortColumn
                                ? sortColumn.name === FavoritePanelColumnNames.NAME
                                    ? getOrder("name", sortDirection)
                                    : getOrder("createdAt", sortDirection)
                                : OrderBuilder.create(),
                            filters: FilterBuilder
                                .create()
                                .concat(FilterBuilder
                                    .create()
                                    .addIsA("uuid", typeFilters.map(f => f.type)))
                                .concat(FilterBuilder
                                    .create<ProcessResource>(GroupContentsResourcePrefix.Process)
                                    .addIn("state", statusFilters.map(f => f.type)))
                                .concat(getSearchFilter(dataExplorer.searchValue))
                        })
                        .then(response => {
                            store.dispatch(dataExplorerActions.SET_ITEMS({
                                id: FAVORITE_PANEL_ID,
                                items: response.items.map(resourceToDataItem),
                                itemsAvailable: response.itemsAvailable,
                                page: Math.floor(response.offset / response.limit),
                                rowsPerPage: response.limit
                            }));
                        });
                } else {
                    store.dispatch(dataExplorerActions.SET_ITEMS({
                        id: FAVORITE_PANEL_ID,
                        items: [],
                        itemsAvailable: 0,
                        page: 0,
                        rowsPerPage: dataExplorer.rowsPerPage
                    }));
                }
            }),
            default: () => next(action)
        });
    };
};

const getColumnFilters = (columns: DataColumns<FavoritePanelItem, FavoritePanelFilter>, columnName: string) => {
    const column = columns.find(c => c.name === columnName);
    return column && column.filters ? column.filters.filter(f => f.selected) : [];
};

const getOrder = (attribute: "name" | "createdAt", direction: SortDirection) =>
    [
        OrderBuilder.create<LinkResource>(GroupContentsResourcePrefix.Collection),
        OrderBuilder.create<LinkResource>(GroupContentsResourcePrefix.Process),
        OrderBuilder.create<LinkResource>(GroupContentsResourcePrefix.Project)
    ].reduce((acc, b) =>
        acc.concat(direction === SortDirection.Asc
            ? b.addAsc(attribute)
            : b.addDesc(attribute)), OrderBuilder.create());

const getSearchFilter = (searchValue: string) =>
    searchValue
        ? [
            FilterBuilder.create<LinkResource>(GroupContentsResourcePrefix.Collection),
            FilterBuilder.create<LinkResource>(GroupContentsResourcePrefix.Process),
            FilterBuilder.create<LinkResource>(GroupContentsResourcePrefix.Project)]
            .reduce((acc, b) =>
                acc.concat(b.addILike("name", searchValue)), FilterBuilder.create())
        : FilterBuilder.create();


