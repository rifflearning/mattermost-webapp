// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import PermissionSystemSchemeSettings from 'components/admin_console/permission_schemes_settings/permission_system_scheme_settings/permission_system_scheme_settings.jsx';
import SaveButton from 'components/save_button.jsx';

describe('components/admin_console/permission_schemes_settings/permission_system_scheme_settings/permission_system_scheme_settings', () => {
    const defaultProps = {
        license: {
            IsLicensed: 'true',
            CustomPermissionsSchemes: 'true',
        },
        location: {},
        roles: {
            system_user: {
                permissions: [],
            },
            team_user: {
                permissions: [],
            },
            channel_user: {
                permissions: [],
            },
            system_admin: {
                permissions: [],
            },
            team_admin: {
                permissions: [],
            },
            channel_admin: {
                permissions: [],
            },
        },
        actions: {
            loadRolesIfNeeded: jest.fn().mockReturnValue(Promise.resolve()),
            editRole: jest.fn(),
            setNavigationBlocked: jest.fn(),
        },
    };

    test('should show error if editRole fails', (done) => {
        const editRole = jest.fn().mockImplementation(() => Promise.resolve({error: {message: 'test error'}}));
        const wrapper = shallow(
            <PermissionSystemSchemeSettings
                {...defaultProps}
                actions={{...defaultProps.actions, editRole}}
            />
        );

        wrapper.find(SaveButton).simulate('click');
        setTimeout(() => {
            expect(wrapper.state().serverError).toBe('test error');
            done();
        });
    });
});
