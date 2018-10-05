// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { createStore, applyMiddleware, compose, Middleware, combineReducers, Store, Action, Dispatch } from 'redux';
import { routerMiddleware, routerReducer } from "react-router-redux";
import thunkMiddleware from 'redux-thunk';
import { History } from "history";

import { authReducer } from "./auth/auth-reducer";
import { dataExplorerReducer } from './data-explorer/data-explorer-reducer';
import { detailsPanelReducer } from './details-panel/details-panel-reducer';
import { contextMenuReducer } from './context-menu/context-menu-reducer';
import { reducer as formReducer } from 'redux-form';
import { favoritesReducer } from './favorites/favorites-reducer';
import { snackbarReducer } from './snackbar/snackbar-reducer';
import { collectionPanelFilesReducer } from './collection-panel/collection-panel-files/collection-panel-files-reducer';
import { dataExplorerMiddleware } from "./data-explorer/data-explorer-middleware";
import { FAVORITE_PANEL_ID } from "./favorite-panel/favorite-panel-action";
import { PROJECT_PANEL_ID } from "./project-panel/project-panel-action";
import { ProjectPanelMiddlewareService } from "./project-panel/project-panel-middleware-service";
import { FavoritePanelMiddlewareService } from "./favorite-panel/favorite-panel-middleware-service";
import { collectionPanelReducer } from './collection-panel/collection-panel-reducer';
import { dialogReducer } from './dialog/dialog-reducer';
import { ServiceRepository } from "~/services/services";
import { treePickerReducer } from './tree-picker/tree-picker-reducer';
import { resourcesReducer } from '~/store/resources/resources-reducer';
import { propertiesReducer } from './properties/properties-reducer';
import { RootState } from './store';
import { fileUploaderReducer } from './file-uploader/file-uploader-reducer';
import { TrashPanelMiddlewareService } from "~/store/trash-panel/trash-panel-middleware-service";
import { TRASH_PANEL_ID } from "~/store/trash-panel/trash-panel-action";
import { processLogsPanelReducer } from './process-logs-panel/process-logs-panel-reducer';
import { processPanelReducer } from '~/store/process-panel/process-panel-reducer';
import { SHARED_WITH_ME_PANEL_ID } from '~/store/shared-with-me-panel/shared-with-me-panel-actions';
import { SharedWithMeMiddlewareService } from './shared-with-me-panel/shared-with-me-middleware-service';
import { progressIndicatorReducer } from './progress-indicator/progress-indicator-reducer';
import { runProcessPanelReducer } from '~/store/run-process-panel/run-process-panel-reducer';
import { WorkflowMiddlewareService } from './workflow-panel/workflow-middleware-service';
import { WORKFLOW_PANEL_ID } from './workflow-panel/workflow-panel-actions';
import { fileTreePickerReducer } from './file-tree-picker/file-tree-picker-reducer';
import { structuredSearchReducer } from './structured-search/structured-search-reducer';

const composeEnhancers =
    (process.env.NODE_ENV === 'development' &&
        window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose;

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;

export type RootStore = Store<RootState, Action> & { dispatch: Dispatch<any> };

export function configureStore(history: History, services: ServiceRepository): RootStore {
    const rootReducer = createRootReducer(services);

    const projectPanelMiddleware = dataExplorerMiddleware(
        new ProjectPanelMiddlewareService(services, PROJECT_PANEL_ID)
    );
    const favoritePanelMiddleware = dataExplorerMiddleware(
        new FavoritePanelMiddlewareService(services, FAVORITE_PANEL_ID)
    );
    const trashPanelMiddleware = dataExplorerMiddleware(
        new TrashPanelMiddlewareService(services, TRASH_PANEL_ID)
    );
    const sharedWithMePanelMiddleware = dataExplorerMiddleware(
        new SharedWithMeMiddlewareService(services, SHARED_WITH_ME_PANEL_ID)
    );
    const workflowPanelMiddleware = dataExplorerMiddleware(
        new WorkflowMiddlewareService(services, WORKFLOW_PANEL_ID)
    );

    const middlewares: Middleware[] = [
        routerMiddleware(history),
        thunkMiddleware.withExtraArgument(services),
        projectPanelMiddleware,
        favoritePanelMiddleware,
        trashPanelMiddleware,
        sharedWithMePanelMiddleware,
        workflowPanelMiddleware
    ];
    const enhancer = composeEnhancers(applyMiddleware(...middlewares));
    return createStore(rootReducer, enhancer);
}

const createRootReducer = (services: ServiceRepository) => combineReducers({
    auth: authReducer(services),
    collectionPanel: collectionPanelReducer,
    collectionPanelFiles: collectionPanelFilesReducer,
    contextMenu: contextMenuReducer,
    dataExplorer: dataExplorerReducer,
    detailsPanel: detailsPanelReducer,
    dialog: dialogReducer,
    favorites: favoritesReducer,
    form: formReducer,
    processLogsPanel: processLogsPanelReducer,
    properties: propertiesReducer,
    resources: resourcesReducer,
    router: routerReducer,
    snackbar: snackbarReducer,
    treePicker: treePickerReducer,
    fileUploader: fileUploaderReducer,
    processPanel: processPanelReducer,
    progressIndicator: progressIndicatorReducer,
    fileTreePicker: fileTreePickerReducer,
    runProcessPanel: runProcessPanelReducer,
    structuredSearch: structuredSearchReducer
});
