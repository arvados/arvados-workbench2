// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { AxiosInstance } from "axios";
import { CommonResourceService } from "~/common/api/common-resource-service";
import { UserResource } from "~/models/user";

export class UserService extends CommonResourceService<UserResource> {
    constructor(serverApi: AxiosInstance) {
        super(serverApi, "users");
    }
}