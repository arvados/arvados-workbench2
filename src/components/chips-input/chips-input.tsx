// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import * as React from 'react';
import { Chips } from '~/components/chips/chips';
import { Input } from '@material-ui/core';

interface ChipsInputProps<Value> {
    values: Value[];
    getLabel?: (value: Value) => string;
    onChange: (value: Value[]) => void;
    createNewValue: (value: string) => Value;
}

export class ChipsInput<Value> extends React.Component<ChipsInputProps<Value>> {

    state = {
        text: '',
    };

    filler = React.createRef<HTMLDivElement>();
    timeout = -1;

    setText = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ text: event.target.value });
    }

    handleKeyPress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            this.createNewValue();
        } else if (key === 'Backspace') {
            this.deleteLastValue();
        }
    }

    createNewValue = () => {
        if (this.state.text) {
            const newValue = this.props.createNewValue(this.state.text);
            this.setState({ text: '' });
            this.props.onChange([...this.props.values, newValue]);
        }
    }

    deleteLastValue = () => {
        if (this.state.text.length === 0 && this.props.values.length > 0) {
            this.props.onChange(this.props.values.slice(0, -1));
        }
    }

    updateStyles = () => {
        if(this.timeout){
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => this.forceUpdate());
    }

    render() {
        this.updateStyles();
        return <>
            <div style={{ minHeight: '40px', zIndex: 1, position: 'relative' }}>
                <Chips {...this.props} filler={<div ref={this.filler} />} />
            </div>
            <Input
                value={this.state.text}
                onChange={this.setText}
                onKeyDown={this.handleKeyPress}
                style={{ top: '-24px' }}
                inputProps={{ style: this.getInputStyles(), }}
                fullWidth />
        </>;
    }

    getInputStyles = (): React.CSSProperties => ({
        width: this.filler.current
            ? this.filler.current.offsetWidth + 8
            : '100%',
        position: 'relative',
        right: this.filler.current
            ? `calc(${this.filler.current.offsetWidth}px - 100%)`
            : 0,
        top: '-5px',
        zIndex: 1,
    })
}