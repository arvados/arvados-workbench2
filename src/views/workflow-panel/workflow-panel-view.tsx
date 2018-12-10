// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import * as React from 'react';
import { DataExplorer } from "~/views-components/data-explorer/data-explorer";
import { WorkflowIcon } from '~/components/icon/icon';
import { DataTableDefaultView } from '~/components/data-table-default-view/data-table-default-view';
import { WORKFLOW_PANEL_ID } from '~/store/workflow-panel/workflow-panel-actions';
import {
    ResourceLastModifiedDate,
    RosurceWorkflowName,
    ResourceWorkflowStatus,
    ResourceShare,
    ResourceRunProcess
} from "~/views-components/data-explorer/renderers";
import { SortDirection } from '~/components/data-table/data-column';
import { DataColumns } from '~/components/data-table/data-table';
import { DataTableFilterItem } from '~/components/data-table-filters/data-table-filters';
import { Grid, Paper } from '@material-ui/core';
import { WorkflowDetailsCard } from './workflow-description-card';
import { WorkflowResource } from '~/models/workflow';
import { createTree } from '~/models/tree';

export enum WorkflowPanelColumnNames {
    NAME = "Name",
    AUTHORISATION = "Authorisation",
    LAST_MODIFIED = "Last modified",
    SHARE = 'Share'
}

export interface WorkflowPanelFilter extends DataTableFilterItem {
    type: ResourceStatus;
}

export interface WorkflowPanelDataProps {
    workflow?: WorkflowResource;
}

export interface WorfklowPanelActionProps {
    handleRowDoubleClick: (workflowUuid: string) => void;
    handleRowClick: (workflowUuid: string) => void;
}

export type WorkflowPanelProps = WorkflowPanelDataProps & WorfklowPanelActionProps;

export enum ResourceStatus {
    PUBLIC = "Public",
    PRIVATE = "Private",
    SHARED = "Shared"
}

const resourceStatus = (type: string) => {
    switch (type) {
        case ResourceStatus.PUBLIC:
            return "Public";
        case ResourceStatus.PRIVATE:
            return "Private";
        case ResourceStatus.SHARED:
            return "Shared";
        default:
            return "Unknown";
    }
};

export const workflowPanelColumns: DataColumns<string> = [
    {
        name: WorkflowPanelColumnNames.NAME,
        selected: true,
        configurable: true,
        sortDirection: SortDirection.ASC,
        filters: createTree(),
        render: (uuid: string) => <RosurceWorkflowName uuid={uuid} />
    },
    {
        name: WorkflowPanelColumnNames.AUTHORISATION,
        selected: true,
        configurable: true,
        filters: createTree(),
        // TODO: restore filters
        // filters: [
        //     {
        //         name: resourceStatus(ResourceStatus.PUBLIC),
        //         selected: true,
        //         type: ResourceStatus.PUBLIC
        //     },
        //     {
        //         name: resourceStatus(ResourceStatus.PRIVATE),
        //         selected: true,
        //         type: ResourceStatus.PRIVATE
        //     },
        //     {
        //         name: resourceStatus(ResourceStatus.SHARED),
        //         selected: true,
        //         type: ResourceStatus.SHARED
        //     }
        // ],
        render: (uuid: string) => <ResourceWorkflowStatus uuid={uuid} />,
    },
    {
        name: WorkflowPanelColumnNames.LAST_MODIFIED,
        selected: true,
        configurable: true,
        sortDirection: SortDirection.NONE,
        filters: createTree(),
        render: (uuid: string) => <ResourceLastModifiedDate uuid={uuid} />
    },
    {
        name: '',
        selected: true,
        configurable: false,
        filters: createTree(),
        render: (uuid: string) => <ResourceShare uuid={uuid} />
    },
    {
        name: '',
        selected: true,
        configurable: false,
        filters: createTree(),
        render: (uuid: string) => <ResourceRunProcess uuid={uuid} />
    }
];

export const WorkflowPanelView = (props: WorkflowPanelProps) => {
    return <Grid container spacing={16} style={{ minHeight: '500px' }}>
        <Grid item xs={6}>
            <DataExplorer
                id={WORKFLOW_PANEL_ID}
                onRowClick={props.handleRowClick}
                onRowDoubleClick={props.handleRowDoubleClick}
                contextMenuColumn={false}
                onContextMenu={e => e}
                dataTableDefaultView={<DataTableDefaultView icon={WorkflowIcon} />} />
        </Grid>
        <Grid item xs={6}>
            <Paper style={{ height: '100%' }}>
                <WorkflowDetailsCard workflow={props.workflow} />
            </Paper>
        </Grid>
    </Grid>;
};
