// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import * as React from 'react';
import Button from '@material-ui/core/Button';
import SnackbarMaterial from '@material-ui/core/Snackbar';

type SnackbarProps = {
    message: string
};

interface SnackbarState {
    open: boolean;
}

export class Snackbar extends React.Component<SnackbarProps> {
    state: SnackbarState = {
        open: false
    };

    handleClick = () => {
        this.setState({ open: true });
    }

    render() {
        const { open } = this.state;
        const { message } = this.props;
        return (
            <div>
                <Button onClick={this.handleClick}>
                    CLICK
                </Button>
                <SnackbarMaterial
                    open={open}
                    autoHideDuration={AUTO_HIDE_DURATION}
                    message={<span id="message-id">{message}</span>}
                />
            </div>
        );
    }
}

const AUTO_HIDE_DURATION = 6000;