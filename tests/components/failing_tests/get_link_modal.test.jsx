// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import GetLinkModal from 'components/get_link_modal.jsx';

describe('components/GetLinkModal', () => {
    const onHide = jest.fn();
    const requiredProps = {
        show: true,
        onHide,
        title: 'title',
        link: 'https://mattermost.com',
    };

    test('should have handle copyLink', () => {
        const wrapper = mountWithIntl(
            <GetLinkModal {...requiredProps}/>
        );

        wrapper.instance().copyLink();
        expect(wrapper.state('copiedLink')).toBe(true);
    });
});
