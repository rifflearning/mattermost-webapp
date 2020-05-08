// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {
    loadMoreMeetings,
    loadRecentMeetings,
} from 'actions/views/dashboard';
import * as RiffServerActionCreators from 'actions/views/riff';
import {logger} from 'utils/riff';

import {DashboardView} from './DashboardView';

const mapStateToProps = (state) => {
    return {
        user: getCurrentUser(state),
        riffAuthToken: state.views.riff.authToken,
        meetings: state.views.dashboard.meetings,
        shouldFetch: state.views.dashboard.shouldFetch,
        loadingError: state.views.dashboard.loadingError,
        numMeetingsToDisplay: state.views.dashboard.numMeetingsToDisplay,
    };
};

const mapDispatchToProps = (dispatch) => ({
    loadMoreMeetings: () => {
        dispatch(loadMoreMeetings());
    },
    loadRecentMeetings: (uid) => {
        dispatch(loadRecentMeetings(uid));
    },
    authenticateRiff: () => {
        logger.debug('Dashboard.authenticateRiff: attempt data-server auth');
        dispatch(RiffServerActionCreators.attemptRiffAuthenticate());
    },
});

const mapMergeProps = (stateProps, dispatchProps, ownProps) => {
    logger.debug('Dashboard.mapMergeProps: user:', stateProps.user);
    return {
        ...stateProps,
        ...dispatchProps,
        ...ownProps,

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

const Dashboard = connect(
    mapStateToProps,
    mapDispatchToProps,
    mapMergeProps)(DashboardView);

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    Dashboard,
};
