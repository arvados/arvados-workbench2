// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import React from "react";
import { connect } from "react-redux";
import { StyleRulesCallback, withStyles, WithStyles, Toolbar, Tooltip, IconButton } from "@material-ui/core";
import { ArvadosTheme } from "common/custom-theme";
import { RootState } from "store/store";
import { Dispatch } from "redux";
import { TCheckedList } from "components/data-table/data-table";
import { ContextMenuResource } from "store/context-menu/context-menu-actions";
import { Resource, ResourceKind, extractUuidKind } from "models/resource";
import { getResource } from "store/resources/resources";
import { ResourcesState } from "store/resources/resources";
import { MultiSelectMenuAction, MultiSelectMenuActionSet, MultiSelectMenuActionNames } from "views-components/multiselect-toolbar/ms-menu-actions";
import { ContextMenuAction } from "views-components/context-menu/context-menu-action-set";
import { multiselectActionsFilters, TMultiselectActionsFilters, msMenuResourceKind } from "./ms-toolbar-action-filters";
import { kindToActionSet, findActionByName } from "./ms-kind-action-differentiator";
import { msToggleTrashAction } from "views-components/multiselect-toolbar/ms-project-action-set";
import { copyToClipboardAction } from "store/open-in-new-tab/open-in-new-tab.actions";
import { ContainerRequestResource } from "models/container-request";
import { FavoritesState } from "store/favorites/favorites-reducer";
import { resourceIsFrozen } from "common/frozen-resources";
import { getResourceWithEditableStatus } from "store/resources/resources";
import { GroupResource } from "models/group";
import { EditableResource } from "models/resource";
import { User } from "models/user";
import { GroupClass } from "models/group";
import { isProcessCancelable } from "store/processes/process";
import { CollectionResource } from "models/collection";
import { getProcess } from "store/processes/process";
import { Process } from "store/processes/process";
import { PublicFavoritesState } from "store/public-favorites/public-favorites-reducer";

type CssRules = "root" | "button" | "iconContainer";

const styles: StyleRulesCallback<CssRules> = (theme: ArvadosTheme) => ({
    root: {
        display: "flex",
        flexDirection: "row",
        width: 0,
        padding: 0,
        margin: "1rem auto auto 0.5rem",
        overflowY: 'scroll',
        transition: "width 150ms",
    },
    button: {
        width: "2.5rem",
        height: "2.5rem ",
    },
    iconContainer: {
        height: '100%'
    }
});

export type MultiselectToolbarProps = {
    checkedList: TCheckedList;
    singleSelectedUuid: string | null
    iconProps: IconProps
    user: User | null
    disabledButtons: Set<string>
    executeMulti: (action: ContextMenuAction, checkedList: TCheckedList, resources: ResourcesState) => void;
};

type IconProps = {
    resources: ResourcesState;
    favorites: FavoritesState;
    publicFavorites: PublicFavoritesState;
}

export const MultiselectToolbar = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    withStyles(styles)((props: MultiselectToolbarProps & WithStyles<CssRules>) => {
        const { classes, checkedList, singleSelectedUuid, iconProps, user , disabledButtons} = props;
        const singleResourceKind = singleSelectedUuid ? [resourceToMsResourceKind(singleSelectedUuid, iconProps.resources, user)] : null
        const currentResourceKinds = singleResourceKind ? singleResourceKind : Array.from(selectedToKindSet(checkedList));
        const currentPathIsTrash = window.location.pathname === "/trash";
        
        const actions =
        currentPathIsTrash && selectedToKindSet(checkedList).size
        ? [msToggleTrashAction]
        : selectActionsByKind(currentResourceKinds as string[], multiselectActionsFilters)
        .filter((action) => (singleSelectedUuid === null ? action.isForMulti : true));
        
        return (
            <React.Fragment>
                <Toolbar
                    className={classes.root}
                    style={{ width: `${(actions.length * 2.5) + 1}rem` }}
                    >
                    {actions.length ? (
                        actions.map((action, i) =>
                        action.hasAlts ? (
                            <Tooltip
                            className={classes.button}
                            title={currentPathIsTrash || action.useAlts(singleSelectedUuid, iconProps) ? action.altName : action.name}
                            key={i}
                            disableFocusListener
                            >
                                    <span className={classes.iconContainer}>
                                        <IconButton disabled={disabledButtons.has(action.name)} onClick={() => props.executeMulti(action, checkedList, iconProps.resources)}>
                                            {currentPathIsTrash || action.useAlts(singleSelectedUuid, iconProps) ? action.altIcon && action.altIcon({}) :  action.icon({})}
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            ) : (
                                <Tooltip
                                    className={classes.button}
                                    title={action.name}
                                    key={i}
                                    disableFocusListener
                                >
                                    <span className={classes.iconContainer}>
                                        <IconButton onClick={() => props.executeMulti(action, checkedList, iconProps.resources)}>{action.icon({})}</IconButton>
                                    </span>
                                </Tooltip>
                            )
                        )
                    ) : (
                        <></>
                    )}
                </Toolbar>
            </React.Fragment>
        )
    })
);

export function selectedToArray(checkedList: TCheckedList): Array<string> {
    const arrayifiedSelectedList: Array<string> = [];
    for (const [key, value] of Object.entries(checkedList)) {
        if (value === true) {
            arrayifiedSelectedList.push(key);
        }
    }
    return arrayifiedSelectedList;
}

export function selectedToKindSet(checkedList: TCheckedList): Set<string> {
    const setifiedList = new Set<string>();
    for (const [key, value] of Object.entries(checkedList)) {
        if (value === true) {
            setifiedList.add(extractUuidKind(key) as string);
        }
    }
    return setifiedList;
}

function groupByKind(checkedList: TCheckedList, resources: ResourcesState): Record<string, ContextMenuResource[]> {
    const result = {};
    selectedToArray(checkedList).forEach(uuid => {
        const resource = getResource(uuid)(resources) as ContainerRequestResource | Resource;
        if (!result[resource.kind]) result[resource.kind] = [];
        result[resource.kind].push(resource);
    });
    return result;
}

function filterActions(actionArray: MultiSelectMenuActionSet, filters: Set<string>): Array<MultiSelectMenuAction> {
    return actionArray[0].filter(action => filters.has(action.name as string));
}

const resourceToMsResourceKind = (uuid: string, resources: ResourcesState, user: User | null, readonly = false): (msMenuResourceKind | ResourceKind) | undefined => {
    if (!user) return;
    const resource = getResourceWithEditableStatus<GroupResource & EditableResource>(uuid, user.uuid)(resources);
    const { isAdmin } = user;
    const kind = extractUuidKind(uuid);

    const isFrozen = resourceIsFrozen(resource, resources);
    const isEditable = (user.isAdmin || (resource || ({} as EditableResource)).isEditable) && !readonly && !isFrozen;

    switch (kind) {
        case ResourceKind.PROJECT:
            if (isFrozen) {
                return isAdmin ? msMenuResourceKind.FROZEN_PROJECT_ADMIN : msMenuResourceKind.FROZEN_PROJECT;
            }

            return isAdmin && !readonly
                ? resource && resource.groupClass !== GroupClass.FILTER
                    ? msMenuResourceKind.PROJECT_ADMIN
                    : msMenuResourceKind.FILTER_GROUP_ADMIN
                : isEditable
                ? resource && resource.groupClass !== GroupClass.FILTER
                    ? msMenuResourceKind.PROJECT
                    : msMenuResourceKind.FILTER_GROUP
                : msMenuResourceKind.READONLY_PROJECT;
        case ResourceKind.COLLECTION:
            const c = getResource<CollectionResource>(uuid)(resources);
            if (c === undefined) {
                return;
            }
            const isOldVersion = c.uuid !== c.currentVersionUuid;
            const isTrashed = c.isTrashed;
            return isOldVersion
                ? msMenuResourceKind.OLD_VERSION_COLLECTION
                : isTrashed && isEditable
                ? msMenuResourceKind.TRASHED_COLLECTION
                : isAdmin && isEditable
                ? msMenuResourceKind.COLLECTION_ADMIN
                : isEditable
                ? msMenuResourceKind.COLLECTION
                : msMenuResourceKind.READONLY_COLLECTION;
        case ResourceKind.PROCESS:
            return isAdmin && isEditable
                ? resource && isProcessCancelable(getProcess(resource.uuid)(resources) as Process)
                    ? msMenuResourceKind.RUNNING_PROCESS_ADMIN
                    : msMenuResourceKind.PROCESS_ADMIN
                : readonly
                ? msMenuResourceKind.READONLY_PROCESS_RESOURCE
                : resource && isProcessCancelable(getProcess(resource.uuid)(resources) as Process)
                ? msMenuResourceKind.RUNNING_PROCESS_RESOURCE
                : msMenuResourceKind.PROCESS_RESOURCE;
        case ResourceKind.USER:
            return msMenuResourceKind.ROOT_PROJECT;
        case ResourceKind.LINK:
            return msMenuResourceKind.LINK;
        case ResourceKind.WORKFLOW:
            return isEditable ? msMenuResourceKind.WORKFLOW : msMenuResourceKind.READONLY_WORKFLOW;
        default:
            return;
    }
}; 

function selectActionsByKind(currentResourceKinds: Array<string>, filterSet: TMultiselectActionsFilters) {
    const rawResult: Set<MultiSelectMenuAction> = new Set();
    const resultNames = new Set();
    const allFiltersArray: MultiSelectMenuAction[][] = []
    currentResourceKinds.forEach(kind => {
        if (filterSet[kind]) {
            const actions = filterActions(...filterSet[kind]);
            allFiltersArray.push(actions);
            actions.forEach(action => {
                if (!resultNames.has(action.name)) {
                    rawResult.add(action);
                    resultNames.add(action.name);
                }
            });
        }
    });

    const filteredNameSet = allFiltersArray.map(filterArray => {
        const resultSet = new Set<string>();
        filterArray.forEach(action => resultSet.add(action.name as string || ""));
        return resultSet;
    });

    const filteredResult = Array.from(rawResult).filter(action => {
        for (let i = 0; i < filteredNameSet.length; i++) {
            if (!filteredNameSet[i].has(action.name as string)) return false;
        }
        return true;
    });

    return filteredResult.sort((a, b) => {
        const nameA = a.name || "";
        const nameB = b.name || "";
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    });
}

export const isExactlyOneSelected = (checkedList: TCheckedList) => {
    let tally = 0;
    let current = '';
    for (const uuid in checkedList) {
        if (checkedList[uuid] === true) {
            tally++;
            current = uuid;
        }
    }
    return tally === 1 ? current : null
};

//--------------------------------------------------//

function mapStateToProps({auth, multiselect, resources, favorites, publicFavorites}: RootState) {
    return {
        checkedList: multiselect.checkedList as TCheckedList,
        singleSelectedUuid: isExactlyOneSelected(multiselect.checkedList),
        user: auth && auth.user ? auth.user : null,
        disabledButtons: new Set<string>(multiselect.disabledButtons),
        iconProps: {
            resources,
            favorites,
            publicFavorites
        }
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        executeMulti: (selectedAction: ContextMenuAction, checkedList: TCheckedList, resources: ResourcesState): void => {
            const kindGroups = groupByKind(checkedList, resources);
            switch (selectedAction.name) {
                case MultiSelectMenuActionNames.MOVE_TO:
                case MultiSelectMenuActionNames.REMOVE:
                    const firstResource = getResource(selectedToArray(checkedList)[0])(resources) as ContainerRequestResource | Resource;
                    const action = findActionByName(selectedAction.name as string, kindToActionSet[firstResource.kind]);
                    if (action) action.execute(dispatch, kindGroups[firstResource.kind]);
                    break;
                case MultiSelectMenuActionNames.COPY_TO_CLIPBOARD:
                    const selectedResources = selectedToArray(checkedList).map(uuid => getResource(uuid)(resources));
                    dispatch<any>(copyToClipboardAction(selectedResources));
                    break;
                default:
                    for (const kind in kindGroups) {
                        const action = findActionByName(selectedAction.name as string, kindToActionSet[kind]);
                        if (action) action.execute(dispatch, kindGroups[kind]);
                    }
                    break;
            }
        },
    };
}
