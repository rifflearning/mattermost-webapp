// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" } }],
    "react/jsx-max-props-per-line": ["error", { "when": "multiline" }],
    "no-underscore-dangle": ["error", { "allow": [ "_id" ] }],
 */

import {logger, Colors} from 'utils/riff';
import {WebRtcActionTypes, ActionTypes} from 'utils/constants';
import {joinWebRtcRoom} from 'actions/webrtc_actions';

const initialState = {
    peerColors: [
        Colors.reddishPeach,
        Colors.turquoise,
        Colors.sage,
        Colors.apricot,
        Colors.eggplant,
        Colors.darkFern,
        Colors.aquamarine,
    ],
    getMediaStatus: 'error',
    getMediaMessage: '',

    joinRoomStatus: 'waiting',
    joinRoomMessage: '',
    shouldFocusJoinRoomError: false,
    inRoom: false,
    roomName: '',

    audioMuted: false,

    volume: 0,

    webRtcPeers: [],
    webRtcPeerDisplayNames: [],
    webRtcRiffIds: [],

    readyToCall: false,

    textchat: {
        messages: [],
        lastRoom: '',
        lastMeetingId: '',
        badge: 0,
    },
    userSharing: false,
    webRtcLocalSharedScreen: null,
    webRtcRemoteSharedScreen: null,
};

const webrtc = (state = initialState, action) => {
    switch (action.type) {
    case (WebRtcActionTypes.JOIN_ROOM):
        return {...state,
            joiningRoom: true,
            roomName: action.roomName,
            webRtcRoom: action.roomName,
            inRoom: false,
        };

    case (WebRtcActionTypes.JOIN_ROOM_STATUS):
        return {...state,
            joinRoomStatus: action.status,
            joinRoomMessage: action.msg,
            shouldFocusJoinRoomError: action.status === 'error',
        };

    case (WebRtcActionTypes.ADD_PEER): {
        // this removes any null peers
        logger.debug('adding peer', action);
        const [riffId, displayName] = action.peer.peer.nick.split('|');
        logger.debug('adding peer', riffId, displayName);
        const peers = state.webRtcPeers.filter((n) => !(n === null));
        const peerIds = state.webRtcPeers.map((p) => p.id);
        if (peerIds.indexOf(action.peer.id) >= 1) {
            logger.debug('not re-adding a peer...');
            return state;
        }

        // basic object destructuring to get a simple subset of our peer object.
        const newPeer = (({id, nick, type, videoEl}) => ({id, nick, type, videoEl}))(action.peer.peer);
        const allPeers = [...peers, newPeer];
        const {displayNames, riffIds} = getPeerNamesAndIds(allPeers);
        logger.debug('returning new peer', state, allPeers, displayNames, riffIds);
        return {...state,
            webRtcPeers: allPeers,
            webRtcPeerDisplayNames: displayNames,
            webRtcRiffIds: riffIds,
        };
    }

    case (WebRtcActionTypes.REMOVE_PEER): {
        const peerToRemove = action.peer.peer;
        const index = state.webRtcPeers.findIndex((peer) => peer.id === peerToRemove.id);
        const allPeers = state.webRtcPeers.slice(); // copy array
        allPeers.splice(index, 1); // remove peer
        const {displayNames, riffIds} = getPeerNamesAndIds(allPeers);
        return {...state,
            webRtcPeers: allPeers,
            webRtcPeerDisplayNames: displayNames,
            webRtcRiffIds: riffIds,
        };
    }

    case (WebRtcActionTypes.READY_TO_CALL):
        return {...state,
            readyToCall: true,
            getMediaError: false,
        };

    case (WebRtcActionTypes.GET_MEDIA):
        return {...state,
            getMediaStatus: action.status,
            getMediaMessage: action.msg,
        };

    case (WebRtcActionTypes.MUTE_AUDIO):
        return {...state,
            audioMuted: true,
        };

    case (WebRtcActionTypes.UNMUTE_AUDIO):
        return {...state,
            audioMuted: false,
        };

    case (WebRtcActionTypes.JOINED_ROOM):
        return {...state,
            inRoom: true,
            joiningRoom: false,
        };

    case (WebRtcActionTypes.LEAVE_ROOM):
        return {...state,
            inRoom: false,
            webRtcPeers: [],
            webRtcPeerDisplayNames: [],
            webRtcRiffIds: [],
        };

    case (WebRtcActionTypes.VOLUME_CHANGED):
        if (action.volume !== null) {
            const vol1 = (((120 - Math.abs(action.volume)) / 120) * 100);
            const vol2 = (Math.ceil(vol1) / 20) * 20; // TODO: this divide by 20, multiply by 20 doesn't do anything does it? -mjl
            if (vol2 > 0) {
                return {...state, volume: vol2};
            }
        }

        return state; // TODO: I moved the return from inside the if to prevent fall through, not sure if it is correct though. -mjl

    case (ActionTypes.CLICK_VIDEO):
        logger.debug('CLICK VIDEO action in webrtc reducer.');
        joinWebRtcRoom(action.roomName, action.team_id);
        return state; // TODO: I added this to prevent fall through, not sure if it is correct though. -mjl

    case (WebRtcActionTypes.TEXT_CHAT_MSG_UPDATE): {
        // will never be a message this user has sent (will always be peer)
        logger.debug('text chat message update:', action);
        const {displayNames, riffIds} = getPeerNamesAndIds(state.webRtcPeers);
        const peerIdx = riffIds.indexOf(action.messageObj.participant);
        const dispName = '@' + displayNames[peerIdx];
        const msg = {...action.messageObj, name: dispName};
        return {...state,
            textchat: {...state.textchat,
                messages: [...state.textchat.messages, msg],
            },
        };
    }

    case (WebRtcActionTypes.TEXT_CHAT_SET_BADGE):
        return {...state,
            textchat: {...state.textchat,
                badge: action.badgeValue},
        };

    case (WebRtcActionTypes.SHARE_SCREEN):
        return {...state,
            userSharing: true,
        };

    case (WebRtcActionTypes.STOP_SHARE_SCREEN):
        return {...state,
            webRtcLocalSharedScreen: null,
            userSharing: false,
        };

    case (WebRtcActionTypes.CHAT_GET_DISPLAY_ERROR):
        return {...state,
            userSharing: false,
        };

    case (WebRtcActionTypes.ADD_SHARED_SCREEN):
        return {...state,
            webRtcRemoteSharedScreen: action.peer.peer.videoEl,
        };

    case (WebRtcActionTypes.REMOVE_SHARED_SCREEN):
        return {
            ...state,
            webRtcRemoteSharedScreen: null,
        };

    case (WebRtcActionTypes.ADD_LOCAL_SHARED_SCREEN):
        if (state.webRtcLocalSharedScreen) {
            // we only allow one shared screen at a time.
            // we should be checking for this before allowing the user to share
            // but just in case
            return state;
        }
        return {
            ...state,
            webRtcLocalSharedScreen: action.screen,
            userSharing: true,
        };

    case (WebRtcActionTypes.REMOVE_LOCAL_SHARED_SCREEN):
        return {
            ...state,
            webRtcLocalSharedScreen: null,
            userSharing: false,
        };

    case (WebRtcActionTypes.FOCUS_JOIN_ROOM_ERROR_COMPLETE):
        return {...state,
            shouldFocusJoinRoomError: false,
        };

    default:
        return state;
    }
};

/**
 * get the list of display names and the list of riff ids from
 * a list of peers.
 *
 * @example
 * let {displayNames, riffIds} = getPeerNamesAndIds(peers);
 */
function getPeerNamesAndIds(peers) {
    const retObj = {displayNames: [], riffIds: []};
    for (const peer of peers) {
        const idAndName = peer.nick.split('|');
        retObj.riffIds.push(idAndName[0]);
        retObj.displayNames.push(idAndName[1]);
    }
    return retObj;
}

export default webrtc;
