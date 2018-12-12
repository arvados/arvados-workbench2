// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { Resource } from "./resource";
import { TagProperty } from "~/models/tag";
import { ResourceKind } from '~/models/resource';

export interface LinkResource extends Resource {
    headUuid: string;
    headKind: ResourceKind;
    tailUuid: string;
    tailKind: string;
    linkClass: string;
    name: string;
    properties: TagProperty;
}

export enum LinkClass {
    STAR = 'star',
    TAG = 'tag',
    PERMISSION = 'permission',
    PRESET = 'preset',
}