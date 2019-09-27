// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getUserAnalytics} from 'mattermost-redux/actions/users';
import {Datasets} from 'mattermost-redux/constants/user_analytics';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {
    getUserInteractions,
    getUserLearningGroups,
    getCourseStartTime,
} from 'selectors/views/dashboard';
import {logger} from 'utils/riff';

import {RecommendationTypes} from './rec_constants';
import {
    RecTownSquarePost,
    RecTwoChatsPerWeek,
    RecConnectWithCourse,
    RecPostInPLGChannel,
    RecChatWithPLGTeam,
    RecPostInCapstoneChannel,
    RecChatWithCapstoneTeam,
} from './recs_course_team';

/**
 * Map recommendation type to object w/ info for the factory to use to create a recommendation of that type
 *
 * The info contains the class to be instantiated for the type (RecClass) and a list of
 * property names the configuration object is expected to have (configProps). Currently
 * properties with the same name should have the same value for all recommendations. And configProps
 * is unused except as documentation so it's easy to see what props each recommendation needs.
 */
/* eslint-disable no-multi-spaces */
const recommendationFactoryMap = {
    [RecommendationTypes.TOWN_SQUARE_POST]:     {RecClass: RecTownSquarePost,           configProps: ['state']},
    [RecommendationTypes.TWO_VIDEO_MEETINGS]:   {RecClass: RecTwoChatsPerWeek,          configProps: ['state']},
    [RecommendationTypes.CONNECT_WITH_OTHERS]:  {RecClass: RecConnectWithCourse,        configProps: ['state']},
    [RecommendationTypes.PLG_POST]:             {RecClass: RecPostInPLGChannel,         configProps: ['state']},
    [RecommendationTypes.PLG_VIDEO]:            {RecClass: RecChatWithPLGTeam,          configProps: ['state']},
    [RecommendationTypes.CAPSTONE_POST]:        {RecClass: RecPostInCapstoneChannel,    configProps: ['state']},
    [RecommendationTypes.CAPSTONE_VIDEO]:       {RecClass: RecChatWithCapstoneTeam,     configProps: ['state']},
};
/* eslint-enable no-multi-spaces */

/**
 * internal contains all module internal values used by the exported
 * classes/functions defined in this module. This provides a way to
 * mock these values in unit tests of the exported functions.
 */
const internal = {
    getAllRecs,
    getCourseStartTime,
    now: Date.now,
    recommendationFactoryMap,
    recommendationFactory,
    ensureStateDependencyExistence,
};

/* ******************************************************************************
 * recommendationFactory                                                   */ /**
 *
 * Create a new instance of a recommendation given the desired recommendation
 * type and configuration object for that recommendation.
 *
 * @param {RecommendationTypes} recType - recommendation type to create
 * @param {string} config - configuration object for the requested recommendation
 *      constructor.
 *
 * @returns {RecommendationBase} a new instance of a recommendation of the
 *      specified recommendation type.
 */
function recommendationFactory(recType, config) {
    // TODO: check and log an error if the factory can't create the given recType
    // TODO: check and log a warning? if the config doesn't have a property needed
    //       to construct the given recType
    //       Not sure whether to throw an exception in these cases or return null
    //       I'm leaning towards an exception, since this is an error that shouldn't
    //       occur. -mjl 2019-09-26
    return new internal.recommendationFactoryMap[recType].RecClass(config);
}

/* ******************************************************************************
 * getAllRecs                                                              */ /**
 *
 * Get an array of new instances of all recommendations. These recommendations
 * will not have been initialized, as that is usually an asynchronous operation.
 *
 * @param {Object=} config
 *      Object which must contain all properties needed by the constructor of
 *      all recommendations. There is currently no mechanism to pass different
 *      config objects to different recommendations.
 *      Currently the only property required is 'state' which should contain
 *      the current redux state.
 *
 * @returns {Array<BaseRecommendation>} Array containing a new instance of every
 *      recommendation.
 */
function getAllRecs(config) {
    return Object.values(RecommendationTypes).map((recType) => internal.recommendationFactory(recType, config));
}

/* ******************************************************************************
 * getRecsForNowByPriority                                                 */ /**
 *
 * Get the selection of recommendations it is appropriate to display at this
 * time, initialize those recommendations, and return them sorted by priority.
 *
 * @param {function(ReduxAction | AsyncThunk): *} dispatch
 *      dispatch is needed in case the redux state needs to be updated before
 *      creating the recommendations which need the redux state in their config.
 *
 * @param {function(): Object} getState
 *
 * @returns {Promise<Array<RecommendationBase>>} array of initialized
 *      recommendations it is appropriate to display now sorted by priority
 *      (highest priority first).
 */
async function getRecsForNowByPriority(dispatch, getState) {
    let allRecs;
    let orderedRecs;
    try {
        await internal.ensureStateDependencyExistence(dispatch, getState);

        const state = getState();
        const startTime = internal.getCourseStartTime(state);
        const timeNow = new Date(internal.now());
        logger.debug('RecFactory.getRecsForNowByPriority: state, course start and time now', {state, startTime, timeNow});

        allRecs = internal.getAllRecs({state});
        orderedRecs = allRecs
            .filter((rec) => rec.shouldDisplay(startTime, timeNow))
            .sort((a, b) => b.displayPriority() - a.displayPriority());
    }
    catch (e) {
        logger.error('RecFactory.getRecsForNowByPriority: creating some recommendations failed', {e});
        return [];
    }

    // Return the recommendations once they're all initialized
    try {
        logger.debug('RecFactory.getRecsForNowByPriority: initializing ordered recs to display', {orderedRecs, allRecs});
        await Promise.all(orderedRecs.map((rec) => rec.initialize(getState)));
        logger.info('RecFactory.getRecsForNowByPriority: initialized ordered recs to display', {orderedRecs});
    }
    catch (e) {
        logger.error('RecFactory.getRecsForNowByPriority: initialization of some recommendations failed', {e, orderedRecs});
        return [];
    }

    return orderedRecs;
}

/* ******************************************************************************
 * ensureStateDependencyExistence                                          */ /**
 *
 * Return a promise that resolves to true when all properties needed to create
 * the recommendations exist in the state object.
 *
 * TODO: Handle error conditions such as when the functions that should update
 * the state fail.
 *
 * TODO: The dependencies and the actions to get them should come from the
 * recommendations, not some "known" list as this function is doing now. -mjl 2019-10-02
 *
 * @param {function(ReduxAction | AsyncThunk): *} dispatch
 * @param {function(): Object} getState
 *
 * @returns {Promise<bool>} true to signify success, but a failure is always
 *      a rejection of the Promise.
 */
async function ensureStateDependencyExistence(dispatch, getState) {
    // TODO: check the getUserAnalytics request status instead of the userLearningGroups
    // and userInteractions properties.
    // and avoid possibly firing off another request while the 1st is still in progress

    let state = getState();
    const userId = getCurrentUserId(state);
    const teamId = getCurrentTeamId(state);

    if (getUserLearningGroups(getState()) === undefined) { // eslint-disable-line no-undefined
        logger.info('RecFactory.ensureStateDependencyExistence: userLearningGroups need to be retrieved', {userId, teamId});
        await dispatch(getUserAnalytics(userId, teamId, Datasets.USER_INTERACTIONS));
    }

    // Update the state
    state = getState();
    if (getUserInteractions(getState()) === undefined) { // eslint-disable-line no-undefined
        logger.info('RecFactory.ensureStateDependencyExistence: userInteractions need to be retrieved');
        await dispatch(getUserAnalytics(userId, teamId, Datasets.USER_INTERACTIONS));
    }

    return true;
}

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    getRecsForNowByPriority,
    recommendationFactory,
    getAllRecs,
    internal as _test,
};
