// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
    indent: ["error", 4, { "CallExpression": { "arguments": "first" } }],
 */

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {
    updateMeetingParticipants,
    updateTurnData,
    updateRiffMeetingId} from 'actions/views/riff';
import {updateTextChat} from 'actions/webrtc_actions';
import store from 'stores/redux_store.jsx';
import {app, logger} from 'utils/riff';

function transformTurns(participants, turns) {
    const filteredTurns = turns.filter((turn) => participants.includes(turn.participant));
    return filteredTurns;
}

export default function riffListener() {
    // this listener listens for events ~from~ the server

    const dispatch = store.dispatch;
    const getState = store.getState;
    app.service('turns').on('updated', (obj) => {
        const state = getState();
        if (obj.room === state.views.webrtc.webRtcRoom && state.views.riff.participants.length > 1) {
            logger.debug('Updating turns');
            dispatch(updateTurnData(obj.transitions,
                                    transformTurns(state.views.riff.participants, obj.turns)));
        }
    });

    app.service('participantEvents').on('created', (obj) => {
        const state = getState();

        // don't even debug log this unless actively needed as it currently displays all messages in
        // any ongoing meeting.
        // logger.debug('riff listener.participantEvents.created: entered', { obj, expectedRoom: state.views.webrtc.webRtcRoom });

        if (obj.meeting.room === state.views.webrtc.webRtcRoom) {
            logger.debug('riff listener.participantEvents.created: updating participants',
                         {from: state.views.riff.participants, to: obj.participants, obj});

            // update meeting mediator data
            dispatch(updateMeetingParticipants(obj.participants));
            dispatch(updateRiffMeetingId(obj.meeting._id)); // eslint-disable-line no-underscore-dangle
        }
    });

    app.service('messages').on('created', (obj) => {
        const state = getState();
        const user = getCurrentUser(state);

        // don't even debug log this unless actively needed as it currently displays all messages in
        // any ongoing meeting.
        // logger.debug('riff listener.messages.created', obj, user.id, updateTextChat);

        if (obj.meeting === state.views.riff.meetingId &&
            obj.participant !== user.id) {
            dispatch(updateTextChat(
                obj.msg,
                obj.meeting,
                obj.participant,
                obj.time
            ));
        }
    });
}
