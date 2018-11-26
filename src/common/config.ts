// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import Axios from "axios";

export const CONFIG_URL = process.env.REACT_APP_ARVADOS_CONFIG_URL || "/config.json";

export interface Config {
    auth: {};
    basePath: string;
    baseUrl: string;
    batchPath: string;
    blobSignatureTtl: number;
    crunchLimitLogBytesPerJob: number;
    crunchLogBytesPerEvent: number;
    crunchLogPartialLineThrottlePeriod: number;
    crunchLogSecondsBetweenEvents: number;
    crunchLogThrottleBytes: number;
    crunchLogThrottleLines: number;
    crunchLogThrottlePeriod: number;
    defaultCollectionReplication: number;
    defaultTrashLifetime: number;
    description: string;
    discoveryVersion: string;
    dockerImageFormats: string[];
    documentationLink: string;
    generatedAt: string;
    gitUrl: string;
    id: string;
    keepWebServiceUrl: string;
    kind: string;
    maxRequestSize: number;
    name: string;
    packageVersion: string;
    parameters: {};
    protocol: string;
    remoteHosts: string;
    remoteHostsViaDNS: boolean;
    resources: {};
    revision: string;
    rootUrl: string;
    schemas: {};
    servicePath: string;
    sourceVersion: string;
    source_version: string;
    title: string;
    uuidPrefix: string;
    version: string;
    websocketUrl: string;
    workbenchUrl: string;
}

export const fetchFirstLoginTemplate = ({ config, apiHost }: any) => {
    return Axios
        .get<any>('https://localhost:3000/test.html')
        .then(response => ({ config, apiHost, firstLoginTemplate: response.data }))
        .catch(() => ({ config, apiHost, firstLoginTemplate: null }));
};

export const fetchConfig = () => {
    return Axios
        .get<ConfigJSON>(CONFIG_URL + "?nocache=" + (new Date()).getTime())
        .then(response => response.data)
        .catch(() => Promise.resolve(getDefaultConfig()))
        .then(config => Axios
            .get<Config>(getDiscoveryURL(config.API_HOST))
            .then(response => ({ config: response.data, apiHost: config.API_HOST })));

};

export const mockConfig = (config: Partial<Config>): Config => ({
    auth: {},
    basePath: '',
    baseUrl: '',
    batchPath: '',
    blobSignatureTtl: 0,
    crunchLimitLogBytesPerJob: 0,
    crunchLogBytesPerEvent: 0,
    crunchLogPartialLineThrottlePeriod: 0,
    crunchLogSecondsBetweenEvents: 0,
    crunchLogThrottleBytes: 0,
    crunchLogThrottleLines: 0,
    crunchLogThrottlePeriod: 0,
    defaultCollectionReplication: 0,
    defaultTrashLifetime: 0,
    description: '',
    discoveryVersion: '',
    dockerImageFormats: [],
    documentationLink: '',
    generatedAt: '',
    gitUrl: '',
    id: '',
    keepWebServiceUrl: '',
    kind: '',
    maxRequestSize: 0,
    name: '',
    packageVersion: '',
    parameters: {},
    protocol: '',
    remoteHosts: '',
    remoteHostsViaDNS: false,
    resources: {},
    revision: '',
    rootUrl: '',
    schemas: {},
    servicePath: '',
    sourceVersion: '',
    source_version: '',
    title: '',
    uuidPrefix: '',
    version: '',
    websocketUrl: '',
    workbenchUrl: '',
    ...config
});

interface ConfigJSON {
    API_HOST: string;
}

const getDefaultConfig = (): ConfigJSON => ({
    API_HOST: process.env.REACT_APP_ARVADOS_API_HOST || "",
});

const getDiscoveryURL = (apiHost: string) => `${window.location.protocol}//${apiHost}/discovery/v1/apis/arvados/v1/rest`;
