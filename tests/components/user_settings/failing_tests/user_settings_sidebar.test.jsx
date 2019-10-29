// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import UserSettingsSidebar from 'components/user_settings/sidebar/user_settings_sidebar.jsx';

describe('components/user_settings/sidebar/UserSettingsSidebar', () => {
    const defaultProps = {
        closeUnusedDirectMessages: 'after_seven_days',
        displayUnreadSection: 'true',
        showUnusedOption: false,
        showUnreadOption: true,
        channelSwitcherOption: 'true',
        user: {
            id: 'someuserid',
        },
        closeModal: () => () => true,
        collapseModal: () => () => true,
        updateSection: () => () => true,
        actions: {
            savePreferences: () => true,
        },
    };

    test('should pass handleChange', () => {
        const props = {...defaultProps, activeSection: 'unreadChannels'};
        const wrapper = mountWithIntl(<UserSettingsSidebar {...props}/>);
        wrapper.find('#unreadSectionNever').simulate('change');

        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            show_unread_section: 'false',
            channel_switcher_section: defaultProps.channelSwitcherOption,
        });

        wrapper.find('#unreadSectionEnabled').simulate('change');
        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            show_unread_section: 'true',
            channel_switcher_section: defaultProps.channelSwitcherOption,
        });
    });
});
