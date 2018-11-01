// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import * as React from "react";
import { connect } from "react-redux";
import { noop } from 'lodash';
import { values } from 'lodash/fp';
import {  FavoriteIcon, TrashIcon } from '~/components/icon/icon';
import { RecentIcon, WorkflowIcon } from '~/components/icon/icon';
import { HomeTreePicker } from "~/views-components/projects-tree-picker/home-tree-picker";
import { SharedTreePicker } from "~/views-components/projects-tree-picker/shared-tree-picker";
import { SidePanelTreeId } from "~/store/side-panel-tree/side-panel-trees-actions";
import { ProjectsTreePicker, ProjectsTreePickerProps } from '~/views-components/projects-tree-picker/generic-projects-tree-picker';
import { IconType } from '~/components/icon/icon';

const relatedTreePickers = values(SidePanelTreeId);

export type SidePanelTreesProps = Pick<ProjectsTreePickerProps, 'toggleItemActive' | 'onContextMenu'>;

export const SidePanelTrees = (props: SidePanelTreesProps) =>
    <div>
        <HomeTreePicker pickerId={SidePanelTreeId.HOME} openOnActivation {...{ relatedTreePickers }} {...props} />
        <SharedTreePicker pickerId={SidePanelTreeId.SHARED} openOnActivation {...{ relatedTreePickers }} {...props} />
        <WorkflowsTreePicker pickerId={SidePanelTreeId.WORKFLOWS} {...{ relatedTreePickers }} {...props} />
        <RecentTreePicker pickerId={SidePanelTreeId.RECENT} {...{ relatedTreePickers }} {...props} />
        <FavoritesTreePicker pickerId={SidePanelTreeId.FAVORITES} {...{ relatedTreePickers }} {...props} />
        <TrashTreePicker pickerId={SidePanelTreeId.TRASH} {...{ relatedTreePickers }} {...props} />
    </div>;

const createPicker = (icon: IconType) =>
    connect(() => ({
        rootItemIcon: icon,
    }), { loadRootItem: noop, })(ProjectsTreePicker);

export const WorkflowsTreePicker = createPicker(WorkflowIcon);

export const RecentTreePicker = createPicker(RecentIcon);

export const FavoritesTreePicker = createPicker(FavoriteIcon);

export const TrashTreePicker = createPicker(TrashIcon);
