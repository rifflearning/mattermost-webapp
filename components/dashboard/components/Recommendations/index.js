// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {getRecommendations} from 'utils/riff/recommendations';

import {RecommendationsView} from './RecommendationsView';

const mapStateToProps = (state) => ({
    recommendations: getRecommendations(getCurrentUserId(state)),
});

const Recommendations = connect(
    mapStateToProps
)(RecommendationsView);

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    Recommendations,
};
