// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import React from 'react';
import {
    StyleRulesCallback, WithStyles, withStyles,
    IconButton, Grid, Tooltip, Typography, ExpansionPanel,
    ExpansionPanelSummary, ExpansionPanelDetails
} from '@material-ui/core';
import { connect, DispatchProp } from "react-redux";
import { RouteComponentProps } from 'react-router';
import { ArvadosTheme } from 'common/custom-theme';
import { RootState } from 'store/store';
import { MoreOptionsIcon, CollectionIcon, ReadOnlyIcon, ExpandIcon, CollectionOldVersionIcon } from 'components/icon/icon';
import { DetailsAttribute } from 'components/details-attribute/details-attribute';
import { CollectionResource, getCollectionUrl } from 'models/collection';
import { CollectionPanelFiles } from 'views-components/collection-panel-files/collection-panel-files';
import { CollectionTagForm } from './collection-tag-form';
import { deleteCollectionTag, navigateToProcess, collectionPanelActions } from 'store/collection-panel/collection-panel-action';
import { getResource } from 'store/resources/resources';
import { openContextMenu, resourceUuidToContextMenuKind } from 'store/context-menu/context-menu-actions';
import { formatDate, formatFileSize } from "common/formatters";
import { openDetailsPanel } from 'store/details-panel/details-panel-action';
import { snackbarActions, SnackbarKind } from 'store/snackbar/snackbar-actions';
import { getPropertyChip } from 'views-components/resource-properties-form/property-chip';
import { IllegalNamingWarning } from 'components/warning/warning';
import { GroupResource } from 'models/group';
import { UserResource } from 'models/user';
import { getUserUuid } from 'common/getuser';
import { getProgressIndicator } from 'store/progress-indicator/progress-indicator-reducer';
import { COLLECTION_PANEL_LOAD_FILES, loadCollectionFiles, COLLECTION_PANEL_LOAD_FILES_THRESHOLD } from 'store/collection-panel/collection-panel-files/collection-panel-files-actions';
import { Link } from 'react-router-dom';
import { Link as ButtonLink } from '@material-ui/core';
import { ResourceOwnerWithName, ResponsiblePerson } from 'views-components/data-explorer/renderers';

type CssRules = 'root'
    | 'button'
    | 'filesCard'
    | 'iconHeader'
    | 'tag'
    | 'label'
    | 'value'
    | 'link'
    | 'centeredLabel'
    | 'warningLabel'
    | 'collectionName'
    | 'readOnlyIcon';

const styles: StyleRulesCallback<CssRules> = (theme: ArvadosTheme) => ({
    root: {
        display: 'flex',
        flexFlow: 'column',
        height: 'calc(100vh - 130px)', // (100% viewport height) - (top bar + breadcrumbs)
    },
    button: {
        cursor: 'pointer'
    },
    filesCard: {
        marginBottom: theme.spacing.unit * 2,
        flex: 1,
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
    }
});

interface CollectionPanelDataProps {
    item: CollectionResource;
    isWritable: boolean;
    isOldVersion: boolean;
    isLoadingFiles: boolean;
    tooManyFiles: boolean;
}

type CollectionPanelProps = CollectionPanelDataProps & DispatchProp
    & WithStyles<CssRules> & RouteComponentProps<{ id: string }>;

export const CollectionPanel = withStyles(styles)(
    connect((state: RootState, props: RouteComponentProps<{ id: string }>) => {
        const currentUserUUID = getUserUuid(state);
        const item = getResource<CollectionResource>(props.match.params.id)(state.resources);
        let isWritable = false;
        const isOldVersion = item && item.currentVersionUuid !== item.uuid;
        if (item && !isOldVersion) {
            if (item.ownerUuid === currentUserUUID) {
                isWritable = true;
            } else {
                const itemOwner = getResource<GroupResource | UserResource>(item.ownerUuid)(state.resources);
                if (itemOwner && itemOwner.writableBy) {
                    isWritable = itemOwner.writableBy.indexOf(currentUserUUID || '') >= 0;
                }
            }
        }
        const loadingFilesIndicator = getProgressIndicator(COLLECTION_PANEL_LOAD_FILES)(state.progressIndicator);
        const isLoadingFiles = (loadingFilesIndicator && loadingFilesIndicator!.working) || false;
        const tooManyFiles = (!state.collectionPanel.loadBigCollections && item && item.fileCount > COLLECTION_PANEL_LOAD_FILES_THRESHOLD) || false;
        return { item, isWritable, isOldVersion, isLoadingFiles, tooManyFiles };
    })(
        class extends React.Component<CollectionPanelProps> {
            render() {
                const { classes, item, dispatch, isWritable, isOldVersion, isLoadingFiles, tooManyFiles } = this.props;
                return item
                    ? <div className={classes.root}>
                        <ExpansionPanel data-cy='collection-info-panel' defaultExpanded>
                            <ExpansionPanelSummary expandIcon={<ExpandIcon />}>
                                <Grid container justify="space-between">
                                    <Grid item xs={11}><span>
                                        <IconButton onClick={this.openCollectionDetails}>
                                            {isOldVersion
                                                ? <CollectionOldVersionIcon className={classes.iconHeader} />
                                                : <CollectionIcon className={classes.iconHeader} />}
                                        </IconButton>
                                        <IllegalNamingWarning name={item.name} />
                                        <span>
                                            {item.name}
                                            {isWritable ||
                                                <Tooltip title="Read-only">
                                                    <ReadOnlyIcon data-cy="read-only-icon" className={classes.readOnlyIcon} />
                                                </Tooltip>
                                            }
                                        </span>
                                    </span></Grid>
                                    <Grid item xs={1} style={{ textAlign: "right" }}>
                                        <Tooltip title="Actions" disableFocusListener>
                                            <IconButton
                                                data-cy='collection-panel-options-btn'
                                                aria-label="Actions"
                                                onClick={this.handleContextMenu}>
                                                <MoreOptionsIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                </Grid>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container justify="space-between">
                                    <Grid item xs={12}>
                                        <Typography variant="caption">
                                            {item.description}
                                        </Typography>
                                        <CollectionDetailsAttributes item={item} classes={classes} twoCol={true} showVersionBrowser={() => dispatch<any>(openDetailsPanel(item.uuid, 1))} />
                                        {(item.properties.container_request || item.properties.containerRequest) &&
                                            <span onClick={() => dispatch<any>(navigateToProcess(item.properties.container_request || item.properties.containerRequest))}>
                                                <DetailsAttribute classLabel={classes.link} label='Link to process' />
                                            </span>
                                        }
                                        {isOldVersion &&
                                            <Typography className={classes.warningLabel} variant="caption">
                                                This is an old version. Make a copy to make changes. Go to the <Link to={getCollectionUrl(item.currentVersionUuid)}>head version</Link> for sharing options.
                                          </Typography>
                                        }
                                    </Grid>
                                </Grid>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <ExpansionPanel data-cy='collection-properties-panel' defaultExpanded>
                            <ExpansionPanelSummary expandIcon={<ExpandIcon />}>
                                {"Properties"}
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container>
                                    {isWritable && <Grid item xs={12}>
                                        <CollectionTagForm />
                                    </Grid>}
                                    <Grid item xs={12}>
                                        {Object.keys(item.properties).length > 0
                                            ? Object.keys(item.properties).map(k =>
                                                Array.isArray(item.properties[k])
                                                    ? item.properties[k].map((v: string) =>
                                                        getPropertyChip(
                                                            k, v,
                                                            isWritable
                                                                ? this.handleDelete(k, v)
                                                                : undefined,
                                                            classes.tag))
                                                    : getPropertyChip(
                                                        k, item.properties[k],
                                                        isWritable
                                                            ? this.handleDelete(k, item.properties[k])
                                                            : undefined,
                                                        classes.tag)
                                            )
                                            : <div className={classes.centeredLabel}>No properties set on this collection.</div>
                                        }
                                    </Grid>
                                </Grid>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                        <div className={classes.filesCard}>
                            <CollectionPanelFiles
                                isWritable={isWritable}
                                isLoading={isLoadingFiles}
                                tooManyFiles={tooManyFiles}
                                loadFilesFunc={() => {
                                    dispatch(collectionPanelActions.LOAD_BIG_COLLECTIONS(true));
                                    dispatch<any>(loadCollectionFiles(this.props.item.uuid));
                                }
                                } />
                        </div>
                    </div>
                    : null;
            }

            handleContextMenu = (event: React.MouseEvent<any>) => {
                const { uuid, ownerUuid, name, description, kind, storageClassesDesired } = this.props.item;
                const menuKind = this.props.dispatch<any>(resourceUuidToContextMenuKind(uuid));
                const resource = {
                    uuid,
                    ownerUuid,
                    name,
                    description,
                    storageClassesDesired,
                    kind,
                    menuKind,
                };
                // Avoid expanding/collapsing the panel
                event.stopPropagation();
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

            openCollectionDetails = (e: React.MouseEvent<HTMLElement>) => {
                const { item } = this.props;
                if (item) {
                    e.stopPropagation();
                    this.props.dispatch<any>(openDetailsPanel(item.uuid));
                }
            }

            titleProps = {
                onClick: this.openCollectionDetails
            };

        }
    )
);

export const CollectionDetailsAttributes = (props: { item: CollectionResource, twoCol: boolean, classes?: Record<CssRules, string>, showVersionBrowser?: () => void }) => {
    const item = props.item;
    const classes = props.classes || { label: '', value: '', button: '' };
    const isOldVersion = item && item.currentVersionUuid !== item.uuid;
    const mdSize = props.twoCol ? 6 : 12;
    const showVersionBrowser = props.showVersionBrowser;
    const responsiblePersonRef = React.useRef(null);
    return <Grid container>
        <Grid item xs={12} md={mdSize}>
            <DetailsAttribute classLabel={classes.label} classValue={classes.value}
                label={isOldVersion ? "This version's UUID" : "Collection UUID"}
                linkToUuid={item.uuid} />
        </Grid>
        <Grid item xs={12} md={mdSize}>
            <DetailsAttribute classLabel={classes.label} classValue={classes.value}
                label={isOldVersion ? "This version's PDH" : "Portable data hash"}
                linkToUuid={item.portableDataHash} />
        </Grid>
        <Grid item xs={12} md={mdSize}>
            <DetailsAttribute classLabel={classes.label} classValue={classes.value}
                label='Owner' linkToUuid={item.ownerUuid}
                uuidEnhancer={(uuid: string) => <ResourceOwnerWithName uuid={uuid} />} />
        </Grid>
        <div data-cy="responsible-person-wrapper" ref={responsiblePersonRef}>
            <Grid item xs={12} md={12}>
                <DetailsAttribute classLabel={classes.label} classValue={classes.value}
                    label='Responsible person' linkToUuid={item.ownerUuid}
                    uuidEnhancer={(uuid: string) => <ResponsiblePerson uuid={item.uuid} parentRef={responsiblePersonRef.current} />} />
            </Grid>
        </div>
        <Grid item xs={12} md={mdSize}>
            <DetailsAttribute classLabel={classes.label} classValue={classes.value}
                label='Head version'
                value={isOldVersion ? undefined : 'this one'}
                linkToUuid={isOldVersion ? item.currentVersionUuid : undefined} />
        </Grid>
        <Grid item xs={12} md={mdSize}>
            <DetailsAttribute
                classLabel={classes.label} classValue={classes.value}
                label='Version number'
                value={showVersionBrowser !== undefined
                    ? <Tooltip title="Open version browser"><ButtonLink underline='none' className={classes.button} onClick={() => showVersionBrowser()}>
                        {<span data-cy='collection-version-number'>{item.version}</span>}
                    </ButtonLink></Tooltip>
                    : item.version
                }
            />
        </Grid>
        <Grid item xs={12} md={mdSize}>
            <DetailsAttribute label='Created at' value={formatDate(item.createdAt)} />
        </Grid>
        <Grid item xs={12} md={mdSize}>
            <DetailsAttribute label='Last modified' value={formatDate(item.modifiedAt)} />
        </Grid>
        <Grid item xs={12} md={mdSize}>
            <DetailsAttribute classLabel={classes.label} classValue={classes.value}
                label='Number of files' value={<span data-cy='collection-file-count'>{item.fileCount}</span>} />
        </Grid>
        <Grid item xs={12} md={mdSize}>
            <DetailsAttribute classLabel={classes.label} classValue={classes.value}
                label='Content size' value={formatFileSize(item.fileSizeTotal)} />
        </Grid>
        <Grid item xs={12} md={mdSize}>
            <DetailsAttribute classLabel={classes.label} classValue={classes.value}
                label='Storage classes' value={item.storageClassesDesired.join(', ')} />
        </Grid>
    </Grid>;
};
