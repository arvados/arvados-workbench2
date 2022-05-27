// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { Dispatch } from "redux";
import { RootState } from 'store/store';
import { ServiceRepository } from 'services/services';
import { updateResources } from 'store/resources/resources-actions';
import { Process } from './process';
import { dialogActions } from 'store/dialog/dialog-actions';
import { snackbarActions, SnackbarKind } from 'store/snackbar/snackbar-actions';
import { projectPanelActions } from 'store/project-panel/project-panel-action';
import { navigateToRunProcess } from 'store/navigation/navigation-action';
import { goToStep, runProcessPanelActions } from 'store/run-process-panel/run-process-panel-actions';
import { getResource } from 'store/resources/resources';
import { initialize } from "redux-form";
import { RUN_PROCESS_BASIC_FORM, RunProcessBasicFormData } from "views/run-process-panel/run-process-basic-form";
import { RunProcessAdvancedFormData, RUN_PROCESS_ADVANCED_FORM } from "views/run-process-panel/run-process-advanced-form";
import { MOUNT_PATH_CWL_WORKFLOW, MOUNT_PATH_CWL_INPUT } from 'models/process';
import { getWorkflow, getWorkflowInputs } from "models/workflow";
import { ProjectResource } from "models/project";
import { UserResource } from "models/user";

export const loadProcess = (containerRequestUuid: string) =>
    async (dispatch: Dispatch, getState: () => RootState, services: ServiceRepository): Promise<Process> => {
        const containerRequest = await services.containerRequestService.get(containerRequestUuid);
        dispatch<any>(updateResources([containerRequest]));

        if (containerRequest.containerUuid) {
            const container = await services.containerService.get(containerRequest.containerUuid);
            dispatch<any>(updateResources([container]));
            return { containerRequest, container };
        }
        return { containerRequest };
    };

export const loadContainers = (filters: string) =>
    async (dispatch: Dispatch, getState: () => RootState, services: ServiceRepository) => {
        const { items } = await services.containerService.list({ filters });
        dispatch<any>(updateResources(items));
        return items;
    };

export const cancelRunningWorkflow = (uuid: string) =>
    async (dispatch: Dispatch, getState: () => RootState, services: ServiceRepository) => {
        try {
            const process = await services.containerRequestService.update(uuid, { priority: 0 });
            return process;
        } catch (e) {
            throw new Error('Could not cancel the process.');
        }
    };

export const reRunProcess = (processUuid: string, workflowUuid: string) =>
    (dispatch: Dispatch, getState: () => RootState, services: ServiceRepository) => {
        const process = getResource<any>(processUuid)(getState().resources);
        const workflows = getState().runProcessPanel.searchWorkflows;
        const workflow = workflows.find(workflow => workflow.uuid === workflowUuid);
        if (workflow && process) {
            const mainWf = getWorkflow(process.mounts[MOUNT_PATH_CWL_WORKFLOW]);
            if (mainWf) { mainWf.inputs = getInputs(process); }
            const stringifiedDefinition = JSON.stringify(process.mounts[MOUNT_PATH_CWL_WORKFLOW].content);
            const newWorkflow = { ...workflow, definition: stringifiedDefinition };

            const owner = getResource<ProjectResource | UserResource>(workflow.ownerUuid)(getState().resources);
            const basicInitialData: RunProcessBasicFormData = { name: `Copy of: ${process.name}`, description: process.description, owner };
            dispatch<any>(initialize(RUN_PROCESS_BASIC_FORM, basicInitialData));

            const advancedInitialData: RunProcessAdvancedFormData = {
                output: process.outputName,
                runtime: process.schedulingParameters.max_run_time,
                ram: process.runtimeConstraints.ram,
                vcpus: process.runtimeConstraints.vcpus,
                keep_cache_ram: process.runtimeConstraints.keep_cache_ram,
                acr_container_image: process.containerImage
            };
            dispatch<any>(initialize(RUN_PROCESS_ADVANCED_FORM, advancedInitialData));

            dispatch<any>(navigateToRunProcess);
            dispatch<any>(goToStep(1));
            dispatch(runProcessPanelActions.SET_STEP_CHANGED(true));
            dispatch(runProcessPanelActions.SET_SELECTED_WORKFLOW(newWorkflow));
        } else {
            dispatch<any>(snackbarActions.OPEN_SNACKBAR({ message: `You can't re-run this process`, kind: SnackbarKind.ERROR }));
        }
    };

const getInputs = (data: any) => {
    if (!data || !data.mounts || !data.mounts[MOUNT_PATH_CWL_WORKFLOW]) { return []; }
    const inputs = getWorkflowInputs(data.mounts[MOUNT_PATH_CWL_WORKFLOW].content);
    return inputs ? inputs.map(
        (it: any) => (
            {
                type: it.type,
                id: it.id,
                label: it.label,
                default: data.mounts[MOUNT_PATH_CWL_INPUT].content[it.id],
                doc: it.doc
            }
        )
    ) : [];
};

export const openRemoveProcessDialog = (uuid: string) =>
    (dispatch: Dispatch, getState: () => RootState, services: ServiceRepository) => {
        dispatch(dialogActions.OPEN_DIALOG({
            id: REMOVE_PROCESS_DIALOG,
            data: {
                title: 'Remove process permanently',
                text: 'Are you sure you want to remove this process?',
                confirmButtonLabel: 'Remove',
                uuid
            }
        }));
    };

export const REMOVE_PROCESS_DIALOG = 'removeProcessDialog';

export const removeProcessPermanently = (uuid: string) =>
    async (dispatch: Dispatch, getState: () => RootState, services: ServiceRepository) => {
        dispatch(snackbarActions.OPEN_SNACKBAR({ message: 'Removing ...', kind: SnackbarKind.INFO }));
        await services.containerRequestService.delete(uuid);
        dispatch(projectPanelActions.REQUEST_ITEMS());
        dispatch(snackbarActions.OPEN_SNACKBAR({ message: 'Removed.', hideDuration: 2000, kind: SnackbarKind.SUCCESS }));
    };
