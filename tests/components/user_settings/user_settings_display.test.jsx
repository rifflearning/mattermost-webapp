// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import UserSettingsDisplay from 'components/user_settings/display/user_settings_display.jsx';

jest.mock('actions/user_actions.jsx', () => ({
    savePreferences: jest.fn(),
}));

describe('components/user_settings/display/UserSettingsDisplay', () => {
    const user = {
        id: 'user_id',
        username: 'username',
        locale: 'en',
        timezone: {
            useAutomaticTimezone: 'true',
            automaticTimezone: 'America/New_York',
            manualTimezone: '',
        },
    };

    const requiredProps = {
        user,
        updateSection: jest.fn(),
        updateTab: jest.fn(),
        activeSection: '',
        closeModal: jest.fn(),
        collapseModal: jest.fn(),
        setRequireConfirm: jest.fn(),
        setEnforceFocus: jest.fn(),
        enableLinkPreviews: true,
        enableThemeSelection: false,
        defaultClientLocale: 'en',
        timezones: [
            'America/New_York',
            'America/Los_Angeles',
        ],
        userTimezone: {
            useAutomaticTimezone: 'true',
            automaticTimezone: 'America/New_York',
            manualTimezone: '',
        },
        actions: {
            getSupportedTimezones: jest.fn(),
            autoUpdateTimezone: jest.fn(),
        },
    };

    test('should match snapshot, no active section', () => {
        const wrapper = shallow(<UserSettingsDisplay {...requiredProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, collapse section', () => {
        const props = {...requiredProps, activeSection: 'collapse'};
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, link preview section with EnableLinkPreviews is false', () => {
        const props = {
            ...requiredProps,
            activeSection: 'linkpreview',
            enableLinkPreviews: false,
        };
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, link preview section with EnableLinkPreviews is true', () => {
        const props = {
            ...requiredProps,
            activeSection: 'linkpreview',
            enableLinkPreviews: true,
        };
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, clock section', () => {
        const props = {...requiredProps, activeSection: 'clock'};
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, teammate name display section', () => {
        const props = {...requiredProps, activeSection: 'teammate_name_display'};
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, timezone section', () => {
        const props = {...requiredProps, activeSection: 'timezone'};
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, message display section', () => {
        const props = {...requiredProps, activeSection: 'message_display'};
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, channel display mode section', () => {
        const props = {...requiredProps, activeSection: 'channel_display_mode'};
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, languages section', () => {
        const props = {...requiredProps, activeSection: 'languages'};
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, theme section with EnableThemeSelection is false', () => {
        const props = {
            ...requiredProps,
            activeSection: 'theme',
            enableThemeSelection: false,
        };
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, theme section with EnableThemeSelection is true', () => {
        const props = {
            ...requiredProps,
            activeSection: 'theme',
            enableThemeSelection: true,
        };
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
