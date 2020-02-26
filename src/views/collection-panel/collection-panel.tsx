// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import * as React from 'react';
import {
    StyleRulesCallback, WithStyles, withStyles, Card,
    CardHeader, IconButton, CardContent, Grid, Tooltip
} from '@material-ui/core';
import { connect, DispatchProp } from "react-redux";
import { RouteComponentProps } from 'react-router';
import { ArvadosTheme } from '~/common/custom-theme';
import { RootState } from '~/store/store';
import { MoreOptionsIcon, CollectionIcon } from '~/components/icon/icon';
import { DetailsAttribute } from '~/components/details-attribute/details-attribute';
import { CollectionResource } from '~/models/collection';
import { CollectionPanelFiles } from '~/views-components/collection-panel-files/collection-panel-files';
import { CollectionTagForm } from './collection-tag-form';
import { deleteCollectionTag, navigateToProcess } from '~/store/collection-panel/collection-panel-action';
import { getResource } from '~/store/resources/resources';
import { openContextMenu } from '~/store/context-menu/context-menu-actions';
import { ContextMenuKind } from '~/views-components/context-menu/context-menu';
import { formatFileSize } from "~/common/formatters";
import { openDetailsPanel } from '~/store/details-panel/details-panel-action';
import { snackbarActions, SnackbarKind } from '~/store/snackbar/snackbar-actions';
import { getPropertyChip } from '~/views-components/resource-properties-form/property-chip';
import { IllegalNamingWarning } from '~/components/warning/warning';
import { getUserUuid } from '~/common/getuser';

type CssRules = 'card' | 'iconHeader' | 'tag' | 'label' | 'value' | 'link';

const styles: StyleRulesCallback<CssRules> = (theme: ArvadosTheme) => ({
    card: {
        marginBottom: theme.spacing.unit * 2
    },
    iconHeader: {
        fontSize: '1.875rem',
        color: theme.customs.colors.yellow700
    },
    tag: {
        marginRight: theme.spacing.unit,
        marginBottom: theme.spacing.unit
    },
    label: {
        fontSize: '0.875rem'
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
    }
});

interface CollectionPanelDataProps {
    item: CollectionResource;
    userUuid: string;
}

type CollectionPanelProps = CollectionPanelDataProps & DispatchProp
    & WithStyles<CssRules> & RouteComponentProps<{ id: string }>;

export const CollectionPanel = withStyles(styles)(
    connect((state: RootState, props: RouteComponentProps<{ id: string }>) => {
        const item = getResource(props.match.params.id)(state.resources);
        const userUuid = getUserUuid(state);
        return { item, userUuid };
    })(
        class extends React.Component<CollectionPanelProps> {

            render() {
                const { classes, item, dispatch } = this.props;
                return item
                    ? <>
                        <Card className={classes.card}>
                            <CardHeader
                                avatar={
                                    <IconButton onClick={this.openCollectionDetails}>
                                        <CollectionIcon className={classes.iconHeader} />
                                    </IconButton>
                                }
                                action={
                                    <Tooltip title="More options" disableFocusListener>
                                        <IconButton
                                            aria-label="More options"
                                            onClick={this.handleContextMenu}>
                                            <MoreOptionsIcon />
                                        </IconButton>
                                    </Tooltip>
                                }
                                title={item && <span><IllegalNamingWarning name={item.name} />{item.name}</span>}
                                titleTypographyProps={this.titleProps}
                                subheader={item && item.description}
                                subheaderTypographyProps={this.titleProps} />
                            <CardContent>
                                <Grid container direction="column">
                                    <Grid item xs={10}>
                                        <DetailsAttribute classLabel={classes.label} classValue={classes.value}
                                            label='Collection UUID'
                                            linkToUuid={item && item.uuid} />
                                        <DetailsAttribute classLabel={classes.label} classValue={classes.value}
                                            label='Portable data hash'
                                            linkToUuid={item && item.portableDataHash} />
                                        <DetailsAttribute classLabel={classes.label} classValue={classes.value}
                                            label='Number of files' value={item && item.fileCount} />
                                        <DetailsAttribute classLabel={classes.label} classValue={classes.value}
                                            label='Content size' value={item && formatFileSize(item.fileSizeTotal)} />
                                        <DetailsAttribute classLabel={classes.label} classValue={classes.value}
                                            label='Owner' linkToUuid={item && item.ownerUuid} />
                                        {(item.properties.container_request || item.properties.containerRequest) &&
                                            <span onClick={() => dispatch<any>(navigateToProcess(item.properties.container_request || item.properties.containerRequest))}>
                                                <DetailsAttribute classLabel={classes.link} label='Link to process' />
                                            </span>
                                        }
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        <Card className={classes.card}>
                            <CardHeader title="Properties" />
                            <CardContent>
                                <Grid container direction="column">
                                    <Grid item xs={12}>
                                        <CollectionTagForm />
                                    </Grid>
                                    <Grid item xs={12}>
                                        {Object.keys(item.properties).map(k =>
                                            Array.isArray(item.properties[k])
                                                ? item.properties[k].map((v: string) =>
                                                    getPropertyChip(
                                                        k, v,
                                                        this.handleDelete(k, v),
                                                        classes.tag))
                                                : getPropertyChip(
                                                    k, item.properties[k],
                                                    this.handleDelete(k, item.properties[k]),
                                                    classes.tag)
                                        )}
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                        <div className={classes.card}>
                            <CollectionPanelFiles />
                        </div>
                    </>
                    : null;
            }

            handleContextMenu = (event: React.MouseEvent<any>) => {
                const { userUuid } = this.props;
                const { uuid, ownerUuid, name, description, kind, isTrashed, writableBy = [] } = this.props.item;
                const writable = writableBy.indexOf(userUuid) >= 0;
                const menuKind = writable ? isTrashed
                    ? ContextMenuKind.TRASHED_COLLECTION
                    : ContextMenuKind.COLLECTION : ContextMenuKind.NON_WRITABLE_COLLECTION;

                const resource = {
                    uuid,
                    ownerUuid,
                    name,
                    description,
                    kind,
                    menuKind
                };
                this.props.dispatch<any>(openContextMenu(event, resource));
            }

            onCopy = (message: string) =>
                this.props.dispatch(snackbarActions.OPEN_SNACKBAR({
                    message,
                    hideDuration: 2000,
                    kind: SnackbarKind.SUCCESS
                }))

            handleDelete = (key: string, value: string) => () => {
                this.props.dispatch<any>(deleteCollectionTag(key, value));
            }

            openCollectionDetails = () => {
                const { item } = this.props;
                if (item) {
                    this.props.dispatch(openDetailsPanel(item.uuid));
                }
            }

            titleProps = {
                onClick: this.openCollectionDetails
            };

        }
    )
);
