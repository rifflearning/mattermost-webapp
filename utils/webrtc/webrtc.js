import SimpleWebRtc from 'simplewebrtc';
import * as WebRtcActions from '../../actions/webrtc_actions';
import sibilant from 'sibilant-webaudio';
import { app, socket } from '../riff';
import {updateRiffMeetingId} from '../../actions/views/riff';
import parse from 'url-parse';


export const createWebRtcLink = (teamName, channelName) => {
    let link = parse(window.location.href, true);
    link.set('pathname', teamName + '/' + channelName + '/' + 'video' + '/' + generateUID());
    console.log("Created webrtc Link:", link.href);
    return link;
}

function generateUID() {
    // I generate the UID from two parts here 
    // to ensure the random number provide enough bits.
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
}


export default function (localVideoNode, dispatch, getState) {
    //TODO: make dynamic
    let signalmasterPath = process.env.CLIENT_ENV.SIGNALMASTER_PATH || '';
    signalmasterPath += '/socket.io';
    let signalmasterUrl = process.env.CLIENT_ENV.SIGNALMASTER_URL;
    let webRtcConfig = {
        localVideoEl: localVideoNode,
        remoteVideosEl: "",
        autoRequestMedia: true,
        url: signalmasterUrl,
        socketio: {
            path: signalmasterPath,
            forceNew: true
        },
        media: {
            audio: true,
            video: {
                width: {ideal: 640},
                height: {ideal: 480},
                frameRate: {max: 30}
            }
        },
        debug: true
    };

    let webrtc = new SimpleWebRtc(webRtcConfig);

    webrtc.on('videoAdded', function (video, peer) {
        console.log("added video", video, peer);
        dispatch(WebRtcActions.addPeer({peer}));
    });

    webrtc.on('videoRemoved', function (video, peer) {
        let state = getState();
        // get riffId
        if (state.views.webrtc.inRoom) {
            dispatch(WebRtcActions.removePeer({peer: peer,
                                               videoEl: video}));
            let [riffId, ...rest] = peer.nick.split("|");
            //TODO: state get here is wrong.
            dispatch(WebRtcActions.riffParticipantLeaveRoom(state.views.riff.meetingId, riffId));
        }
    });

    webrtc.on('localStreamRequestFailed', function (event) {
        dispatch(WebRtcActions.getMediaError(event));
    });

    webrtc.on('localStream', function (stream) {
        if (stream.active) {
            dispatch(WebRtcActions.getMediaSuccess());
        }
    });

    webrtc.on('readyToCall', function (video, peer) {
        let stream = webrtc.webrtc.localStreams[0];
        dispatch(WebRtcActions.getMediaSuccess());
        var sib = new sibilant(stream);
        if (sib) {
            webrtc.stopVolumeCollection = function () {
                // sib.unbind('volumeChange');
            };

            webrtc.startVolumeCollection = function () {
                sib.bind('volumeChange', function (data) {
                    let state = getState();
                    if (!state.views.webrtc.inRoom) {
                        dispatch(WebRtcActions.volumeChanged(data));
                    }
                }.bind(getState));
            };

            webrtc.startVolumeCollection();
        }

        sib.bind('stoppedSpeaking', (data) => {
            app.service('utterances').create({
                participant: getState().entities.users.currentUserId,
                room: getState().views.webrtc.roomName,
                startTime: data.start.toISOString(),
                endTime: data.end.toISOString(),
                token: getState().views.riff.authToken
            }).then(function (res) {
                dispatch(updateRiffMeetingId(res.meeting));
            }).catch(function (err) {
                // error thrown, throw it?
            });
        });


        webrtc.stopSibilant = function () {
            sib.unbind('volumeChange');
            sib.unbind('stoppedSpeaking');
        };

        // TODO: add volume collection and sibilant
        dispatch(WebRtcActions.readyToCall());
    });

    webrtc.changeNick = function (nick) {
        this.config.nick = nick;
        this.webrtc.config.nick = nick;
    };

    return webrtc;
};
