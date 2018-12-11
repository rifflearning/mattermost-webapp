// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';
import classNames from 'classnames';

import PermalinkView from 'components/permalink_view';
import Navbar from 'components/navbar';
import WebRtcIdentifierRouter from 'components/webrtc_layout/webrtc_identifier_router';
//import WebRtc from 'components/webrtc/index';

export default class WebRtc extends React.PureComponent {
    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        // TODO: possible this should be last video path instead
        // to redirect to the right videochat they were last at.
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div
                key='inner-wrap'
                className={classNames('inner-wrap', 'channel__wrap', {
                    'move--right': this.props.lhsOpen,
                    'move--left': this.props.rhsOpen,
                    'move--left-small': this.props.rhsMenuOpen,
                })}
            >
                <div className='row header'>
                    <div id='navbar'>
                        <Navbar/>
                    </div>
                </div>
                <div className='row main'>
                    <Switch>
                        <Route
                        path={'/:team/:identifier/video/:video_id'}
                        component={WebRtcIdentifierRouter}
                        />
                    </Switch>
                </div>
            </div>
        );
    }
} 
