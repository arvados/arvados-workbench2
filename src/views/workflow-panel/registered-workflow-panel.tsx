// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import React from 'react';
import {
    StyleRulesCallback,
    WithStyles,
    withStyles,
    Grid,
    Tooltip,
    Typography,
    Card,
    CardHeader
} from '@material-ui/core';
import { connect, DispatchProp } from "react-redux";
import { RouteComponentProps } from 'react-router';
import { ArvadosTheme } from 'common/custom-theme';
import { RootState } from 'store/store';
import { WorkflowIcon } from 'components/icon/icon';
import {
    WorkflowResource, parseWorkflowDefinition, getWorkflowInputs,
    getWorkflowOutputs, getWorkflow
} from 'models/workflow';
import { ProcessOutputCollectionFiles } from 'views/process-panel/process-output-collection-files';
import { WorkflowDetailsAttributes } from 'views-components/details-panel/workflow-details';
import { getResource } from 'store/resources/resources';
import { openContextMenu, resourceUuidToContextMenuKind } from 'store/context-menu/context-menu-actions';
import { MPVContainer, MPVPanelContent, MPVPanelState } from 'components/multi-panel-view/multi-panel-view';
import { ProcessIOCard, ProcessIOCardType, ProcessIOParameter } from 'views/process-panel/process-io-card';
import { formatInputData, formatOutputData } from 'store/process-panel/process-panel-actions';
import { DetailsAttribute } from 'components/details-attribute/details-attribute';
import { getPropertyChip } from "views-components/resource-properties-form/property-chip";

type CssRules = 'root'
    | 'button'
    | 'infoCard'
    | 'propertiesCard'
    | 'filesCard'
    | 'iconHeader'
    | 'tag'
    | 'label'
    | 'value'
    | 'link'
    | 'centeredLabel'
    | 'warningLabel'
    | 'collectionName'
    | 'readOnlyIcon'
    | 'header'
    | 'title'
    | 'avatar'
    | 'propertyTag';

const styles: StyleRulesCallback<CssRules> = (theme: ArvadosTheme) => ({
    root: {
        width: '100%',
    },
    button: {
        cursor: 'pointer'
    },
    infoCard: {
        paddingLeft: theme.spacing.unit * 2,
        paddingRight: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
    },
    propertiesCard: {
        padding: 0,
    },
    filesCard: {
        padding: 0,
    },
    iconHeader: {
        fontSize: '1.875rem',
        color: theme.customs.colors.greyL
    },
    tag: {
        marginRight: theme.spacing.unit / 2,
        marginBottom: theme.spacing.unit / 2
    },
    label: {
        fontSize: '0.875rem',
    },
    centeredLabel: {
        fontSize: '0.875rem',
        textAlign: 'center'
    },
    warningLabel: {
        fontStyle: 'italic'
    },
    collectionName: {
        flexDirection: 'column',
    },
    value: {
        textTransform: 'none',
        fontSize: '0.875rem'
    },
    link: {
        fontSize: '0.875rem',
        color: theme.palette.primary.main,
        '&:hover': {
            cursor: 'pointer'
        }
    },
    readOnlyIcon: {
        marginLeft: theme.spacing.unit,
        fontSize: 'small',
    },
    header: {
        paddingTop: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
    },
    title: {
        overflow: 'hidden',
        paddingTop: theme.spacing.unit * 0.5,
        color: theme.customs.colors.green700,
    },
    avatar: {
        alignSelf: 'flex-start',
        paddingTop: theme.spacing.unit * 0.5
    },
    propertyTag: {
        marginRight: theme.spacing.unit / 2,
        marginBottom: theme.spacing.unit / 2
    },
});

interface RegisteredWorkflowPanelDataProps {
    item: WorkflowResource;
    workflowCollection: string;
    inputParams: ProcessIOParameter[];
    outputParams: ProcessIOParameter[];
    gitprops: { [key: string]: string; };
}

type RegisteredWorkflowPanelProps = RegisteredWorkflowPanelDataProps & DispatchProp & WithStyles<CssRules>

export const RegisteredWorkflowPanel = withStyles(styles)(connect(
    (state: RootState, props: RouteComponentProps<{ id: string }>) => {
        const item = getResource<WorkflowResource>(props.match.params.id)(state.resources);
        let inputParams: ProcessIOParameter[] = [];
        let outputParams: ProcessIOParameter[] = [];
        let workflowCollection = "";
        const gitprops: { [key: string]: string; } = {};
        if (item) {
            // parse definition
            const wfdef = parseWorkflowDefinition(item);

            const inputs = getWorkflowInputs(wfdef);
            if (inputs) {
                inputs.forEach(elm => {
                    if (elm.default !== undefined && elm.default !== null) {
                        elm.value = elm.default;
                    }
                });
                inputParams = formatInputData(inputs, state.auth);
            }

            const outputs = getWorkflowOutputs(wfdef);
            if (outputs) {
                outputParams = formatOutputData(outputs, {}, undefined, state.auth);
            }

            const wf = getWorkflow(wfdef);
            if (wf) {
                const REGEX = /keep:([0-9a-f]{32}\+\d+)\/.*/;
                if (wf["steps"]) {
                    workflowCollection = wf["steps"][0].run.match(REGEX)[1];
                }
            }

            for (const elm in wfdef) {
                if (elm.startsWith("http://arvados.org/cwl#git")) {
                    gitprops[elm.substr(23)] = wfdef[elm]
                }
            }

        }
        return { item, inputParams, outputParams, workflowCollection, gitprops };
    })(
        class extends React.Component<RegisteredWorkflowPanelProps> {
            render() {
                const { classes, item, inputParams, outputParams, workflowCollection, gitprops, dispatch } = this.props;
                const panelsData: MPVPanelState[] = [
                    { name: "Details" },
                    { name: "Inputs" },
                    { name: "Outputs" },
                    { name: "Files" },
                ];
                return item
                    ? <MPVContainer className={classes.root} spacing={8} direction="column" justify-content="flex-start" wrap="nowrap" panelStates={panelsData}>
                        <MPVPanelContent xs="auto" data-cy='registered-workflow-info-panel'>
                            <Card className={classes.infoCard}>
                                <CardHeader
                                    className={classes.header}
                                    classes={{
                                        content: classes.title,
                                        avatar: classes.avatar,
                                    }}
                                    avatar={<WorkflowIcon className={classes.iconHeader} />}
                                    title={
                                        <Tooltip title={item.name} placement="bottom-start">
                                            <Typography noWrap variant='h6'>
                                                {item.name}
                                            </Typography>
                                        </Tooltip>
                                    }
                                    subheader={
                                        <Tooltip title={item.description || '(no-description)'} placement="bottom-start">
                                            <Typography noWrap variant='body1' color='inherit'>
                                                {item.description || '(no-description)'}
                                            </Typography>
                                        </Tooltip>}
                                />

                                <Grid container justify="space-between">
                                    <Grid item xs={12}>
                                        <WorkflowDetailsAttributes workflow={item} />
                                    </Grid>

                                    <Grid item xs={12} md={12}>
                                        <DetailsAttribute label='Properties' />
                                        {Object.keys(gitprops).map(k =>
                                            getPropertyChip(k, gitprops[k], undefined, classes.propertyTag))}
                                    </Grid>
                                </Grid>
                            </Card>
                        </MPVPanelContent>
                        <MPVPanelContent forwardProps xs data-cy="process-inputs">
                            <ProcessIOCard
                                label={ProcessIOCardType.INPUT}
                                params={inputParams}
                                raw={{}}
                                showParams={true}
                            />
                        </MPVPanelContent>
                        <MPVPanelContent forwardProps xs data-cy="process-outputs">
                            <ProcessIOCard
                                label={ProcessIOCardType.OUTPUT}
                                params={outputParams}
                                raw={{}}
                                showParams={true}
                            />
                        </MPVPanelContent>
                        <MPVPanelContent xs>
                            <Card className={classes.filesCard}>
                                <ProcessOutputCollectionFiles isWritable={false} currentItemUuid={workflowCollection} />
                            </Card>
                        </MPVPanelContent>
                    </MPVContainer>
                    : null;
            }

            handleContextMenu = (event: React.MouseEvent<any>) => {
                const { uuid, ownerUuid, name, description,
                    kind } = this.props.item;
                const menuKind = this.props.dispatch<any>(resourceUuidToContextMenuKind(uuid));
                const resource = {
                    uuid,
                    ownerUuid,
                    name,
                    description,
                    kind,
                    menuKind,
                };
                // Avoid expanding/collapsing the panel
                event.stopPropagation();
                this.props.dispatch<any>(openContextMenu(event, resource));
            }
        }
    )
);
