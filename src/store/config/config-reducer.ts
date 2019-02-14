// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { configActions, ConfigAction } from "./config-action";
import { Config, mockConfig } from '~/common/config';

export interface ConfigState {
    config: Config;
}

const initialState: ConfigState = {
    config: mockConfig({}),
};

export const configReducer = (state = initialState, action: ConfigAction) => {
    return configActions.match(action, {
        CONFIG: ({ config }) => {
            return {
                ...state, config
            };
        },
        default: () => state
    });
};
