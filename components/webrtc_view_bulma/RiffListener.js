import {app, socket} from '../../utils/riff';
import {
    updateMeetingParticipants,
    updateTurnData,
    updateRiffMeetingId} from '../../actions/views/riff';
// import {
//     updateTextChat} from '../actions/textchat';
import store from 'stores/redux_store.jsx';


function transformTurns(participants, turns) {
    let filteredTurns = turns.filter(turn => participants.includes(turn.participant));
    return filteredTurns;
}

export default function () {
    // this listener listens for events ~from~ the server

    const dispatch = store.dispatch;
    const getState = store.getState;
    const state = getState()
    app.service('turns').on('updated', function (obj) {
        let state = getState();
        if (obj.room === state.views.webrtc.webRtcRoom && state.views.riff.participants.length > 1) {
            console.log("Updating turns");
            dispatch(updateTurnData(obj.transitions,
                                    transformTurns(state.views.riff.participants, obj.turns)));
        }
    });

    app.service('participantEvents').on('created', function (obj) {
        let state = getState();
        console.log('riff listener.participantEvents.created: entered', { obj, expectedRoom: state.views.webrtc.webRtcRoom });
        if (obj.meeting.room === state.views.webrtc.webRtcRoom) {
            console.log('riff listener.participantEvents.created: updating participants',
                         { from: state.views.riff.participants, to: obj.participants, obj });
            // update meeting mediator data
            dispatch(updateMeetingParticipants(obj.participants));
            dispatch(updateRiffMeetingId(obj.meeting._id));
        }
    });

    app.service('messages').on('created', function (obj) {
        let state = getState();
        console.log('riff listener.messages.created', obj);
        if (obj.meeting === state.views.riff.meetingId &&
            obj.participant != state.auth.user.uid) {
            dispatch(updateTextChat(
                obj.msg,
                obj.meeting,
                obj.participant,
                obj.time
            ));
        }
    });

    // this.app.service('meetings').on('patched', function (obj) {
    //   if (obj.room === state.chat.webRtcRoom) {
    //     console.log("Got update for meeting", obj.room);
    //     dispatch(meetingUpdated())
    //   }
    // })
}
