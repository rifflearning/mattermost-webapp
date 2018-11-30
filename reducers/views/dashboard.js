// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {DashboardActionTypes} from 'utils/constants.jsx';

const initialState = {
    numMeetings: 0,
    fetchMeetingsStatus: 'loading',
    fetchMeetingsMessage: 'loading',
    meetings: [],
    lastFetched: new Date('January 1, 2000 00:01:00'),
    shouldFetch: true,
    numMeetings: 0,
    selectedMeeting: null,
    processedUtterances: [],
    statsStatus: 'loading',
    networkStatus: 'loading',
    networkData: null,
};

const dashboard = (state = initialState, action) => {
    switch (action.type) {
    case DashboardActionTypes.LOG_OUT:
        return initialState;
    case DashboardActionTypes.DASHBOARD_FETCH_MEETINGS:
        //console.log("time diff:", (((new Date()).getTime() - new Date(state.lastFetched).getTime())/1000) > 5)
        return {
            ...state,
            fetchMeetingsStatus: action.status,
            fetchMeetingsMessage: action.message,
            meetings: action.meetings ? action.meetings : state.meetings,
            numMeetings: action.meetings ?
                action.meetings.length :
                state.meetings.length,
            lastFetched: new Date(),
            shouldFetch:
                    (new Date().getTime() -
                        new Date(state.lastFetched).getTime()) /
                        1000 >
                    5 * 60,
        };
    case DashboardActionTypes.DASHBOARD_SELECT_MEETING:
        return {...state, selectedMeeting: action.meeting};
    case DashboardActionTypes.DASHBOARD_FETCH_MEETING_STATS:
        return {
            ...state,
            statsStatus: action.status,
            processedUtterances: action.processedUtterances ?
                action.processedUtterances :
                state.processedUtterances,
        };
    case DashboardActionTypes.DASHBOARD_FETCH_MEETING_NETWORK:
        return {
            ...state,
            networkStatus: action.status,
            networkData: action.networkData ?
                action.networkData :
                state.networkData,
        };
    case DashboardActionTypes.DASHBOARD_FETCH_MEETING_TIMELINE:
        return {
            ...state,
            timelineStatus: action.status,
            timelineData: action.timelineData ?
                action.timelineData :
                state.timelineData,
        };
    default:
        return state;
    }
};

export default dashboard;
