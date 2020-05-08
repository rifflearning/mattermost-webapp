// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {updateRecommendations} from 'actions/views/dashboard';
import {
    getUserLearningGroups,
    getRecommendations,
} from 'selectors/views/dashboard';

import {RecommendationsView} from './RecommendationsView';

/* Empty array for when there are no learning groups. We don't want every state
 * update to create a different empty array, because that will look like the
 * userLearningGroup prop has changed when it actually hasn't.
 */
const noLearningGroups = [];

const mapStateToProps = (state) => ({
    recommendations: getRecommendations(state),
    userLearningGroups: getUserLearningGroups(state) || noLearningGroups,
    userId: getCurrentUserId(state),
});

const mapDispatchToProps = (dispatch) => ({
    updateRecommendations: () => {
        return dispatch(updateRecommendations());
    },
});

const Recommendations = connect(
    mapStateToProps,
    mapDispatchToProps,
)(RecommendationsView);

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    Recommendations,
};
