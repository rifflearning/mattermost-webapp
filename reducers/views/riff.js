// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
*/

import {RiffServerActionTypes} from 'utils/constants';

const initialState = {
    meetingId: null,
    authToken: null,
    authError: null,
    participants: [],
    turns: [],
    transitions: [],
};

const riff = (state = initialState, action) => {
    switch (action.type) {
    case RiffServerActionTypes.RIFF_AUTHENTICATE_SUCCESS:
        return {...state, authToken: action.token, authError: null};
    case RiffServerActionTypes.RIFF_AUTHENTICATE_FAIL:
        return {...state, authToken: null, authError: action.error};
    case RiffServerActionTypes.RIFF_PARTICIPANTS_CHANGED:
        return {...state, participants: action.participants};
    case RiffServerActionTypes.RIFF_TURN_UPDATE:
        return {
            ...state,
            turns: action.turns,
            transitions: action.transitions,
        };
    case RiffServerActionTypes.RIFF_MEETING_ID_UPDATE:
        return {...state, meetingId: action.meetingId};
    default:
        return state;
    }
};

export default riff;
