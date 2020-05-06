// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import SignupLTI from 'components/signup/signup_lti/signup_lti.jsx';

describe('components/signup/SignupLTI', () => {
    const baseProps = {
        customDescriptionText: '',
        actions: {
            createLTIUser: jest.fn(),
        },
        enableSignUpWithLTI: true,
        passwordConfig: {
            minimumLength: 4,
            requireLowercase: false,
            requireUppercase: false,
            requireNumber: false,
            requireSymbol: false,
        },
        privacyPolicyLink: '',
        siteName: 'Mattermost',
        termsOfServiceLink: '',
    };

    test('should have match state and make API call when handleSubmit is called', () => {
        const wrapper = shallow(
            <SignupLTI {...baseProps}/>
        );

        wrapper.instance().refs = {password: {value: 'password'}};
        wrapper.setState({serverError: '', isSubmitting: false});
        wrapper.instance().handleSubmit({preventDefault: jest.fn()});
        expect(wrapper.state('serverError')).toEqual('');
        expect(wrapper.state('isSubmitting')).toEqual(true);
        expect(baseProps.actions.createLTIUser).toBeCalled();
    });
});
