import {WebRtcActionTypes} from 'utils/constants.jsx';
import {browserHistory} from 'utils/browser_history';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import {riffAddUserToMeeting} from './views/riff';
import {app, socket} from 'utils/riff';
import { logger } from '../utils/riff';


export const riffParticipantLeaveRoom = (riffMeetingId, riffId) => dispatch => {
    // remove them!
    console.log("would remove this user from the room", riffMeetingId, riffId);
    return app.service('meetings').patch(riffMeetingId, {
        remove_participants: [riffId]
    }).then(function (res) {
        console.log("removed participant:", riffId, "from meeting ", riffMeetingId);
        return true;
    }).catch(function (err) {
        return false;
        console.log("shit, caught an error:", err);
    });
};


export const handleMuteAudioClick = (event, muted, webrtc) => (dispatch) => {
    if (muted) {
        dispatch(unmuteAudio());
        webrtc.unmute();
    } else {
        dispatch(muteAudio());
        webrtc.mute();
    }
};

export const joinWebRtcRoom = (roomName, teamId, videoId) => dispatch => {
    console.log("Joining webrtc room", roomName, teamId, videoId);
    dispatch(joinRoom(roomName + '-' + videoId));
    browserHistory.push(`/${teamId}/${roomName}/video/${videoId}`);

};

export const handleReadyClick = (event, props, webrtc) => dispatch =>{
    let webRtcRoom = props.roomName;

    if ((webRtcRoom == '')) {
        dispatch(joinRoomError("Something went wrong and we're not sure which room you're trying to join. Refresh the page and try again."));
    } else if (props.getMediaStatus == 'error') {
        dispatch(joinRoomError("Make sure your camera and microphone are ready, and refresh the page."));
    } else {
        // add user to riff meetings
        console.log("adding user to meetings with props:", props);
        event.preventDefault();
        riffAddUserToMeeting(
            props.user.id,
            props.user.email ? props.user.email : "",
            webRtcRoom,
            props.user.username,
            webRtcRoom,
            props.webRtcPeers,
            props.riff.authToken
        );
        dispatch(joinRoom(webRtcRoom));
        webrtc.stopVolumeCollection();
        webrtc.joinRoom(webRtcRoom, function (err, rd) {
            dispatch(joinedRoom(webRtcRoom));
            //reset audio
            dispatch(unmuteAudio());
            webrtc.unmute();
        });
    }
};

export const handleScreenShareClick = (event, isUserSharing, webRtcRemoteSharedScreen, webrtc) => dispatch => {

    if (isUserSharing) {
      // TODO function name choice
      dispatch(stopShareScreen());
      webrtc.stopScreenShare();
    } else if (webRtcRemoteSharedScreen) {
      // someone is already sharing
      // TODO tell user to quit it
      logger.debug("Stop that, someone is already sharing!");
    } else {

      logger.debug("Sharing screen!");
      dispatch(shareScreen())
      webrtc.shareScreen();
    }
}

export const joinRoom = (roomName) => {
    return {type: WebRtcActionTypes.JOIN_ROOM,
            roomName: roomName};
};

export const readyToCall = (roomName) => {
    return {
        type: WebRtcActionTypes.READY_TO_CALL,
    };
};

export const getMediaError = (error) => {
    return {
        type: WebRtcActionTypes.GET_MEDIA,
        status: 'error',
        msg: error
    };
};

export const getMediaSuccess = () => {
    return {
        type: WebRtcActionTypes.GET_MEDIA,
        status: 'success'
    };
}

export const addPeer = (peer) => {
    return {
        type: WebRtcActionTypes.ADD_PEER,
        peer: peer
    };
};

export const removePeer = (peer) => {
    return {
        type: WebRtcActionTypes.REMOVE_PEER,
        peer: peer
    };
};

export const joinedRoom = () => {
    return {
        type: WebRtcActionTypes.JOINED_ROOM
    };
};

export const leaveRoom = () => {
    return {
        type: WebRtcActionTypes.LEAVE_ROOM
    };
};

export const volumeChanged = (volume) => {
    return {
        type: WebRtcActionTypes.VOLUME_CHANGED,
        volume: volume
    }
}

export const muteAudio = () => {
    return {type: WebRtcActionTypes.MUTE_AUDIO}
}

export const unmuteAudio = () => {
    return {type: WebRtcActionTypes.UNMUTE_AUDIO}
}

export const joinRoomError = (msg) => {
    return {
        type: WebRtcActionTypes.JOIN_ROOM_STATUS,
        status: 'error',
        msg: msg
    }
}

export const clearJoinRoomError = () => {
    return {
        type: WebRtcActionTypes.JOIN_ROOM_STATUS,
        status: 'success',
        msg: ''
    }
}


export const sendTextChatMsg = (message, participant, meeting) => dispatch => {
    return app.service('messages').create({
        msg: message,
        participant: participant,
        meeting: meeting
    }).then(function (result) {
        console.log("created a message!", result);
        dispatch(updateTextChat(result.msg,
                                result.meeting,
                                result.participant,
                                result.time));
    }).catch(function (err) {
        console.log("errored out", err);
    });
};

export const updateTextChat = (message, meeting, participant, time) => {
    const messageObj = {message,meeting,participant,time};
    return {type: WebRtcActionTypes.TEXT_CHAT_MSG_UPDATE,
            messageObj
           };
};

export const setTextChatBadge = (badgeValue) => {
    return {type: WebRtcActionTypes.TEXT_CHAT_SET_BADGE,
            badgeValue};
}

export const stopShareScreen = () => {
  return {
    type: WebRtcActionTypes.STOP_SHARE_SCREEN,
  };
};

export const shareScreen = () => {
  return {
    type: WebRtcActionTypes.SHARE_SCREEN,
  };
};

export const getDisplayError = (error) => {
  return {
    type: WebRtcActionTypes.CHAT_GET_DISPLAY_ERROR,
    error: error
  };
};

export const addSharedScreen = (peer) => {
  return {
    type: WebRtcActionTypes.ADD_SHARED_SCREEN,
    peer: peer
  };
};

export const removeSharedScreen = () => {
  return {
    type: WebRtcActionTypes.REMOVE_SHARED_SCREEN,
  };
};

export const addLocalSharedScreen = (screen) => {
  return {
    type: WebRtcActionTypes.ADD_LOCAL_SHARED_SCREEN,
    screen: screen
  };
};

export const removeLocalSharedScreen = (screen) => {
  return {
    type: WebRtcActionTypes.REMOVE_LOCAL_SHARED_SCREEN,
    screen: screen
  };
};
