// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';

import SpinnerButton from 'components/spinner_button.jsx';

describe('components/SpinnerButton', () => {
    test('should handle onClick', () => {
        const onClick = jest.fn();

        const wrapper = mount(
            <SpinnerButton
                spinning={false}
                onClick={onClick}
            />
        );

        wrapper.find('.btn-primary').simulate('click');
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
