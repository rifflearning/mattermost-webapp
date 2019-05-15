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
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import MaterialIcon from 'material-icons-react';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {sendSurvey} from 'actions/survey_actions.jsx';

const mapStateToProps = (state) => ({
    meetingId: state.views.riff.meetingId,
    uid: getCurrentUser(state).id,
});

const mapDispatchToProps = (/*dispatch, ownProps*/) => ({
});

const mapMergeProps = (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    leaveRoom: (event) => {
        event.preventDefault();
        ownProps.leaveRiffRoom(stateProps.meetingId, stateProps.uid);
        ownProps.leaveRoom();
        ownProps.webrtc.leaveRoom();
        ownProps.webrtc.stopSibilant();
        sendSurvey(stateProps.uid, stateProps.meetingId);
    },
});

class LeaveButtonView extends React.Component {
    static propTypes = {
        meetingId: PropTypes.string,
        uid: PropTypes.string.isRequired,
        leaveRoom: PropTypes.func.isRequired,
    };

    render() {
        return (
            <button
                className='button rounded is-danger'
                style={{marginTop: '10px'}}
                onClick={(event) => this.props.leaveRoom(event)}
                aria-label='End call'
            >
                <MaterialIcon icon='call_end'/>
            </button>
        );
    }
}

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps,
    mapMergeProps
)(LeaveButtonView));
