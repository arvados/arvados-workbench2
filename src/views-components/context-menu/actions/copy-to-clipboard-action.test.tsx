// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import * as React from 'react';
import { shallow, configure } from 'enzyme';
import { ListItem } from "@material-ui/core";
import * as Adapter from 'enzyme-adapter-react-16';
import { CopyToClipboardAction } from './copy-to-clipboard-action';

configure({ adapter: new Adapter() });

jest.mock('copy-to-clipboard', () => jest.fn());

describe('CopyToClipboardAction', () => {
    let props;

    beforeEach(() => {
        props = {
            onClick: jest.fn(),
            href: 'https://collections.ardev.roche.com/c=ardev-4zz18-k0hamvtwyit6q56/t=1ha4ykd3w14ed19b2gh3uyjrjup38vsx27x1utwdne0bxcfg5d/LIMS/1.html',
        };
    });

    it('should render properly and handle click', () => {
        // when
        const wrapper = shallow(<CopyToClipboardAction {...props} />);
        wrapper.find(ListItem).simulate('click');

        // then
        expect(wrapper).not.toBeUndefined();

        // and
        expect(props.onClick).toHaveBeenCalled();
    });
});