// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
    "no-underscore-dangle": "off",
*/

import {createSelector} from 'reselect';
import {Datasets} from 'mattermost-redux/constants/user_analytics';

/**
 * internal contains all module internal values used by the exported
 * classes/functions defined in this module. This provides a way to
 * mock these values in unit tests of the exported functions.
 */
const internal = {
};

const getUserAnalytics = (state) => state.entities.users.analytics;

const getUserInteractions = createSelector(
    getUserAnalytics,
    (userAnalytics) => {
        return userAnalytics[Datasets.USER_INTERACTIONS];
    }
);

const getUserLearningGroups = createSelector(
    getUserAnalytics,
    (userAnalytics) => {
        return userAnalytics[Datasets.USER_LEARNING_GROUPS];
    }
);

const getLearningGroupTypes = createSelector(
    getUserAnalytics,
    (userAnalytics) => {
        return userAnalytics[Datasets.LEARNING_GROUP_TYPES];
    }
);

const getCourseStartTime = (state) => state.views.dashboard.courseStartTime;

const getRecommendations = (state) => state.views.dashboard.recommendations;

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    getUserAnalytics,
    getUserInteractions,
    getUserLearningGroups,
    getLearningGroupTypes,
    getCourseStartTime,
    getRecommendations,
    internal as _test,
};
