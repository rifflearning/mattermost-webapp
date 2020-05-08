// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';

import ChangeURLModal from 'components/change_url_modal/change_url_modal';

describe('components/ChangeURLModal', () => {
    const baseProps = {
        show: true,
        onDataChanged: jest.fn(),
        currentTeamURL: 'http://example.com/channel/',
        onModalSubmit: jest.fn(),
        onModalDismissed: jest.fn(),
    };

    test('should match snapshot, modal not showing', () => {
        const props = {...baseProps, show: false};
        const wrapper = shallow(
            <ChangeURLModal {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Modal).props().show).toEqual(false);
    });

    test('should match snapshot, modal showing', () => {
        const wrapper = shallow(
            <ChangeURLModal {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Modal).props().show).toEqual(true);
    });

    test('should match snapshot, with a input', () => {
        const props = {...baseProps};
        const wrapper = shallow(
            <ChangeURLModal {...props}/>
        );
        const input = wrapper.find('input');
        expect(wrapper).toMatchSnapshot();
        expect(input.length).toEqual(1);
    });

    test('should match snapshot, on urlError', () => {
        const wrapper = shallow(
            <ChangeURLModal {...baseProps}/>
        );
        wrapper.setState({urlError: true});
        expect(wrapper.find('.has-error').length).toEqual(2);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on currentURL', () => {
        const wrapper = shallow(
            <ChangeURLModal {...baseProps}/>
        );
        wrapper.setState({urlError: true});
        expect(wrapper).toMatchSnapshot();
    });
});
