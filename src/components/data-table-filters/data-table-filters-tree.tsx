// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import * as React from "react";
import { Tree, toggleNodeSelection, getNode, initTreeNode, getNodeChildrenIds } from '~/models/tree';
import { Tree as TreeComponent, TreeItem, TreeItemStatus } from '~/components/tree/tree';
import { noop, map } from "lodash/fp";
import { toggleNodeCollapse } from '~/models/tree';
import { countNodes, countChildren } from '~/models/tree';

export interface DataTableFilterItem {
    name: string;
}

export type DataTableFilters = Tree<DataTableFilterItem>;

export interface DataTableFilterProps {
    filters: DataTableFilters;
    onChange?: (filters: DataTableFilters) => void;
}

export class DataTableFiltersTree extends React.Component<DataTableFilterProps> {

    render() {
        const { filters } = this.props;
        const hasSubfilters = countNodes(filters) !== countChildren('')(filters);
        return <TreeComponent
            levelIndentation={hasSubfilters ? 20 : 0}
            itemRightPadding={20}
            items={filtersToTree(filters)}
            render={renderItem}
            showSelection
            disableRipple
            onContextMenu={noop}
            toggleItemActive={noop}
            toggleItemOpen={this.toggleOpen}
            toggleItemSelection={this.toggleFilter}
        />;
    }

    toggleFilter = (_: React.MouseEvent, item: TreeItem<DataTableFilterItem>) => {
        const { onChange = noop } = this.props;
        onChange(toggleNodeSelection(item.id)(this.props.filters));
    }

    toggleOpen = (_: React.MouseEvent, item: TreeItem<DataTableFilterItem>) => {
        const { onChange = noop } = this.props;
        onChange(toggleNodeCollapse(item.id)(this.props.filters));
    }
}

const renderItem = (item: TreeItem<DataTableFilterItem>) =>
    <span>{item.data.name}</span>;

const filterToTreeItem = (filters: DataTableFilters) =>
    (id: string): TreeItem<any> => {
        const node = getNode(id)(filters) || initTreeNode({ id: '', value: 'InvalidNode' });
        const items = getNodeChildrenIds(node.id)(filters)
            .map(filterToTreeItem(filters));

        return {
            active: node.active,
            data: node.value,
            id: node.id,
            items: items.length > 0 ? items : undefined,
            open: node.expanded,
            selected: node.selected,
            status: TreeItemStatus.LOADED,
        };
    };

const filtersToTree = (filters: DataTableFilters): TreeItem<DataTableFilterItem>[] =>
    map(filterToTreeItem(filters), getNodeChildrenIds('')(filters));
