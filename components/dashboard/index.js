// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" } }],
    "react/jsx-max-props-per-line": ["error", { "when": "multiline" }],
    "no-underscore-dangle": ["error", { "allow": [ "_id" ] }],
 */

import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';

import $ from 'jquery';
import moment from 'moment';
import lifecycle from 'react-pure-lifecycle';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {
    loadMoreMeetings,
    loadRecentMeetings,
    selectMeeting,
    loadMeetingData,
} from 'actions/views/dashboard';
import * as RiffServerActionCreators from 'actions/views/riff';
import {logger} from 'utils/riff';
import * as UserAgent from 'utils/user_agent.jsx';

import DashboardView from './DashboardView';

const mapStateToProps = (state) => {
    logger.debug('dashboard state:', state);
    const {lti, dashboard, riff} = state.views;
    const riffState = {...lti, ...dashboard, ...riff};
    return {
        user: getCurrentUser(state),
        riff,
        riffAuthToken: riffState.authToken,
        fetchMeetingsStatus: riffState.fetchMeetingsStatus,
        fetchMeetingsMessage: riffState.fetchMeetingsMessage,
        meetings: riffState.meetings,
        numMeetings: riffState.numMeetings,
        lastFetched: riffState.lastFetched,
        shouldFetch: riffState.shouldFetch,
        selectedMeeting: riffState.selectedMeeting || null,
        processedUtterances: riffState.processedUtterances,
        statsStatus: riffState.statsStatus,
        processedNetwork: riffState.networkData,
        processedTimeline: riffState.timelineData,
        loadingError: riffState.loadingError,
        numLoadedMeetings: riffState.numLoadedMeetings,
    };
};

const mapDispatchToProps = (dispatch) => ({
    loadMoreMeetings: () => {
        dispatch(loadMoreMeetings());
    },
    loadRecentMeetings: (uid) => {
        dispatch(loadRecentMeetings(uid));
    },
    handleRefreshClick: (event, uid) => {
        dispatch(loadRecentMeetings(uid));
    },
    handleMeetingClick: (event, uid, meeting) => {
        event.preventDefault();

        /// TODO: Why do we want 2 distinct actions to select the meeting and to load the meeting data? -mjl 2018-09-05
        dispatch(selectMeeting(meeting));
        dispatch(loadMeetingData(uid, meeting._id));
    },
    authenticateRiff: () => {
        logger.debug('attempt data-server auth');
        dispatch(RiffServerActionCreators.attemptRiffAuthenticate());
    },
});

const formatMeetingDuration = (meeting) => {
    if (!meeting) {
        return '';
    }

    // support showing data on in progress meeting by giving them a fake end time of now
    const startDate = new Date(meeting.startTime);
    const endDate = meeting.endTime ? new Date(meeting.endTime) : new Date();
    const diff = moment(endDate).diff(moment(startDate), 'minutes');
    return `${diff} minutes`;
};

const mapMergeProps = (stateProps, dispatchProps, ownProps) => {
    logger.debug('dashboard user:', stateProps.user);
    return {
        ...stateProps,
        ...dispatchProps,
        ...ownProps,
        selectedMeetingDuration: formatMeetingDuration(
            stateProps.meetings[0]
        ),
        maybeLoadNextMeeting: (meetingId) => {
            if (!stateProps.meetings || stateProps.numLoadedMeetings < 1 || stateProps.numLoadedMeetings > stateProps.meetings.length) {
                // I believe this is happening, the question is when and why -mjl
                // What I've seen now is that the numLoadedMeetings is greater than the number of meetings
                // in the meetings array.
                logger.error(`Dashboard.maybeLoadNextMeeting: meetings is not an array or the # loaded meetings (${stateProps.numLoadedMeetings}) is a problem!`, stateProps.meetings);
            }
            const lastLoadedMeeting = stateProps.meetings[stateProps.numLoadedMeetings - 1];
            logger.debug('Dashboard.maybeLoadNextMeeting: lastLoadedMeeting', lastLoadedMeeting);
            if (lastLoadedMeeting._id === meetingId) {
                logger.debug('Dashboard.maybeLoadNextMeeting: loading more meetings!');
                dispatchProps.loadMoreMeetings();
            }
        },
    };
};

const componentDidUpdate = (props) => {
    if (props.riffAuthToken && props.shouldFetch) {
        props.loadRecentMeetings(props.user.id);
    }
};

const componentDidMount = (props) => {
    if (props.riffAuthToken) {
        props.loadRecentMeetings(props.user.id);
    }

    $('body').addClass('app__body');

    // IE Detection
    if (UserAgent.isInternetExplorer() || UserAgent.isEdge()) {
        $('body').addClass('browser--IE');
    }
};

const componentWillMount = (props) => {
    logger.debug('dashboard user:', props.user);
    if (!props.riff.authToken) {
        props.authenticateRiff();
    }
};

// componentWillUnmount = () => {
//     $('body').removeClass('app__body');
// }

const methods = {
    componentDidUpdate,
    componentDidMount,
    componentWillMount,
};

const Dashboard = lifecycle(methods)(DashboardView);

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps,
        mapMergeProps
    )(Dashboard)
);
