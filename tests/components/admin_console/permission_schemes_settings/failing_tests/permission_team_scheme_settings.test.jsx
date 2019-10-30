// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import PermissionTeamSchemeSettings from 'components/admin_console/permission_schemes_settings/permission_team_scheme_settings/permission_team_scheme_settings.jsx';
import SaveButton from 'components/save_button.jsx';

describe('components/admin_console/permission_schemes_settings/permission_team_scheme_settings/permission_team_scheme_settings', () => {
    const defaultProps = {
        location: {},
        schemeId: '',
        scheme: null,
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
            aaa: {
                permissions: [],
            },
            bbb: {
                permissions: [],
            },
            ccc: {
                permissions: [],
            },
            ddd: {
                permissions: [],
            },
            eee: {
                permissions: [],
            },
            fff: {
                permissions: [],
            },
        },
        teams: [
        ],
        actions: {
            loadRolesIfNeeded: jest.fn().mockReturnValue(Promise.resolve()),
            loadRole: jest.fn(),
            loadScheme: jest.fn().mockReturnValue(Promise.resolve()),
            loadSchemeTeams: jest.fn(),
            editRole: jest.fn(),
            patchScheme: jest.fn(),
            createScheme: jest.fn(),
            updateTeamScheme: jest.fn(),
            setNavigationBlocked: jest.fn(),
        },
        history: {
            push: jest.fn(),
        },
    };

    test('should save each role on save clicked except system_admin role', (done) => {
        const editRole = jest.fn().mockImplementation(() => Promise.resolve({data: {}}));
        const createScheme = jest.fn().mockImplementation(() => Promise.resolve({
            data: {
                id: '123',
                default_team_user_role: 'aaa',
                default_team_admin_role: 'bbb',
                default_channel_user_role: 'ccc',
                default_channel_admin_role: 'ddd',
            },
        }));
        const updateTeamScheme = jest.fn().mockImplementation(() => Promise.resolve({}));
        const wrapper = shallow(
            <PermissionTeamSchemeSettings
                {...defaultProps}
                actions={{...defaultProps.actions, editRole, createScheme, updateTeamScheme}}
            />
        );

        expect(wrapper).toMatchSnapshot();
        wrapper.find(SaveButton).simulate('click');
        setTimeout(() => {
            expect(editRole).toHaveBeenCalledTimes(4);
            done();
        });
    });

    test('should show error if createScheme fails', (done) => {
        const editRole = jest.fn().mockImplementation(() => Promise.resolve({}));
        const createScheme = jest.fn().mockImplementation(() => Promise.resolve({error: {message: 'test error'}}));
        const updateTeamScheme = jest.fn().mockImplementation(() => Promise.resolve({}));
        const wrapper = shallow(
            <PermissionTeamSchemeSettings
                {...defaultProps}
                actions={{...defaultProps.actions, editRole, createScheme, updateTeamScheme}}
            />
        );

        wrapper.find(SaveButton).simulate('click');
        setTimeout(() => {
            expect(wrapper.state().serverError).toBe('test error');
            done();
        });
    });
});
