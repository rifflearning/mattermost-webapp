import * as WebRtcActions from '../../actions/webrtc_actions';
import {WebRtcActionTypes, ActionTypes} from '../../utils/constants';

const initialState = {
    peerColors: ['#f56b6b', '#128EAD', '#7caf5f', '#f2a466'],
    getMediaStatus: 'error',
    getMediaMessage: '',

    joinRoomStatus: 'waiting',
    joinRoomMessage: '',

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
        lastRoom: "",
        lastMeetingId: "",
        badge: 0
    }
};



const webrtc = (state = initialState, action) => {
    switch(action.type) {
    case(WebRtcActionTypes.JOIN_ROOM):
        return {...state,
                joiningRoom: true,
                roomName: action.roomName,
                webRtcRoom: action.roomName,
                inRoom: false};

    case(WebRtcActionTypes.JOIN_ROOM_STATUS):
        return {...state,
                joinRoomStatus: action.status,
                joinRoomMessage: action.msg
               }

    case(WebRtcActionTypes.ADD_PEER):
        // this removes any null peers
        console.log('adding peer', action);
        let [riffId, displayName] = action.peer.peer.nick.split('|');
        console.log('adding peer', riffId, displayName);
        const peers = state.webRtcPeers.filter(n => !(n === null));
        let peer_ids = state.webRtcPeers.map(p => p.id);
        if (peer_ids.indexOf(action.peer.id) >= 1) {
            console.log('not re-adding a peer...');
            return state;
        } else {
            // basic object destructuring to get a simple subset of our peer object.
            let newPeer = (({id,nick,type,videoEl}) => ({id,nick,type,videoEl}))(action.peer.peer);
            let allPeers = [...peers, newPeer];
            let displayNames = allPeers.map((p) => { return p.nick.split('|')[1]});
            let riffIds = allPeers.map((p) => { return p.nick.split('|')[0]});
            console.log("returning new peer", state, allPeers, displayNames, riffIds);
            return {...state,
                    webRtcPeers: allPeers,
                    webRtcPeerDisplayNames: displayNames,
                    webRtcRiffIds: riffIds
                   };
        }

    case(WebRtcActionTypes.REMOVE_PEER):
        let peer = action.peer.peer;
        const index = state.webRtcPeers.map(item => item.id).indexOf(peer.id);
        let allPeers = [...state.webRtcPeers.slice(0, index),
                        ...state.webRtcPeers.slice(index + 1)];
        let displayNames = allPeers.map((p) => { return p.nick.split('|')[1]; });
        let riffIds = allPeers.map((p) => { return p.nick.split('|')[0]; });
        return {...state,
                webRtcPeers: allPeers,
                webRtcPeerDisplayNames: displayNames,
                webRtcRiffIds: riffIds};

    case(WebRtcActionTypes.READY_TO_CALL):
        return {...state, readyToCall: true, getMediaError: false};

    case(WebRtcActionTypes.GET_MEDIA):
        return {...state,
                getMediaStatus: action.status,
                getMediaMessage: action.msg};

    case(WebRtcActionTypes.MUTE_AUDIO):
        return {...state,
                audioMuted: true};

    case(WebRtcActionTypes.UNMUTE_AUDIO):
        return {...state,
                audioMuted: false};

    case(WebRtcActionTypes.JOINED_ROOM):
        return{...state,
               inRoom: true,
               joiningRoom: false};

    case(WebRtcActionTypes.LEAVE_ROOM):
        return {...state,
                inRoom: false,
                webRtcPeers: [],
                webRtcPeerDisplayNames: [],
                webRtcRiffIds: []
               }

    case(WebRtcActionTypes.VOLUME_CHANGED):
        if (action.volume !== null) {
            let vol1 = (((120 - Math.abs(action.volume)) / 120)*100);
            let vol2 = (Math.ceil(vol1)/20)*20;
            if (vol2 > 0) {
                return {...state, volume: vol2};
            } else {
                return state;
            }
        }

    case(ActionTypes.CLICK_VIDEO):
        console.log("CLICK VIDEO action in webrtc reducer.")
        WebRtcActions.joinWebRtcRoom(action.roomName, action.team_id);

    case(WebRtcActionTypes.TEXT_CHAT_MSG_UPDATE):
        // will never be a message this user has sent (will always be peer)
        let dNames = state.webRtcPeers.map((p) => { return p.nick.split("|")[1]; });
        let rIds = state.webRtcPeers.map((p) => { return p.nick.split("|")[0]; });
        const peerIdx = rIds.indexOf(action.messageObj.participant);
        const dispName = dNames[peerIdx];
        let msg = {...action.messageObj,
                   name: dispName};
        return {...state, textchat: {...state.textchat,
                                     messages: [...state.textchat.messages,
                                                msg]}};
    case(WebRtcActionTypes.TEXT_CHAT_SET_BADGE):
        return { ...state,
                 textchat: {...state.textchat,
                            badge: action.badgeValue}};

    default:
        return state;
    }
};

export default webrtc;
