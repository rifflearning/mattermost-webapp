// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';

import Constants from 'utils/constants.jsx';
import NewChannelModal from 'components/new_channel_modal/new_channel_modal.jsx';

describe('components/NewChannelModal', () => {
    const channelData = {name: 'testchannel', displayName: 'testchannel', header: '', purpose: ''};
    const baseProps = {
        show: true,
        channelType: Constants.OPEN_CHANNEL,
        currentTeamId: 'test_team_id',
        channelData,
        onSubmitChannel: jest.fn(),
        onModalDismissed: jest.fn(),
        onTypeSwitched: jest.fn(),
        onChangeURLPressed: jest.fn(),
        onDataChanged: jest.fn(),
    };

    test('should match snapshot, modal not showing', () => {
        const props = {...baseProps, show: false};
        const wrapper = shallow(
            <NewChannelModal {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Modal).props().show).toEqual(false);
    });

    test('should match snapshot, modal showing', () => {
        const wrapper = shallow(
            <NewChannelModal {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Modal).props().show).toEqual(true);
    });

    test('should match snapshot, private channel filled in header and purpose', () => {
        const newChannelData = {name: 'testchannel', displayName: 'testchannel', header: 'some header', purpose: 'some purpose'};
        const props = {...baseProps, channelData: newChannelData, channelType: Constants.PRIVATE_CHANNEL};

        const wrapper = shallow(
            <NewChannelModal {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on displayNameError', () => {
        const wrapper = shallow(
            <NewChannelModal {...baseProps}/>
        );
        wrapper.setState({displayNameError: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on serverError', () => {
        const props = {...baseProps, serverError: 'server error'};
        const wrapper = shallow(
            <NewChannelModal {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should have called handleSubmit on onEnterKeyDown', () => {
        const wrapper = shallow(
            <NewChannelModal {...baseProps}/>
        );
        wrapper.instance().handleSubmit = jest.fn();

        let evt = {ctrlSend: true, key: Constants.KeyCodes.ENTER[0], ctrlKey: true};
        wrapper.instance().onEnterKeyDown(evt);
        expect(wrapper.instance().handleSubmit).toHaveBeenCalledTimes(1);
        expect(wrapper.instance().handleSubmit).toHaveBeenCalledWith(evt);

        evt = {ctrlSend: false, key: Constants.KeyCodes.ENTER[0], shiftKey: false, altKey: false};
        wrapper.instance().onEnterKeyDown(evt);
        expect(wrapper.instance().handleSubmit).toHaveBeenCalledTimes(2);
        expect(wrapper.instance().handleSubmit).toHaveBeenCalledWith(evt);
    });
});
