// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {RiffServerActionTypes} from '../../utils/constants';

import {app, socket} from '../../utils/riff';

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
    console.log('updating turn data:', transitions, turns);
    return {
        type: RiffServerActionTypes.RIFF_TURN_UPDATE,
        transitions,
        turns,
    };
};

export const updateMeetingParticipants = (participants) => {
    console.log('updating riff meeting participants', participants);
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
        then((res) => {
            console.log(
                'removed participant:',
                participantId,
                'from meeting ',
                meetingId
            );
            return true;
        }).
        catch((err) => {
            return false;
            console.log('shit, caught an error:', err);
        });
};

export const attemptRiffAuthenticate = () => (dispatch) => {
    app.authenticate({
        strategy: 'local',
        email: 'default-user-email',
        password: 'default-user-password',
    }).
        then((result) => {
            console.log('auth result!: ', result);
            dispatch(riffAuthSuccess(result.accessToken));

            //return this.recordMeetingJoin();
        }).
        catch((err) => {
            console.log('auth ERROR:', err);
            dispatch(riffAuthFail(err));
            console.log('trying to authenticate again...');
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
