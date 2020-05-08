// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" } }],
    "react/jsx-max-props-per-line": ["error", { "when": "multiline" }],
    "no-underscore-dangle": ["error", { "allow": [ "_id" ] }],
 */

import React from 'react';
import PropTypes from 'prop-types';
import {Route} from 'react-router-dom';

import Pluggable from 'plugins/pluggable';
import AnnouncementBar from 'components/announcement_bar';
import SystemNotice from 'components/system_notice';
import EditPostModal from 'components/edit_post_modal';
import GetPostLinkModal from 'components/get_post_link_modal';
import GetTeamInviteLinkModal from 'components/get_team_invite_link_modal';
import GetPublicLinkModal from 'components/get_public_link_modal';
import InviteMemberModal from 'components/invite_member_modal';
import LeavePrivateChannelModal from 'components/modals/leave_private_channel_modal.jsx';
import RemovedFromChannelModal from 'components/removed_from_channel_modal.jsx';
import ResetStatusModal from 'components/reset_status_modal';
import ShortcutsModal from 'components/shortcuts_modal.jsx';
import SidebarRight from 'components/sidebar_right';
import SidebarRightMenu from 'components/sidebar_right_menu';
import TeamSettingsModal from 'components/team_settings_modal.jsx';
import ImportThemeModal from 'components/user_settings/import_theme_modal.jsx';
import UserSettingsModal from 'components/user_settings/modal';
import ModalController from 'components/modal_controller';
import TeamSidebar from 'components/team_sidebar';
import Sidebar from 'components/sidebar';

import {isMac} from 'utils/utils';

import Page from './Page';

export default class PageController extends React.Component {
    static propTypes = {
        pathName: PropTypes.string.isRequired,
        teamType: PropTypes.string.isRequired,
    };

    render() {
        return (
            <div className='channel-view'>
                <AnnouncementBar/>
                <SystemNotice/>

                <div className='container-fluid'>
                    <SidebarRight/>
                    <SidebarRightMenu teamType={this.props.teamType}/>
                    <Route component={TeamSidebar}/>
                    <Route component={Sidebar}/>
                    <Route component={Page}/>
                    <Pluggable pluggableName='Root'/>
                    <UserSettingsModal/>
                    <GetPostLinkModal/>
                    <GetPublicLinkModal/>
                    <GetTeamInviteLinkModal/>
                    <InviteMemberModal/>
                    <ImportThemeModal/>
                    <TeamSettingsModal/>
                    <EditPostModal/>
                    <RemovedFromChannelModal/>
                    <ResetStatusModal/>
                    <LeavePrivateChannelModal/>
                    <ShortcutsModal isMac={isMac()}/>
                    <ModalController/>
                </div>
            </div>
        );
    }
}
