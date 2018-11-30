import {app, socket} from '../../utils/riff';
import {
    updateMeetingParticipants,
    updateTurnData,
    updateRiffMeetingId} from '../../actions/views/riff';
import {updateTextChat} from '../../actions/webrtc_actions';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
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
        let user = getCurrentUser(state);
        console.log('riff listener.messages.created', obj, user.id, updateTextChat);
        if (obj.meeting === state.views.riff.meetingId &&
            obj.participant != user.id) {
            dispatch(updateTextChat(
                obj.msg,
                obj.meeting,
                obj.participant,
                obj.time
            ));
        }
    });
}
