// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import * as React from 'react';
import { Input as MuiInput, Chip as MuiChip, Popper as MuiPopper, Paper, FormControl, InputLabel, StyleRulesCallback, withStyles, RootRef, ListItemText, ListItem, List } from '@material-ui/core';
import { PopperProps } from '@material-ui/core/Popper';
import { WithStyles } from '@material-ui/core/styles';
import { noop } from 'lodash';

export interface AutocompleteProps<Item, Suggestion> {
    label?: string;
    value: string;
    items: Item[];
    suggestions?: Suggestion[];
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
    onCreate?: () => void;
    onDelete?: (item: Item, index: number) => void;
    onSelect?: (suggestion: Suggestion) => void;
    renderChipValue?: (item: Item) => string;
    renderSuggestion?: (suggestion: Suggestion) => React.ReactNode;
}

export interface AutocompleteState {
    suggestionsOpen: boolean;
}
export class Autocomplete<Value, Suggestion> extends React.Component<AutocompleteProps<Value, Suggestion>, AutocompleteState> {

    state = {
        suggestionsOpen: false,
    };

    containerRef = React.createRef<HTMLDivElement>();
    inputRef = React.createRef<HTMLInputElement>();

    render() {
        return (
            <RootRef rootRef={this.containerRef}>
                <FormControl fullWidth>
                    {this.renderLabel()}
                    {this.renderInput()}
                    {this.renderSuggestions()}
                </FormControl>
            </RootRef>
        );
    }

    renderLabel() {
        const { label } = this.props;
        return label && <InputLabel>{label}</InputLabel>;
    }

    renderInput() {
        return <Input
            inputRef={this.inputRef}
            value={this.props.value}
            startAdornment={this.renderChips()}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            onChange={this.props.onChange}
            onKeyPress={this.handleKeyPress}
        />;
    }

    renderSuggestions() {
        const { suggestions = [] } = this.props;
        return (
            <Popper
                open={this.state.suggestionsOpen && suggestions.length > 0}
                anchorEl={this.containerRef.current}>
                <Paper onMouseDown={this.preventBlur}>
                    <List dense style={{ width: this.getSuggestionsWidth() }}>
                        {suggestions.map(
                            (suggestion, index) =>
                                <ListItem button key={index} onClick={this.handleSelect(suggestion)}>
                                    {this.renderSuggestion(suggestion)}
                                </ListItem>
                        )}
                    </List>
                </Paper>
            </Popper>
        );
    }

    handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        const { onFocus = noop } = this.props;
        this.setState({ suggestionsOpen: true });
        onFocus(event);
    }

    handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        setTimeout(() => {
            const { onBlur = noop } = this.props;
            this.setState({ suggestionsOpen: false });
            onBlur(event);
        });
    }

    handleKeyPress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
        const { onCreate = noop } = this.props;
        if (key === 'Enter' && this.props.value.length > 0) {
            onCreate();
        }
    }

    renderChips() {
        const { items, onDelete } = this.props;
        return items.map(
            (item, index) =>
                <Chip
                    label={this.renderChipValue(item)}
                    key={index}
                    onDelete={() => onDelete ? onDelete(item, index) : undefined} />
        );
    }

    renderChipValue(value: Value) {
        const { renderChipValue } = this.props;
        return renderChipValue ? renderChipValue(value) : JSON.stringify(value);
    }

    preventBlur = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
    }

    handleClickAway = (event: React.MouseEvent<HTMLElement>) => {
        if (event.target !== this.inputRef.current) {
            this.setState({ suggestionsOpen: false });
        }
    }

    handleSelect(suggestion: Suggestion) {
        return () => {
            const { onSelect = noop } = this.props;
            const { current } = this.inputRef;
            if (current) {
                current.focus();
            }
            onSelect(suggestion);
        };
    }

    renderSuggestion(suggestion: Suggestion) {
        const { renderSuggestion } = this.props;
        return renderSuggestion
            ? renderSuggestion(suggestion)
            : <ListItemText>{JSON.stringify(suggestion)}</ListItemText>;
    }

    getSuggestionsWidth() {
        return this.containerRef.current ? this.containerRef.current.offsetWidth : 'auto';
    }
}

type ChipClasses = 'root';

const chipStyles: StyleRulesCallback<ChipClasses> = theme => ({
    root: {
        marginRight: theme.spacing.unit / 4,
        height: theme.spacing.unit * 3,
    }
});

const Chip = withStyles(chipStyles)(MuiChip);

type PopperClasses = 'root';

const popperStyles: StyleRulesCallback<ChipClasses> = theme => ({
    root: {
        zIndex: theme.zIndex.modal,
    }
});

const Popper = withStyles(popperStyles)(
    ({ classes, ...props }: PopperProps & WithStyles<PopperClasses>) =>
        <MuiPopper {...props} className={classes.root} />
);

type InputClasses = 'root';

const inputStyles: StyleRulesCallback<InputClasses> = () => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    input: {
        minWidth: '20%',
        flex: 1,
    },
});

const Input = withStyles(inputStyles)(MuiInput);