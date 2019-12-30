// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { Dispatch, compose, AnyAction } from 'redux';
import { push } from "react-router-redux";
import { ResourceKind, extractUuidKind } from '~/models/resource';
import { SidePanelTreeCategory } from '../side-panel-tree/side-panel-tree-actions';
import { Routes, getProcessLogUrl, getGroupUrl, getNavUrl } from '~/routes/routes';
import { RootState } from '~/store/store';
import { ServiceRepository } from '~/services/services';
import { GROUPS_PANEL_LABEL } from '~/store/breadcrumbs/breadcrumbs-actions';

export const navigateTo = (uuid: string) =>
    async (dispatch: Dispatch, getState: () => RootState) => {
        const kind = extractUuidKind(uuid);

        switch (kind) {
            case ResourceKind.PROJECT:
            case ResourceKind.USER:
            case ResourceKind.COLLECTION:
            case ResourceKind.CONTAINER_REQUEST:
                dispatch<any>(pushOrGoto(getNavUrl(uuid, getState().auth)));
                return;
            case ResourceKind.VIRTUAL_MACHINE:
                dispatch<any>(navigateToAdminVirtualMachines);
                return;
        }

        switch (uuid) {
            case SidePanelTreeCategory.FAVORITES:
                dispatch<any>(navigateToFavorites);
                return;
            case SidePanelTreeCategory.PUBLIC_FAVORITES:
                dispatch(navigateToPublicFavorites);
                return;
            case SidePanelTreeCategory.SHARED_WITH_ME:
                dispatch(navigateToSharedWithMe);
                return;
            case SidePanelTreeCategory.WORKFLOWS:
                dispatch(navigateToWorkflows);
                return;
            case SidePanelTreeCategory.TRASH:
                dispatch(navigateToTrash);
                return;
            case GROUPS_PANEL_LABEL:
                dispatch(navigateToGroups);
                return;
            case SidePanelTreeCategory.ALL_PROCESSES:
                dispatch(navigateToAllProcesses);
                return;
        }
    };

export const navigateToRoot = push(Routes.ROOT);

export const navigateToFavorites = push(Routes.FAVORITES);

export const navigateToTrash = push(Routes.TRASH);

export const navigateToPublicFavorites = push(Routes.PUBLIC_FAVORITES);

export const navigateToWorkflows = push(Routes.WORKFLOWS);

export const pushOrGoto = (url: string): AnyAction => {
    if (url === "") {
        return { type: "noop" };
    } else if (url[0] === '/') {
        return push(url);
    } else {
        window.location.href = url;
        return { type: "noop" };
    }
};


export const navigateToProcessLogs = compose(push, getProcessLogUrl);

export const navigateToRootProject = (dispatch: Dispatch, getState: () => RootState, services: ServiceRepository) => {
    const usr = getState().auth.user;
    if (usr) {
        dispatch<any>(navigateTo(usr.uuid));
    }
};

export const navigateToSharedWithMe = push(Routes.SHARED_WITH_ME);

export const navigateToRunProcess = push(Routes.RUN_PROCESS);

export const navigateToSearchResults = (searchValue: string) => {
    if (searchValue !== "") {
        return push({ pathname: Routes.SEARCH_RESULTS, search: '?q=' + encodeURIComponent(searchValue) });
    } else {
        return push({ pathname: Routes.SEARCH_RESULTS });
    }
};

export const navigateToUserVirtualMachines = push(Routes.VIRTUAL_MACHINES_USER);

export const navigateToAdminVirtualMachines = push(Routes.VIRTUAL_MACHINES_ADMIN);

export const navigateToRepositories = push(Routes.REPOSITORIES);

export const navigateToSshKeysAdmin = push(Routes.SSH_KEYS_ADMIN);

export const navigateToSshKeysUser = push(Routes.SSH_KEYS_USER);

export const navigateToSiteManager = push(Routes.SITE_MANAGER);

export const navigateToMyAccount = push(Routes.MY_ACCOUNT);

export const navigateToLinkAccount = push(Routes.LINK_ACCOUNT);

export const navigateToKeepServices = push(Routes.KEEP_SERVICES);

export const navigateToComputeNodes = push(Routes.COMPUTE_NODES);

export const navigateToUsers = push(Routes.USERS);

export const navigateToApiClientAuthorizations = push(Routes.API_CLIENT_AUTHORIZATIONS);

export const navigateToGroups = push(Routes.GROUPS);

export const navigateToGroupDetails = compose(push, getGroupUrl);

export const navigateToLinks = push(Routes.LINKS);

export const navigateToCollectionsContentAddress = push(Routes.COLLECTIONS_CONTENT_ADDRESS);

export const navigateToAllProcesses = push(Routes.ALL_PROCESSES);
