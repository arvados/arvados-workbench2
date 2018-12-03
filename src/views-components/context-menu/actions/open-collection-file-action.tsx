// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { connect } from "react-redux";
import { RootState } from "~/store/store";
import { DownloadAction } from "./download-action";
import { getNodeValue } from "~/models/tree";
import { OpenFileIcon } from "~/components/icon/icon";

const mapStateToProps = (state: RootState) => {
    const { resource } = state.contextMenu;
    const iconProp = { icon: OpenFileIcon };
    if (resource) {
        const file = getNodeValue(resource.uuid)(state.collectionPanelFiles);
        if (file) {
            return {
                href: file.url,
                ...iconProp,
            };
        }
    }
    return iconProp;
};

export const OpenCollectionFileAction = connect(mapStateToProps)(DownloadAction);
