// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import ChangeURLModal from 'components/change_url_modal/change_url_modal';

describe('components/ChangeURLModal', () => {
    const baseProps = {
        show: true,
        onDataChanged: jest.fn(),
        currentTeamURL: 'http://example.com/channel/',
        onModalSubmit: jest.fn(),
        onModalDismissed: jest.fn(),
    };

    test('should match state when onSubmit is called with a valid URL', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
        );
        const refURLInput = wrapper.ref('urlinput');
        refURLInput.value = 'urlexample';

        wrapper.instance().onSubmit({preventDefault: jest.fn()});

        expect(wrapper.state('urlError')).toEqual('');
    });

    test('should match state when onSubmit is called with a invalid URL', () => {
        const value = 'a';
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
        );
        const refURLInput = wrapper.ref('urlinput');
        refURLInput.value = value;

        wrapper.instance().onSubmit({preventDefault: jest.fn()});

        expect(wrapper.state('urlError').length).toEqual(1);
    });

    test('should match state when onURLChanged is called', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
        );
        const value = 'URLEXAMPLE';
        const target = {value};
        wrapper.instance().onURLChanged({target});

        expect(wrapper.state('userEdit')).toEqual(true);
        expect(wrapper.state('currentURL')).toEqual('urlexample');
    });

    test('should match state when onCancel is called', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
        );
        wrapper.instance().onCancel();

        expect(wrapper.state('urlError')).toEqual('');
        expect(wrapper.state('userEdit')).toEqual(false);
    });

    test('should match when getURLError is called with a non specific error', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
        );
        const param = 'exampleurl';

        wrapper.instance().formattedError = jest.fn();
        wrapper.update();

        const returned = wrapper.instance().getURLError(param);
        expect(returned.length).toEqual(1);
        expect(wrapper.instance().formattedError).toBeCalledWith(
            'errorlast',
            'change_url.invalidUrl',
            'Invalid URL'
        );
    });

    test('should match when getURLError is called with a 1 character url', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
        );
        const param = 'a';

        wrapper.instance().formattedError = jest.fn();
        wrapper.update();

        const returned = wrapper.instance().getURLError(param);
        expect(returned.length).toEqual(1);
        expect(wrapper.instance().formattedError).toBeCalledWith(
            'error1',
            'change_url.longer',
            'URL must be two or more characters.'
        );
    });

    test('should match when getURLError is called with a non alphanumeric start, end and two undescores', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
        );
        const param = '_a__';

        wrapper.instance().formattedError = jest.fn();
        wrapper.update();

        const returned = wrapper.instance().getURLError(param);
        expect(returned.length).toEqual(3);
        expect(wrapper.instance().formattedError).toBeCalledWith(
            'error2',
            'change_url.startWithLetter',
            'URL must start with a letter or number.'
        );
        expect(wrapper.instance().formattedError).toBeCalledWith(
            'error3',
            'change_url.endWithLetter',
            'URL must end with a letter or number.'
        );
        expect(wrapper.instance().formattedError).toBeCalledWith(
            'error4',
            'change_url.noUnderscore',
            'URL can not contain two underscores in a row.'
        );
    });
});
