// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import * as React from 'react';
import { Chip, Grid } from '@material-ui/core';
import { DragSource, DragSourceSpec, DragSourceCollector, ConnectDragSource, DropTarget, DropTargetSpec, DropTargetCollector, ConnectDropTarget } from 'react-dnd';
import { compose } from 'lodash/fp';
interface ChipsProps<Value> {
    values: Value[];
    getLabel?: (value: Value) => string;
    filler?: React.ReactNode;
    onChange: (value: Value[]) => void;
}
export class Chips<Value> extends React.Component<ChipsProps<Value>> {
    render() {
        const { values, filler } = this.props;
        return <Grid container spacing={8}>
            {values.map(this.renderChip)}
            {filler && <Grid item xs>{filler}</Grid>}
        </Grid>;
    }

    renderChip = (value: Value, index: number) =>
        <Grid item key={index}>
            <this.chip {...{ value }} />
        </Grid>

    type = 'chip';

    dragSpec: DragSourceSpec<DraggableChipProps<Value>, { value: Value }> = {
        beginDrag: ({ value }) => ({ value }),
        endDrag: ({ value: dragValue }, monitor) => {
            const result = monitor.getDropResult();
            if (result) {
                const { value: dropValue } = monitor.getDropResult();
                const dragIndex = this.props.values.indexOf(dragValue);
                const dropIndex = this.props.values.indexOf(dropValue);
                const newValues = this.props.values.slice(0);
                if (dragIndex < dropIndex) {
                    newValues.splice(dragIndex, 1);
                    newValues.splice(dropIndex - 1 || 0, 0, dragValue);
                } else if (dragIndex > dropIndex) {
                    newValues.splice(dragIndex, 1);
                    newValues.splice(dropIndex, 0, dragValue);
                }
                this.props.onChange(newValues);
            }
        }
    };

    dragCollector: DragSourceCollector<{}> = connect => ({
        connectDragSource: connect.dragSource(),
    })

    dropSpec: DropTargetSpec<DraggableChipProps<Value>> = {
        drop: ({ value }) => ({ value }),
    };

    dropCollector: DropTargetCollector<{}> = (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
    })
    chip = compose(
        DragSource(this.type, this.dragSpec, this.dragCollector),
        DropTarget(this.type, this.dropSpec, this.dropCollector),
    )(
        ({ connectDragSource, connectDropTarget, isOver, value }: DraggableChipProps<Value> & CollectedProps) =>
            compose(
                connectDragSource,
                connectDropTarget,
            )(
                <span>
                    <Chip
                        color={isOver ? 'primary' : 'default'}
                        onDelete={this.deleteValue(value)}
                        label={this.props.getLabel ?
                            this.props.getLabel(value)
                            : typeof value === 'object'
                                ? JSON.stringify(value)
                                : value} />
                </span>
            )
    );

    deleteValue = (value: Value) => () => {
        const { values } = this.props;
        const index = values.indexOf(value);
        const newValues = values.slice(0);
        newValues.splice(index, 1);
        this.props.onChange(newValues);
    }
}

interface CollectedProps {
    connectDragSource: ConnectDragSource;
    connectDropTarget: ConnectDropTarget;

    isOver: boolean;
}

interface DraggableChipProps<Value> {
    value: Value;
}