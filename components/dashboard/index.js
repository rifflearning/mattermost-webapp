// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

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
    logger.debug('Dashboard.mapStateToProps: state:', state);
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
        numMeetingsToDisplay: riffState.numMeetingsToDisplay,
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
        logger.debug('Dashboard.authenticateRiff: attempt data-server auth');
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
    logger.debug('Dashboard.mapMergeProps: user:', stateProps.user);
    return {
        ...stateProps,
        ...dispatchProps,
        ...ownProps,
        selectedMeetingDuration: formatMeetingDuration(
            stateProps.meetings[0]
        ),

        // TODO: Load is the wrong terminalogy here, and maybe also in more of these properties as well.
        //       Consider renaming this to maybeDisplayNextMeeting -mjl 2019-04-26
        maybeLoadNextMeeting: (meetingId) => {
            // if there are undisplayed meetings AND the last displayed meeting is the specified one
            // then load (well display) more meetings (ie the next one).
            if (stateProps.numMeetingsToDisplay >= stateProps.meetings.length) {
                return;
            }

            const lastDisplayedMeeting = stateProps.meetings[stateProps.numMeetingsToDisplay - 1];
            logger.debug('Dashboard.maybeLoadNextMeeting: lastDisplayedMeeting', lastDisplayedMeeting);
            if (lastDisplayedMeeting._id === meetingId) {
                logger.debug(`Dashboard.maybeLoadNextMeeting: displaying more meetings (${stateProps.numMeetingsToDisplay})!`);
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
    logger.debug('Dashboard.componentWillMount: user:', props.user);
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
