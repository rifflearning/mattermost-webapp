// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';
import configureStore from 'redux-mock-store';
import {Provider} from 'react-redux';

import Pluggable from 'plugins/pluggable/pluggable.jsx';
import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import ProfilePopover from 'components/profile_popover';

class ProfilePopoverPlugin extends React.PureComponent {
    render() {
        return <span id='pluginId'>{'ProfilePopoverPlugin'}</span>;
    }
}

describe('plugins/Pluggable', () => {
    const mockStore = configureStore();
    const store = mockStore({
        entities: {
            general: {
                config: {
                },
            },
            teams: {
                currentTeamId: '',
            },
            preferences: {
                myPreferences: {},
            },
        },
        plugins: {
            components: {},
        },
    });

    test('should match snapshot with no extended component', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <Pluggable
                    components={{}}
                    theme={{}}
                />
            </Provider>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with extended component', () => {
        const wrapper = mount(
            <Provider store={store}>
                <Pluggable
                    pluggableName='PopoverSection1'
                    components={{PopoverSection1: [{component: ProfilePopoverPlugin}]}}
                    theme={{id: 'theme_id'}}
                />
            </Provider>
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#pluginId').text()).toBe('ProfilePopoverPlugin');
    });

    test('should match snapshot with extended component with pluggableName', () => {
        const wrapper = mountWithIntl(
            <Pluggable
                pluggableName='PopoverSection1'
                components={{PopoverSection1: [{component: ProfilePopoverPlugin}]}}
                theme={{id: 'theme_id'}}
            />
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#pluginId').text()).toBe('ProfilePopoverPlugin');
    });

    test('should match snapshot with no overridden component', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <Pluggable
                    components={{}}
                    theme={{}}
                >
                    <ProfilePopover
                        user={{name: 'name'}}
                        src='src'
                    />
                </Pluggable>
            </Provider>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with overridden component', () => {
        const wrapper = mount(
            <Provider store={store}>
                <Pluggable
                    components={{ProfilePopover: [{component: ProfilePopoverPlugin}]}}
                    theme={{id: 'theme_id'}}
                >
                    <ProfilePopover
                        user={{name: 'name'}}
                        src='src'
                    />
                </Pluggable>
            </Provider>
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#pluginId').text()).toBe('ProfilePopoverPlugin');
    });
});
