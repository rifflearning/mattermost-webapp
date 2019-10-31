// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ChannelInfoModal from 'components/channel_info_modal/channel_info_modal.jsx';

describe('components/ChannelInfoModal', () => {
    it('should match snapshot', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <ChannelInfoModal
                channel={{name: 'testchannel', displayName: 'testchannel', header: '', purpose: ''}}
                currentTeam={{id: 'testid', name: 'testteam'}}
                onHide={emptyFunction}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with channel props', () => {
        const channel = {
            name: 'testchannel',
            displayName: 'testchannel',
            header: 'See ~test',
            purpose: 'And ~test too',
            props: {
                channel_mentions: {
                    test: {
                        display_name: 'Test',
                    },
                },
            },
        };
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <ChannelInfoModal
                channel={channel}
                currentTeam={{id: 'testid', name: 'testteam'}}
                onHide={emptyFunction}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });
});
