// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint header/header: "off" */

import {RiffServerActionTypes} from 'utils/constants';
import {app, socket, logger} from 'utils/riff';

export const riffAuthSuccess = (token) => {
    return {
        type: RiffServerActionTypes.RIFF_AUTHENTICATE_SUCCESS,
        token,
    };
};

export const riffAuthFail = (err) => {
    return {
        type: RiffServerActionTypes.RIFF_AUTHENTICATE_FAIL,
        error: err,
    };
};

export const updateTurnData = (transitions, turns) => {
    logger.debug('RiffActions: updating turn data:', {transitions, turns});
    return {
        type: RiffServerActionTypes.RIFF_TURN_UPDATE,
        transitions,
        turns,
    };
};

export const updateMeetingParticipants = (participants) => {
    logger.debug('RiffActions: updating riff meeting participants', participants);
    return {
        type: RiffServerActionTypes.RIFF_PARTICIPANTS_CHANGED,
        participants,
    };
};

export const updateRiffMeetingId = (meetingId) => {
    return {
        type: RiffServerActionTypes.RIFF_MEETING_ID_UPDATE,
        meetingId,
    };
};

export const participantLeaveRoom = (meetingId, participantId) => {
    return app.
        service('meetings').
        patch(meetingId, {
            remove_participants: [participantId],
        }).
        then(() => {
            logger.debug(`RiffActions: removed participant: ${participantId} from meeting ${meetingId}`);
            return true;
        }).
        catch((err) => {
            logger.error(`RiffActions: couldn't remove participant: ${participantId} from meeting ${meetingId}`, err);
            return false;
        });
};

export const attemptRiffAuthenticate = () => (dispatch) => {
    app.authenticate({
        strategy: 'local',
        email: 'default-user-email',
        password: 'default-user-password',
    }).
        then((result) => {
            logger.info('RiffActions: Riff data server authentication: Succeeded');
            dispatch(riffAuthSuccess(result.accessToken));

            //return this.recordMeetingJoin();
        }).
        catch((err) => {
            logger.warn('RiffActions: Riff data server authentication: Failed', err);
            dispatch(riffAuthFail(err));
            logger.info('RiffActions: Riff data server authentication: Retrying...');
            dispatch(attemptRiffAuthenticate());
        });
};

export const riffAddUserToMeeting = (
    uid,
    email,
    roomName,
    nickName,
    url,
    currentUsers,
    token
) => {
    const parts = currentUsers.map((user) => {
        return {participant: user.id};
    });

    return socket.emit('meetingJoined', {
        participant: uid,
        email,
        name: nickName,
        participants: parts,
        room: roomName,
        meetingUrl: url,
        consent: true,
        consentDate: new Date().toISOString(),
        token,
    });
};
