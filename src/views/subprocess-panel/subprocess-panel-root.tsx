// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import * as React from 'react';
import { DataExplorer } from "~/views-components/data-explorer/data-explorer";
import { DataColumns } from '~/components/data-table/data-table';
import { DataTableFilterItem } from '~/components/data-table-filters/data-table-filters';
import { ContainerRequestState } from '~/models/container-request';
import { SortDirection } from '~/components/data-table/data-column';
import { ResourceKind } from '~/models/resource';
import { ResourceCreatedAtDate, ProcessStatus, ContainerRunTime } from '~/views-components/data-explorer/renderers';
import { ProcessIcon } from '~/components/icon/icon';
import { ResourceName } from '~/views-components/data-explorer/renderers';
import { SUBPROCESS_PANEL_ID } from '~/store/subprocess-panel/subprocess-panel-actions';
import { DataTableDefaultView } from '~/components/data-table-default-view/data-table-default-view';
import { createTree } from '~/models/tree';
import { getInitialProcessStatusFilters } from '~/store/resource-type-filters/resource-type-filters';

export enum SubprocessPanelColumnNames {
    NAME = "Name",
    STATUS = "Status",
    CREATED_AT = "Created At",
    RUNTIME = "Run Time"
}

export interface SubprocessPanelFilter extends DataTableFilterItem {
    type: ResourceKind | ContainerRequestState;
}

export const subprocessPanelColumns: DataColumns<string> = [
    {
        name: SubprocessPanelColumnNames.NAME,
        selected: true,
        configurable: true,
        sortDirection: SortDirection.NONE,
        filters: createTree(),
        render: uuid => <ResourceName uuid={uuid} />
    },
    {
        name: SubprocessPanelColumnNames.STATUS,
        selected: true,
        configurable: true,
        mutuallyExclusiveFilters: true,
        filters: getInitialProcessStatusFilters(),
        render: uuid => <ProcessStatus uuid={uuid} />,
    },
    {
        name: SubprocessPanelColumnNames.CREATED_AT,
        selected: true,
        configurable: true,
        sortDirection: SortDirection.DESC,
        filters: createTree(),
        render: uuid => <ResourceCreatedAtDate uuid={uuid} />
    },
    {
        name: SubprocessPanelColumnNames.RUNTIME,
        selected: true,
        configurable: true,
        filters: createTree(),
        render: uuid => <ContainerRunTime uuid={uuid} />
    }
];

export interface SubprocessPanelDataProps {
    isAdmin: boolean;
}

export interface SubprocessPanelActionProps {
    onItemClick: (item: string) => void;
    onContextMenu: (event: React.MouseEvent<HTMLElement>, item: string, isAdmin: boolean) => void;
    onItemDoubleClick: (item: string) => void;
}

type SubprocessPanelProps = SubprocessPanelActionProps & SubprocessPanelDataProps;

export const SubprocessPanelRoot = (props: SubprocessPanelProps) => {
    return <DataExplorer
        id={SUBPROCESS_PANEL_ID}
        onRowClick={props.onItemClick}
        onRowDoubleClick={props.onItemDoubleClick}
        onContextMenu={(event, item) => props.onContextMenu(event, item, props.isAdmin)}
        contextMenuColumn={true}
        dataTableDefaultView={
            <DataTableDefaultView
                icon={ProcessIcon}
                messages={['This process has no subprocesses.']} />
        } />;
};