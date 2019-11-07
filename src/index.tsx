// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from "react-redux";
import { MainPanel } from '~/views/main-panel/main-panel';
import '~/index.css';
import { Route, Switch } from 'react-router';
import createBrowserHistory from "history/createBrowserHistory";
import { History } from "history";
import { configureStore, RootStore } from '~/store/store';
import { ConnectedRouter } from "react-router-redux";
import { ApiToken } from "~/views-components/api-token/api-token";
import { initAuth } from "~/store/auth/auth-action";
import { createServices } from "~/services/services";
import { MuiThemeProvider } from '@material-ui/core/styles';
import { CustomTheme } from '~/common/custom-theme';
import { fetchConfig } from '~/common/config';
import { addMenuActionSet, ContextMenuKind } from '~/views-components/context-menu/context-menu';
import { rootProjectActionSet } from "~/views-components/context-menu/action-sets/root-project-action-set";
import { projectActionSet } from "~/views-components/context-menu/action-sets/project-action-set";
import { resourceActionSet } from '~/views-components/context-menu/action-sets/resource-action-set';
import { favoriteActionSet } from "~/views-components/context-menu/action-sets/favorite-action-set";
import { collectionFilesActionSet } from '~/views-components/context-menu/action-sets/collection-files-action-set';
import { collectionFilesItemActionSet } from '~/views-components/context-menu/action-sets/collection-files-item-action-set';
import { collectionFilesNotSelectedActionSet } from '~/views-components/context-menu/action-sets/collection-files-not-selected-action-set';
import { collectionActionSet } from '~/views-components/context-menu/action-sets/collection-action-set';
import { collectionResourceActionSet } from '~/views-components/context-menu/action-sets/collection-resource-action-set';
import { processActionSet } from '~/views-components/context-menu/action-sets/process-action-set';
import { loadWorkbench } from '~/store/workbench/workbench-actions';
import { Routes } from '~/routes/routes';
import { trashActionSet } from "~/views-components/context-menu/action-sets/trash-action-set";
import { ServiceRepository } from '~/services/services';
import { initWebSocket } from '~/websocket/websocket';
import { Config } from '~/common/config';
import { addRouteChangeHandlers } from './routes/route-change-handlers';
import { setCurrentTokenDialogApiHost } from '~/store/current-token-dialog/current-token-dialog-actions';
import { processResourceActionSet } from '~/views-components/context-menu/action-sets/process-resource-action-set';
import { progressIndicatorActions } from '~/store/progress-indicator/progress-indicator-actions';
import { trashedCollectionActionSet } from '~/views-components/context-menu/action-sets/trashed-collection-action-set';
import { setBuildInfo } from '~/store/app-info/app-info-actions';
import { getBuildInfo } from '~/common/app-info';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { initAdvanceFormProjectsTree } from '~/store/search-bar/search-bar-actions';
import { repositoryActionSet } from '~/views-components/context-menu/action-sets/repository-action-set';
import { sshKeyActionSet } from '~/views-components/context-menu/action-sets/ssh-key-action-set';
import { keepServiceActionSet } from '~/views-components/context-menu/action-sets/keep-service-action-set';
import { loadVocabulary } from '~/store/vocabulary/vocabulary-actions';
import { virtualMachineActionSet } from '~/views-components/context-menu/action-sets/virtual-machine-action-set';
import { userActionSet } from '~/views-components/context-menu/action-sets/user-action-set';
import { computeNodeActionSet } from '~/views-components/context-menu/action-sets/compute-node-action-set';
import { apiClientAuthorizationActionSet } from '~/views-components/context-menu/action-sets/api-client-authorization-action-set';
import { groupActionSet } from '~/views-components/context-menu/action-sets/group-action-set';
import { groupMemberActionSet } from '~/views-components/context-menu/action-sets/group-member-action-set';
import { linkActionSet } from '~/views-components/context-menu/action-sets/link-action-set';
import { loadFileViewersConfig } from '~/store/file-viewers/file-viewers-actions';
import { collectionAdminActionSet } from '~/views-components/context-menu/action-sets/collection-admin-action-set';
import { processResourceAdminActionSet } from '~/views-components/context-menu/action-sets/process-resource-admin-action-set';
import { projectAdminActionSet } from '~/views-components/context-menu/action-sets/project-admin-action-set';

console.log(`Starting arvados [${getBuildInfo()}]`);

addMenuActionSet(ContextMenuKind.ROOT_PROJECT, rootProjectActionSet);
addMenuActionSet(ContextMenuKind.PROJECT, projectActionSet);
addMenuActionSet(ContextMenuKind.RESOURCE, resourceActionSet);
addMenuActionSet(ContextMenuKind.FAVORITE, favoriteActionSet);
addMenuActionSet(ContextMenuKind.COLLECTION_FILES, collectionFilesActionSet);
addMenuActionSet(ContextMenuKind.COLLECTION_FILES_NOT_SELECTED, collectionFilesNotSelectedActionSet);
addMenuActionSet(ContextMenuKind.COLLECTION_FILES_ITEM, collectionFilesItemActionSet);
addMenuActionSet(ContextMenuKind.COLLECTION, collectionActionSet);
addMenuActionSet(ContextMenuKind.COLLECTION_RESOURCE, collectionResourceActionSet);
addMenuActionSet(ContextMenuKind.TRASHED_COLLECTION, trashedCollectionActionSet);
addMenuActionSet(ContextMenuKind.PROCESS, processActionSet);
addMenuActionSet(ContextMenuKind.PROCESS_RESOURCE, processResourceActionSet);
addMenuActionSet(ContextMenuKind.TRASH, trashActionSet);
addMenuActionSet(ContextMenuKind.REPOSITORY, repositoryActionSet);
addMenuActionSet(ContextMenuKind.SSH_KEY, sshKeyActionSet);
addMenuActionSet(ContextMenuKind.VIRTUAL_MACHINE, virtualMachineActionSet);
addMenuActionSet(ContextMenuKind.KEEP_SERVICE, keepServiceActionSet);
addMenuActionSet(ContextMenuKind.USER, userActionSet);
addMenuActionSet(ContextMenuKind.LINK, linkActionSet);
addMenuActionSet(ContextMenuKind.NODE, computeNodeActionSet);
addMenuActionSet(ContextMenuKind.API_CLIENT_AUTHORIZATION, apiClientAuthorizationActionSet);
addMenuActionSet(ContextMenuKind.GROUPS, groupActionSet);
addMenuActionSet(ContextMenuKind.GROUP_MEMBER, groupMemberActionSet);
addMenuActionSet(ContextMenuKind.COLLECTION_ADMIN, collectionAdminActionSet);
addMenuActionSet(ContextMenuKind.PROCESS_ADMIN, processResourceAdminActionSet);
addMenuActionSet(ContextMenuKind.PROJECT_ADMIN, projectAdminActionSet);

fetchConfig()
    .then(({ config, apiHost }) => {
        const history = createBrowserHistory();
        const services = createServices(config, {
            progressFn: (id, working) => {
                store.dispatch(progressIndicatorActions.TOGGLE_WORKING({ id, working }));
            },
            errorFn: (id, error) => {
                // console.error("Backend error:", error);
                // store.dispatch(snackbarActions.OPEN_SNACKBAR({ message: "Backend error", kind: SnackbarKind.ERROR }));
            }
        });
        const store = configureStore(history, services);

        store.subscribe(initListener(history, store, services, config));
        store.dispatch(initAuth(config));
        store.dispatch(setBuildInfo());
        store.dispatch(setCurrentTokenDialogApiHost(apiHost));
        store.dispatch(loadVocabulary);
        store.dispatch(loadFileViewersConfig);

        const TokenComponent = (props: any) => <ApiToken authService={services.authService} config={config} loadMainApp={true} {...props} />;
        const FedTokenComponent = (props: any) => <ApiToken authService={services.authService} config={config} loadMainApp={false} {...props} />;
        const MainPanelComponent = (props: any) => <MainPanel {...props} />;

        const App = () =>
            <MuiThemeProvider theme={CustomTheme}>
                <DragDropContextProvider backend={HTML5Backend}>
                    <Provider store={store}>
                        <ConnectedRouter history={history}>
                            <Switch>
                                <Route path={Routes.TOKEN} component={TokenComponent} />
                                <Route path={Routes.FED_LOGIN} component={FedTokenComponent} />
                                <Route path={Routes.ROOT} component={MainPanelComponent} />
                            </Switch>
                        </ConnectedRouter>
                    </Provider>
                </DragDropContextProvider>
            </MuiThemeProvider>;

        ReactDOM.render(
            <App />,
            document.getElementById('root') as HTMLElement
        );
    });

const initListener = (history: History, store: RootStore, services: ServiceRepository, config: Config) => {
    let initialized = false;
    return async () => {
        const { router, auth } = store.getState();
        if (router.location && auth.user && !initialized) {
            initialized = true;
            initWebSocket(config, services.authService, store);
            await store.dispatch(loadWorkbench());
            addRouteChangeHandlers(history, store);
            // ToDo: move to searchBar component
            store.dispatch(initAdvanceFormProjectsTree());
        }
    };
};

// force build comment #1
