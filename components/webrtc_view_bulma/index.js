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
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {ScaleLoader} from 'react-spinners';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import * as WebRtcActionCreators from 'actions/webrtc_actions';
import * as RiffServerActionCreators from 'actions/views/riff';
import {logger} from 'utils/riff';

import WebRtc from './webrtc.jsx';

const mapStateToProps = (state) => {
    //console.log('state:', state);
    return {
        ...state.views.webrtc,
        riff: state.views.riff,
        user: getCurrentUser(state),
        mediaError: state.views.webrtc.getMediaStatus === 'error',
    };
};

// use bindActionCreators here to reduce boilerplate
const mapDispatchToProps = (dispatch) => {
    logger.debug('creating webrtc component...');
    return {
        ...bindActionCreators(WebRtcActionCreators, dispatch),
        ...bindActionCreators(RiffServerActionCreators, dispatch),
        authenticateRiff: () => {
            logger.debug('attempt data-server auth');
            dispatch(RiffServerActionCreators.attemptRiffAuthenticate());
        },
        dispatch,
    };
};

const LoadingView = () => {
    return (
        <div className='columns has-text-centered is-centered is-vcentered' style={{minHeight: '100vh'}}>
            <div className='column is-vcentered has-text-centered'>
                <ScaleLoader color={'#8A6A94'}/>
            </div>
        </div>
    );
};

class WebRtcContainer extends React.PureComponent {
    static propTypes = {

        riff: PropTypes.shape({
            authToken: PropTypes.string,
        }).isRequired,
        authenticateRiff: PropTypes.func,
    };

    componentWillMount() {
        if (!this.props.riff.authToken) {
            this.props.authenticateRiff();
        }
    }

    render() {
        if (!this.props.riff.authToken) {
            return (<LoadingView/>);
        }

        return (<WebRtc {...this.props}/>);
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WebRtcContainer);
