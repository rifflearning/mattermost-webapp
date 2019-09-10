// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {Datasets} from 'mattermost-redux/constants/user_analytics';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {RecommendationsView} from './RecommendationsView';

const mapStateToProps = (state) => ({
    userLearningGroups: state.entities.users.analytics[Datasets.USER_LEARNING_GROUPS] || [],
    currentUserId: getCurrentUserId(state),
    currentTeamId: getCurrentTeamId(state),
});

const Recommendations = connect(
    mapStateToProps,
)(RecommendationsView);

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    Recommendations,
};
