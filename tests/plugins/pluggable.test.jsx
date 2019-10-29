// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {/* mount, */shallow} from 'enzyme';
//import configureStore from 'redux-mock-store';
//import {Provider} from 'react-redux';

import Pluggable from 'plugins/pluggable/pluggable.jsx';

//import {mountWithIntl} from 'tests/helpers/intl-test-helper';
//import ProfilePopover from 'components/profile_popover';

class ProfilePopoverPlugin extends React.PureComponent {
    render() {
        return <span id='pluginId'>{'ProfilePopoverPlugin'}</span>;
    }
}

describe('plugins/Pluggable', () => {
    /*
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
    */

    test('should return null if neither pluggableName nor children is is defined in props', () => {
        const wrapper = shallow(
            <Pluggable
                components={{PopoverSection1: [{component: ProfilePopoverPlugin}]}}
                theme={{id: 'theme_id'}}
            />
        );

        expect(wrapper.type()).toBe(null);
    });

    test('should return null if with pluggableName but no children', () => {
        const wrapper = shallow(
            <Pluggable
                pluggableName='PopoverSection1'
                components={{}}
                theme={{id: 'theme_id'}}
            />
        );

        expect(wrapper.type()).toBe(null);
    });
});
