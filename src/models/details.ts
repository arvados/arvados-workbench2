// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { ProjectResource } from "./project";
import { CollectionResource } from "./collection";
import { ProcessResource } from "./process";
import { EmptyResource } from "./empty";

export type DetailsResource = ProjectResource | CollectionResource | ProcessResource | EmptyResource;
