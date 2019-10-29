// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';
import {Permissions} from 'mattermost-redux/constants';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import Constants from 'utils/constants.jsx';
import NewChannelModal from 'components/new_channel_modal/new_channel_modal.jsx';

describe('components/NewChannelModal', () => {
    const mockStore = configureStore();
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

    test('should match when handleChange is called', () => {
        const newOnDataChanged = jest.fn();
        const props = {...baseProps, onDataChanged: newOnDataChanged};

        const state = {
            entities: {
                channels: {
                    myMembers: [],
                },
                teams: {
                    myMembers: [],
                },
                users: {
                    currentUserId: 'user_id',
                    profiles: {
                        user_id: {
                            id: 'user_id',
                            roles: 'system_admin',
                        },
                    },
                },
                roles: {
                    roles: {
                        system_admin: {
                            permissions: [
                                Permissions.CREATE_PUBLIC_CHANNEL,
                                Permissions.CREATE_PRIVATE_CHANNEL,
                            ],
                        },
                    },
                },
            },
        };
        const store = mockStore(state);

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <NewChannelModal {...props}/>
            </Provider>
        );
        const modal = wrapper.find(NewChannelModal).instance();

        const refDisplayName = modal.refs.display_name;
        refDisplayName.value = 'new display_name';

        const refChannelHeader = modal.refs.channel_header;
        refChannelHeader.value = 'new channel_header';

        const refChannelPurpose = modal.refs.channel_purpose;
        refChannelPurpose.value = 'new channel_purpose';

        modal.handleChange();

        expect(newOnDataChanged).toHaveBeenCalledTimes(1);
        expect(newOnDataChanged).toHaveBeenCalledWith({displayName: 'new display_name', header: 'new channel_header', purpose: 'new channel_purpose'});
    });

    test('should match when handleSubmit is called', () => {
        const newOnSubmitChannel = jest.fn();
        const props = {...baseProps, onSubmitChannel: newOnSubmitChannel};

        const state = {
            entities: {
                channels: {
                    myMembers: [],
                },
                teams: {
                    myMembers: [],
                },
                users: {
                    currentUserId: 'user_id',
                    profiles: {
                        user_id: {
                            id: 'user_id',
                            roles: '',
                        },
                    },
                },
                roles: {
                    roles: {
                    },
                },
            },
        };
        const store = mockStore(state);

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <NewChannelModal {...props}/>
            </Provider>
        );
        const modal = wrapper.find(NewChannelModal).instance();
        modal.handleSubmit({preventDefault: jest.fn()});

        expect(newOnSubmitChannel).toHaveBeenCalledTimes(1);
        expect(modal.state.displayNameError).toEqual('');
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
