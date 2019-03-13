import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { push } from 'connected-react-router';
import MaterialIcon from 'material-icons-react';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import { connect } from 'react-redux';


const mapStateToProps = state => ({
    meetingId: state.views.riff.meetingId,
    uid: getCurrentUser(state).id
});

const mapDispatchToProps = (dispatch, ownProps) => ({
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
    }
});

const LeaveButtonView = ({leaveRoom}) => (
    <button className="button rounded is-danger"
       style={{'marginTop': '10px'}}
       onClick={event => leaveRoom(event)}
       aria-label='End call'
    >
      <MaterialIcon icon="call_end"/>
    </button>
);


export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps,
    mapMergeProps
)(LeaveButtonView));
