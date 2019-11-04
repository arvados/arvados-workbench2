// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeOptions, Theme } from '@material-ui/core/styles/createMuiTheme';
import purple from '@material-ui/core/colors/purple';
import blue from '@material-ui/core/colors/blue';
import grey from '@material-ui/core/colors/grey';
import green from '@material-ui/core/colors/green';
import yellow from '@material-ui/core/colors/yellow';
import red from '@material-ui/core/colors/red';
import teal from '@material-ui/core/colors/teal';

export interface ArvadosThemeOptions extends ThemeOptions {
    customs: any;
}

export interface ArvadosTheme extends Theme {
    customs: {
        colors: Colors
    };
}

interface Colors {
    green700: string;
    yellow700: string;
    red900: string;
    blue500: string;
    purple: string;
}

const arvadosPurple = '#361336';
const purple800 = purple["800"];
const grey500 = grey["500"];
const grey600 = grey["600"];
const grey700 = grey["700"];
const grey900 = grey["900"];
const rocheBlue = '#06C';

export const themeOptions: ArvadosThemeOptions = {
    typography: {
        useNextVariants: true,
    },
    customs: {
        colors: {
            green700: green["700"],
            yellow700: yellow["700"],
            red900: red['900'],
            blue500: blue['500'],
            purple: arvadosPurple
        }
    },
    overrides: {
        MuiTypography: {
            body1: {
                fontSize: '0.8125rem'
            }
        },
        MuiAppBar: {
            colorPrimary: {
                backgroundColor: arvadosPurple
            }
        },
        MuiTabs: {
            root: {
                color: grey600
            },
            indicator: {
                backgroundColor: arvadosPurple
            }
        },
        MuiTab: {
            root: {
                '&$selected': {
                    fontWeight: 700,
                    color: arvadosPurple
                }
            }
        },
        MuiList: {
            root: {
                color: grey900
            }
        },
        MuiListItemText: {
            root: {
                padding: 0
            }
        },
        MuiListItemIcon: {
            root: {
                fontSize: '1.25rem'
            }
        },
        MuiCardHeader: {
            avatar: {
                display: 'flex',
                alignItems: 'center'
            },
            title: {
                color: grey700,
                fontSize: '1.25rem'
            }
        },
        MuiMenuItem: {
            root: {
                padding: '8px 16px'
            }
        },
        MuiInput: {
            root: {
                fontSize: '0.875rem'
            },
            underline: {
                '&:after': {
                    borderBottomColor: arvadosPurple
                },
                '&:hover:not($disabled):not($focused):not($error):before': {
                    borderBottom: '1px solid inherit'
                }
            }
        },
        MuiFormLabel: {
            root: {
                fontSize: '0.875rem',
                "&$focused": {
                    "&$focused:not($error)": {
                        color: arvadosPurple
                    }
                }
            }
        },
        MuiStepIcon: {
            root: {
                '&$active': {
                    color: arvadosPurple
                },
                '&$completed': {
                    color: 'inherited'
                },
            }
        }
    },
    mixins: {
        toolbar: {
            minHeight: '48px'
        }
    },
    palette: {
        primary: {
            main: teal.A700,
            dark: teal.A400,
            contrastText: '#fff'
        }
    },
};

export const CustomTheme = createMuiTheme(themeOptions);