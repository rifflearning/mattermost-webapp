import React from 'react';
import PropTypes from 'prop-types';
import {Route} from 'react-router-dom';

import AnnouncementBar from 'components/announcement_bar';
import SystemNotice from 'components/system_notice';
import InviteMemberModal from 'components/invite_member_modal';
import ModalController from 'components/modal_controller';
import ImportThemeModal from 'components/user_settings/import_theme_modal.jsx';

import WebRtc from './webrtc';

export default class WebrtcController extends React.Component {
    static propTypes = {
        pathName: PropTypes.string.isRequired,
        teamType: PropTypes.string.isRequired,
    };

    render() {
        return (
            <div className='webrtc-view'>
              <div className='container-fluid'>
                <Route component={WebRtc}/>
              </div>
            </div>
        );
    }
}
