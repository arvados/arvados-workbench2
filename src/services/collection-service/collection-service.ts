// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { CollectionResource } from "models/collection";
import { AxiosInstance } from "axios";
import { CollectionFile, CollectionDirectory } from "models/collection-file";
import { WebDAV } from "common/webdav";
import { AuthService } from "../auth-service/auth-service";
import { extractFilesData } from "./collection-service-files-response";
import { TrashableResourceService } from "services/common-service/trashable-resource-service";
import { ApiActions } from "services/api/api-actions";
import { customEncodeURI } from "common/url";

export type UploadProgress = (fileId: number, loaded: number, total: number, currentTime: number) => void;

export class CollectionService extends TrashableResourceService<CollectionResource> {
    constructor(serverApi: AxiosInstance, private webdavClient: WebDAV, private authService: AuthService, actions: ApiActions) {
        super(serverApi, "collections", actions, [
            'fileCount',
            'fileSizeTotal',
            'replicationConfirmed',
            'replicationConfirmedAt',
            'storageClassesConfirmed',
            'storageClassesConfirmedAt',
            'unsignedManifestText',
            'version',
        ]);
    }

    create(data?: Partial<CollectionResource>) {
        return super.create({ ...data, preserveVersion: true });
    }

    update(uuid: string, data: Partial<CollectionResource>) {
        return super.update(uuid, { ...data, preserveVersion: true });
    }

    async files(uuid: string) {
        const request = await this.webdavClient.propfind(`c=${uuid}`);
        if (request.responseXML != null) {
            return extractFilesData(request.responseXML);
        }
        return Promise.reject();
    }

    async deleteFiles(collectionUuid: string, filePaths: string[]) {
        const sortedUniquePaths = Array.from(new Set(filePaths))
            .sort((a, b) => a.length - b.length)
            .reduce((acc, currentPath) => {
                const parentPathFound = acc.find((parentPath) => currentPath.indexOf(`${parentPath}/`) > -1);

                if (!parentPathFound) {
                    return [...acc, currentPath];
                }

                return acc;
            }, []);

        for (const path of sortedUniquePaths) {
            if (path.indexOf(collectionUuid) === -1) {
                await this.webdavClient.delete(`c=${collectionUuid}${path}`);
            } else {
                await this.webdavClient.delete(`c=${path}`);
            }
        }
        await this.update(collectionUuid, { preserveVersion: true });
    }

    async uploadFiles(collectionUuid: string, files: File[], onProgress?: UploadProgress) {
        if (collectionUuid === "" || files.length === 0) { return; }
        // files have to be uploaded sequentially
        for (let idx = 0; idx < files.length; idx++) {
            await this.uploadFile(collectionUuid, files[idx], idx, onProgress);
        }
        await this.update(collectionUuid, { preserveVersion: true });
    }

    async moveFile(collectionUuid: string, oldPath: string, newPath: string) {
        await this.webdavClient.move(
            `c=${collectionUuid}${oldPath}`,
            `c=${collectionUuid}/${customEncodeURI(newPath)}`
        );
        await this.update(collectionUuid, { preserveVersion: true });
    }

    extendFileURL = (file: CollectionDirectory | CollectionFile) => {
        const baseUrl = this.webdavClient.defaults.baseURL.endsWith('/')
            ? this.webdavClient.defaults.baseURL.slice(0, -1)
            : this.webdavClient.defaults.baseURL;
        const apiToken = this.authService.getApiToken();
        const encodedApiToken = apiToken ? encodeURI(apiToken) : '';
        const userApiToken = `/t=${encodedApiToken}/`;
        const splittedPrevFileUrl = file.url.split('/');
        const url = `${baseUrl}/${splittedPrevFileUrl[1]}${userApiToken}${splittedPrevFileUrl.slice(2).join('/')}`;
        return {
            ...file,
            url
        };
    }

    private async uploadFile(collectionUuid: string, file: File, fileId: number, onProgress: UploadProgress = () => { return; }) {
        const fileURL = `c=${collectionUuid}/${file.name}`;
        const requestConfig = {
            headers: {
                'Content-Type': 'text/octet-stream'
            },
            onUploadProgress: (e: ProgressEvent) => {
                onProgress(fileId, e.loaded, e.total, Date.now());
            },
        };
        return this.webdavClient.upload(fileURL, [file], requestConfig);
    }
}
