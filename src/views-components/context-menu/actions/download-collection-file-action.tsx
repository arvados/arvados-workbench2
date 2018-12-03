// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { connect } from "react-redux";
import { RootState } from "../../../store/store";
import { DownloadAction } from "./download-action";
import { getNodeValue } from "../../../models/tree";
import { CollectionFileType } from "../../../models/collection-file";
import { DownloadIcon } from '~/components/icon/icon';

const mapStateToProps = (state: RootState) => {
    const { resource } = state.contextMenu;
    const iconProp = { icon: DownloadIcon };
    if (resource) {
        const file = getNodeValue(resource.uuid)(state.collectionPanelFiles);
        if (file) {
            return {
                href: file.url,
                download: file.type === CollectionFileType.DIRECTORY ? undefined : file.name,
                ...iconProp,
            };
        }
    }
    return iconProp;
};

export const DownloadCollectionFileAction = connect(mapStateToProps)(DownloadAction);
