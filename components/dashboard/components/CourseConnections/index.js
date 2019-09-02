// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {RequestStatus} from 'mattermost-redux/constants';
import {Datasets} from 'mattermost-redux/constants/user_analytics';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getUserAnalytics} from 'mattermost-redux/actions/users';

import {CourseConnectionsView} from './CourseConnectionsView';

function isRequestLoaded(req) {
    return Boolean(req && req.status === RequestStatus.SUCCESS);
}

const mapStateToProps = (state) => ({
    isUserInteractionsLoaded: isRequestLoaded(state.requests.users.getUserAnalytics[Datasets.USER_INTERACTIONS]),
    userInteractions: state.entities.users.analytics[Datasets.USER_INTERACTIONS],
    userLearningGroups: state.entities.users.analytics[Datasets.USER_LEARNING_GROUPS],
    learningGroupTypes: state.entities.users.analytics[Datasets.LEARNING_GROUP_TYPES],
    currentUser: getCurrentUser(state),
    currentTeamId: getCurrentTeamId(state),
});

const mapDispatchToProps = (dispatch) => ({
    fetchUserInteractions: (userId, teamId) => {
        dispatch(getUserAnalytics(userId, teamId, Datasets.USER_INTERACTIONS));
    },
});

const CourseConnections = connect(
    mapStateToProps,
    mapDispatchToProps,
)(CourseConnectionsView);

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    CourseConnections,
};
