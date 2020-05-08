// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * @fileoverview Defines the recommendation classes for mattermost teams
 * that are associated with a course (users sign in via an LTI link from
 * an LMS).
 */

import React from 'react';
import {createSelector} from 'reselect';
import {Link} from 'react-router-dom';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getAllChannels} from 'mattermost-redux/selectors/entities/channels';

import {
    getUserInteractions,
    getUserLearningGroups,
    getCourseStartTime,
} from 'selectors/views/dashboard';
import {logger} from 'utils/riff';

import {didUserPostInChannel} from './channelUtils';
import {numberOfMeetingsWhere} from './meetingUtils';
import {getWeekNumber, weekNumToDate} from './time';
import {RecommendationTypes} from './rec_constants';
import {RecommendationBase} from './rec_base';

/**
 * internal contains all module internal values used by the exported
 * classes/functions defined in this module. This provides a way to
 * mock these values in unit tests of the exported functions.
 *
 * This should be kept simple, ie properties set to 1 line values
 */
const internal = {
    getCurrentTeam,
    getCurrentUserId,
    getAllChannels,
    getUserLearningGroups,
    getCourseStartTime,
    didUserPostInChannel,
    numberOfMeetingsWhere,
    getWeekNumber,
    weekNumToDate,
    getGroupChannel,
    createLearningGroupInfoSelector, // can not be mocked (not sure if it should be here or not)
    getPlgInfo: null, // forward declaration, assigned later in the module
    getCapstoneInfo: null, // forward declaration, assigned later in the module
    getTownSquareInfo: null, // forward declaration, assigned later in the module
    now: Date.now,
};

/* ******************************************************************************
 * RecTownSquarePost                                                       */ /**
 *
 * Posting in the "town square" public channel is the first step towards being
 * engaged w/ course classmates.
 *
 * This recommendation should be shown for the first 2 weeks of the course.
 * It is completed once the user (student) has posted to the "town square"
 * public channel.
 *
 * The "town square" channel is that channel designated by the course as the
 * main gathering place for all the students in the course.
 * Currently the "town square" channel is named "Town Square" w/ a slug name
 * of "town-square".
 *
 ********************************************************************************/
class RecTownSquarePost extends RecommendationBase {
    static recType = RecommendationTypes.TOWN_SQUARE_POST;
    static description = 'User has posted in Town Square ever.';
    static startWeek = 1;
    static numWeeksToDisplay = 2;
    static priority = 0;
    static displayText = '';

    /* **************************************************************************
     * constructor                                                         */ /**
     *
     * RecTownSquarePost class constructor.
     *
     * @param {Object} config
     * @param {Object} config.state
     */
    constructor(config) {
        super(RecommendationBase.baseConfig(RecTownSquarePost));

        this._townSquareInfo = internal.getTownSquareInfo(config.state);
        this.displayText = this._getDisplayText();
    }

    /* **************************************************************************
     * checkIsComplete                                                     */ /**
     *
     * Tests if the current user has completed this recommendation, and sets
     * the {@link RecommendationBase#isComplete} property to reflect what is
     * determined.
     * @protected
     * @override
     *
     * @param {function(): Object} getState - function which returns the redux state
     *
     * @returns {Promise<bool>} true if the current user has completed this
     *      recommendation, false if they haven't
     */
    async checkIsComplete(getState) {
        const state = getState();
        const currentUserId = internal.getCurrentUserId(state);
        this._isComplete = await internal.didUserPostInChannel(currentUserId, this._townSquareInfo.channel.id);

        return this._isComplete;
    }

    /* **************************************************************************
     * _getDisplayText                                                     */ /**
     *
     * Private function which returns the display text react element for this
     * recommendation.
     * @private
     *
     * @returns {ReactElement} the text to be displayed to the user for this
     *      recommendation.
     */
    _getDisplayText() {
        const displayText = (
            <React.Fragment>
                {'Introduce yourself in '}
                <Link to={this._townSquareInfo.url}>{'Town Square'}</Link>
                {' to begin connecting with other learners in the course.'}
            </React.Fragment>
        );

        return displayText;
    }
}

/* ******************************************************************************
 * RecTwoChatsPerWeek                                                      */ /**
 *
 * Having at least 2 face to face meetings with members of your team in the
 * course every week keeps the student connected to their team and leads to
 * a more successful course outcome.
 *
 * This recommendation should be shown for all weeks after the 1st one,
 * ie weeks 2-8.
 * It is completed each week once the user (student) has had 2 video meetings
 * with some members of either of their teams in the current week.
 * It is expected to be incomplete at the start of each week it is shown.
 *
 ********************************************************************************/
class RecTwoChatsPerWeek extends RecommendationBase {
    static recType = RecommendationTypes.TWO_VIDEO_MEETINGS;
    static description = 'User has held two Riff meetings with their PLG this week.';
    static startWeek = 2;
    static numWeeksToDisplay = 7;
    static priority = 0;
    static displayText = 'Have two Riff calls with your team this week. ' +
                         'Teams who do are more likely to finish the course and have higher grades.';

    /* **************************************************************************
     * constructor                                                         */ /**
     *
     * RecTwoChatsPerWeek class constructor.
     *
     * @param {Object} config
     * @param {Object} config.state
     */
    constructor(config) {
        super(RecommendationBase.baseConfig(RecTwoChatsPerWeek));

        /**
         * teammate ids of all of the user's team mates from both the
         * plg and capstone teams.
         * @type {Set}
         */
        this._teammateIds = new Set();
        const plgInfo = internal.getPlgInfo(config.state);
        const capstoneInfo = internal.getCapstoneInfo(config.state);
        plgInfo.teammateIds.forEach((id) => this._teammateIds.add(id));
        capstoneInfo.teammateIds.forEach((id) => this._teammateIds.add(id));
    }

    /* **************************************************************************
     * shouldDisplay                                                       */ /**
     *
     * Determine whether the recommendation should be displayed.
     * @override
     */
    shouldDisplay(courseStartTime, displayTime) {
        if (!super.shouldDisplay(courseStartTime, displayTime)) {
            return false;
        }

        if (this._teammateIds.size === 0) {
            logger.info('RecTwoChatsPerWeek.shouldDisplay: recommendation will not display ' +
                        'because user has no teammates');
            return false;
        }

        return true;
    }

    /* **************************************************************************
     * checkIsComplete                                                     */ /**
     *
     * Tests if the current user has completed this recommendation, and sets
     * the {@link RecommendationBase#isComplete} property to reflect what is
     * determined.
     * @protected
     * @override
     *
     * @param {function(): Object} getState - function which returns the redux state
     *
     * @returns {Promise<bool>} true if the current user has completed this
     *      recommendation, false if they haven't
     */
    async checkIsComplete(getState) {
        const state = getState();
        const currentUserId = internal.getCurrentUserId(state);
        const courseStartTime = internal.getCourseStartTime(state);
        const currentTime = new Date(internal.now());
        const currentWeek = internal.getWeekNumber(courseStartTime, currentTime);
        const currentWeekStart = internal.weekNumToDate(courseStartTime, currentWeek);

        if (this._teammateIds.size === 0) {
            logger.error('RecTwoChatsPerWeek._checkIsComplete: This rec should not be displayed, ' +
                         'and therefore it should not check for completed');
            this._isComplete = Promise.resolve(false);
            return this._isComplete;
        }

        const numMeetingsThisWeek = await internal.numberOfMeetingsWhere({
            startTime: currentWeekStart,
            endTime: currentTime,
            participantId: currentUserId,
            withOneParticipantOf: this._teammateIds,
        });

        this._isComplete = numMeetingsThisWeek >= 2;

        return this._isComplete;
    }
}

/* ******************************************************************************
 * RecConnectWithCourse                                                    */ /**
 *
 * Interacting w/ many of one's classmates is indicative of a higher level
 * of engagement in the course and we believe it will lead to better
 * results.
 *
 * This recommendation should be shown starting in the 5th week for the
 * remainder of the course, ie weeks 5-8.
 * It is completed once the user had interacted with at least some set number
 * of distinct other users.
 *
 ********************************************************************************/
class RecConnectWithCourse extends RecommendationBase {
    static recType = RecommendationTypes.CONNECT_WITH_OTHERS;
    static description = 'User connected broadly with others.';
    static startWeek = 5;
    static numWeeksToDisplay = 4;
    static priority = 0;
    static displayText = '';
    static minimumConnectionsToComplete = 10;

    /* **************************************************************************
     * constructor                                                         */ /**
     *
     * RecTwoChatsPerWeek class constructor.
     *
     * @param {Object} config
     * @param {Object} config.state
     */
    constructor(config) {
        super(RecommendationBase.baseConfig(RecConnectWithCourse));

        this._townSquareInfo = internal.getTownSquareInfo(config.state);
        this.displayText = this._getDisplayText();
    }

    /* **************************************************************************
     * checkIsComplete                                                     */ /**
     *
     * Tests if the current user has completed this recommendation, and sets
     * the {@link RecommendationBase#isComplete} property to reflect what is
     * determined.
     * @protected
     * @override
     *
     * @param {function(): Object} getState - function which returns the redux state
     *
     * @returns {Promise<bool>} true if the current user has completed this
     *      recommendation, false if they haven't
     */
    async checkIsComplete(getState) {
        const state = getState();
        const userInteractons = getUserInteractions(state);
        const userConnections = new Set();
        for (const interaction of userInteractons) {
            if (interaction.context === 'course') {
                userConnections.add(interaction.username);
            }
        }
        logger.debug('RecConnectWithCourse._checkIsComplete: userConnections', {userConnections});

        this._isComplete = userConnections.size >= RecConnectWithCourse.minimumConnectionsToComplete;

        return this._isComplete;
    }

    /* **************************************************************************
     * _getDisplayText                                                     */ /**
     *
     * Private function which returns the display text react element for this
     * recommendation.
     * @private
     *
     * @returns {ReactElement} the text to be displayed to the user for this
     *      recommendation.
     */
    _getDisplayText() {
        const displayText = (
            <React.Fragment>
                {'Reach out to other learners in the course to build your network. '}
                <Link to={this._townSquareInfo.url}>{'Town Square'}</Link>
                {' is a great place to start.'}
            </React.Fragment>
        );

        return displayText;
    }
}

/* ******************************************************************************
 * RecPostInPLGChannel                                                     */ /**
 *
 * Connecting with your team members helps get the student engaged.
 *
 * This recommendation should be shown for the 1st 2 weeks of the course.
 * It is completed once the user has posted in their private PLG channel.
 *
 ********************************************************************************/
class RecPostInPLGChannel extends RecommendationBase {
    static recType = RecommendationTypes.PLG_POST;
    static description = 'User has made at least one post in their PLG.';
    static startWeek = 1;
    static numWeeksToDisplay = 2;
    static priority = 2;
    static displayText = '';

    /* **************************************************************************
     * constructor                                                         */ /**
     *
     * RecPostInPLGChannel class constructor.
     *
     * @param {Object} config
     * @param {Object} config.state
     */
    constructor(config) {
        super(RecommendationBase.baseConfig(RecPostInPLGChannel));

        this._plgInfo = internal.getPlgInfo(config.state);
        this.displayText = this._getDisplayText();
    }

    /* **************************************************************************
     * shouldDisplay                                                       */ /**
     *
     * Determine whether the recommendation should be displayed.
     * @override
     */
    shouldDisplay(courseStartTime, displayTime) {
        if (!super.shouldDisplay(courseStartTime, displayTime)) {
            return false;
        }

        if (this._plgInfo.channel === null) {
            logger.info('RecPostInPLGChannel.shouldDisplay: recommendation will not display ' +
                        'because user is not in a PLG team');
            return false;
        }

        return true;
    }

    /* **************************************************************************
     * checkIsComplete                                                     */ /**
     *
     * Tests if the current user has completed this recommendation, and sets
     * the {@link RecommendationBase#isComplete} property to reflect what is
     * determined.
     * @protected
     * @override
     *
     * @param {function(): Object} getState - function which returns the redux state
     *
     * @returns {Promise<bool>} true if the current user has completed this
     *      recommendation, false if they haven't
     */
    async checkIsComplete(getState) {
        const state = getState();
        const currentUserId = internal.getCurrentUserId(state);

        // It is possible that the current user here and the one used to set the plgInfo
        // are different, but that shouldn't happen w/ how we are using recommendations.
        logger.debug('RecPostInPLGChannel._checkIsComplete:', {currentUserId, plgInfo: this._plgInfo});

        if (this._plgInfo.channel === null) {
            logger.error('RecPostInPLGChannel._checkIsComplete: This rec should not be displayed, ' +
                         'and therefore it should not check for completed');
            this._isComplete = Promise.resolve(false);
            return this._isComplete;
        }

        this._isComplete = await didUserPostInChannel(currentUserId, this._plgInfo.channel.id);
        return this._isComplete;
    }

    /* **************************************************************************
     * _getDisplayText                                                     */ /**
     *
     * Private function which returns the display text react element for this
     * recommendation.
     * @private
     *
     * @returns {ReactElement} the text to be displayed to the user for this
     *      recommendation.
     */
    _getDisplayText() {
        const displayText = (
            <React.Fragment>
                {'Head over to your '}
                <Link to={this._plgInfo.url}>{'PLG channel'}</Link>
                {' and say hello to your team.'}
            </React.Fragment>
        );

        return displayText;
    }
}

/* ******************************************************************************
 * RecChatWithPLGTeam                                                      */ /**
 *
 * The sooner the student meets face to face w/ the other members of their
 * team, the more likely they will feel connected and continue to have
 * more meetings.
 *
 * This recommendation should be shown for the 1st 2 weeks of the course.
 * It is completed once the user has had a video meeting with at least one
 * of their PLG team members.
 *
 ********************************************************************************/
class RecChatWithPLGTeam extends RecommendationBase {
    static recType = RecommendationTypes.PLG_VIDEO;
    static description = 'User has met with PLG at least once.';
    static startWeek = 1;
    static numWeeksToDisplay = 1;
    static priority = 1;
    static displayText = 'Have a Riff video call with your PLG team.';

    /* **************************************************************************
     * constructor                                                         */ /**
     *
     * RecChatWithPLGTeam class constructor.
     *
     * @param {Object} config
     * @param {Object} config.state
     */
    constructor(config) {
        super(RecommendationBase.baseConfig(RecChatWithPLGTeam));

        this._plgInfo = internal.getPlgInfo(config.state);
    }

    /* **************************************************************************
     * shouldDisplay                                                       */ /**
     *
     * Determine whether the recommendation should be displayed.
     * @override
     */
    shouldDisplay(courseStartTime, displayTime) {
        if (!super.shouldDisplay(courseStartTime, displayTime)) {
            return false;
        }

        if (this._plgInfo.channel === null) {
            logger.info('RecChatWithPLGTeam.shouldDisplay: recommendation will not display ' +
                        'because user is not in a PLG team');
            return false;
        }

        return true;
    }

    /* **************************************************************************
     * checkIsComplete                                                     */ /**
     *
     * Tests if the current user has completed this recommendation, and sets
     * the {@link RecommendationBase#isComplete} property to reflect what is
     * determined.
     * @protected
     * @override
     *
     * @param {function(): Object} getState - function which returns the redux state
     *
     * @returns {Promise<bool>} true if the current user has completed this
     *      recommendation, false if they haven't
     */
    async checkIsComplete(getState) {
        const state = getState();
        const currentUserId = internal.getCurrentUserId(state);
        const courseStartTime = internal.getCourseStartTime(state);

        // It is possible that the current user here and the one used to set the plgInfo
        // are different, but that shouldn't happen w/ how we are using recommendations.
        logger.debug('RecChatWithCapstoneTeam._checkIsComplete:', {currentUserId, plgInfo: this._plgInfo});

        if (this._plgInfo.channel === null) {
            logger.error('RecChatWithCapstoneTeam._checkIsComplete: This rec should not be displayed, ' +
                         'and therefore it should not check for completed');
            this._isComplete = Promise.resolve(false);
            return this._isComplete;
        }

        // number of meetings during the weeks this recommendation should be shown
        const startTime = internal.weekNumToDate(courseStartTime, this.startWeek);
        const endTime = internal.weekNumToDate(startTime, this.numWeeksToDisplay);

        const numMtgs = await internal.numberOfMeetingsWhere({
            startTime,
            endTime,
            participantId: currentUserId,
            withOneParticipantOf: new Set(this._plgInfo.teammateIds),
        });

        this._isComplete = numMtgs > 0;

        return this._isComplete;
    }
}

/* ******************************************************************************
 * RecPostInCapstoneChannel                                                */ /**
 *
 * Connecting with your team members helps get the student engaged.
 *
 * This recommendation should be shown for the 1st 2 weeks after the capstone
 * teams are formed (week 4).
 * It is completed once the user has posted in their private capstone channel.
 *
 ********************************************************************************/
class RecPostInCapstoneChannel extends RecommendationBase {
    static recType = RecommendationTypes.CAPSTONE_POST;
    static description = 'User has made at least one post in their Capstone channel.';
    static startWeek = 4;
    static numWeeksToDisplay = 2;
    static priority = 2;
    static displayText = '';

    /* **************************************************************************
     * constructor                                                         */ /**
     *
     * RecPostInCapstoneChannel class constructor.
     *
     * @param {Object} config
     * @param {Object} config.state
     */
    constructor(config) {
        super(RecommendationBase.baseConfig(RecPostInCapstoneChannel));

        this._capstoneInfo = internal.getCapstoneInfo(config.state);
        this.displayText = this._getDisplayText();
    }

    /* **************************************************************************
     * shouldDisplay                                                       */ /**
     *
     * Determine whether the recommendation should be displayed.
     * @override
     */
    shouldDisplay(courseStartTime, displayTime) {
        if (!super.shouldDisplay(courseStartTime, displayTime)) {
            return false;
        }

        if (this._capstoneInfo.channel === null) {
            logger.info('RecPostInCapstoneChannel.shouldDisplay: recommendation will not display ' +
                        'because user is not in a capstone team');
            return false;
        }

        return true;
    }

    /* **************************************************************************
     * checkIsComplete                                                     */ /**
     *
     * Tests if the current user has completed this recommendation, and sets
     * the {@link RecommendationBase#isComplete} property to reflect what is
     * determined.
     * @protected
     * @override
     *
     * @param {function(): Object} getState - function which returns the redux state
     *
     * @returns {Promise<bool>} true if the current user has completed this
     *      recommendation, false if they haven't
     */
    async checkIsComplete(getState) {
        const state = getState();
        const currentUserId = internal.getCurrentUserId(state);

        // It is possible that the current user here and the one used to set the capstoneInfo
        // are different, but that shouldn't happen w/ how we are using recommendations.
        logger.debug('RecPostInCapstoneChannel._checkIsComplete:', {currentUserId, capstoneInfo: this._capstoneInfo});

        if (this._capstoneInfo.channel === null) {
            logger.error('RecPostInCapstoneChannel._checkIsComplete: This rec should not be displayed, ' +
                         'and therefore it should not check for completed');
            this._isComplete = Promise.resolve(false);
            return this._isComplete;
        }

        this._isComplete = await didUserPostInChannel(currentUserId, this._capstoneInfo.channel.id);
        return this._isComplete;
    }

    /* **************************************************************************
     * _getDisplayText                                                     */ /**
     *
     * Private function which returns the display text react element for this
     * recommendation.
     * @private
     *
     * @returns {ReactElement} the text to be displayed to the user for this
     *      recommendation.
     */
    _getDisplayText() {
        const displayText = (
            <React.Fragment>
                {'Head over to your '}
                <Link to={this._capstoneInfo.url}>{'capstone channel'}</Link>
                {' and say hello to your team.'}
            </React.Fragment>
        );

        return displayText;
    }
}

/* ******************************************************************************
 * RecChatWithCapstoneTeam                                                 */ /**
 *
 * The sooner the student meets face to face w/ the other members of their
 * team, the more likely they will feel connected and continue to have
 * more meetings.
 *
 * This recommendation should be shown for the 1st 2 weeks of the course.
 * It is completed once the user has had a video meeting with at least one
 * of their capstone team members.
 *
 ********************************************************************************/
class RecChatWithCapstoneTeam extends RecommendationBase {
    static recType = RecommendationTypes.CAPSTONE_VIDEO;
    static description = 'User has held a Riff video meeting with their Capstone team.';
    static startWeek = 4;
    static numWeeksToDisplay = 1;
    static priority = 1;
    static displayText = 'Have a Riff video call with your Capstone team.';

    /* **************************************************************************
     * constructor                                                         */ /**
     *
     * RecChatWithCapstoneTeam class constructor.
     *
     * @param {Object} config
     * @param {Object} config.state
     */
    constructor(config) {
        super(RecommendationBase.baseConfig(RecChatWithCapstoneTeam));

        this._capstoneInfo = internal.getCapstoneInfo(config.state);
    }

    /* **************************************************************************
     * shouldDisplay                                                       */ /**
     *
     * Determine whether the recommendation should be displayed.
     * @override
     */
    shouldDisplay(courseStartTime, displayTime) {
        if (!super.shouldDisplay(courseStartTime, displayTime)) {
            return false;
        }

        if (this._capstoneInfo.channel === null) {
            logger.info('RecChatWithCapstoneTeam.shouldDisplay: recommendation will not display ' +
                        'because user is not in a capstone team');
            return false;
        }

        return true;
    }

    /* **************************************************************************
     * checkIsComplete                                                     */ /**
     *
     * Tests if the current user has completed this recommendation, and sets
     * the {@link RecommendationBase#isComplete} property to reflect what is
     * determined.
     * @protected
     * @override
     *
     * @param {function(): Object} getState - function which returns the redux state
     *
     * @returns {Promise<bool>} true if the current user has completed this
     *      recommendation, false if they haven't
     */
    async checkIsComplete(getState) {
        const state = getState();
        const currentUserId = internal.getCurrentUserId(state);
        const courseStartTime = internal.getCourseStartTime(state);

        // It is possible that the current user here and the one used to set the capstoneInfo
        // are different, but that shouldn't happen w/ how we are using recommendations.
        logger.debug('RecChatWithCapstoneTeam._checkIsComplete:', {currentUserId, capstoneInfo: this._capstoneInfo});

        if (this._capstoneInfo.channel === null) {
            logger.error('RecChatWithCapstoneTeam._checkIsComplete: This rec should not be displayed, ' +
                         'and therefore it should not check for completed');
            this._isComplete = Promise.resolve(false);
            return this._isComplete;
        }

        // number of meetings during the weeks this recommendation should be shown
        const startTime = internal.weekNumToDate(courseStartTime, this.startWeek);
        const endTime = internal.weekNumToDate(startTime, this.numWeeksToDisplay);

        const numMtgs = await internal.numberOfMeetingsWhere({
            startTime,
            endTime,
            participantId: currentUserId,
            withOneParticipantOf: new Set(this._capstoneInfo.teammateIds),
        });

        this._isComplete = numMtgs > 0;

        return this._isComplete;
    }
}

/**
 * Selector factory to create a specialized selector for the info of a particular
 * type of learning group (identified by prefix).
 * We use this factory rather than pass the type of learning group to the
 * selector so that it can be 'memoized' for the type of learning group.
 *
 * @param {string} lgPrefix - prefix that identifies the learning group type to retrieve
 *
 * @returns {function(state: Object): {channel: Object, teammateIds: Array<string>, url: string}}
 */
function createLearningGroupInfoSelector(lgPrefix) {
    return createSelector(
        internal.getCurrentUserId,
        internal.getUserLearningGroups,
        internal.getCurrentTeam,
        internal.getAllChannels,
        (currentUserId, userLearningGroups, team, allChannels) => {
            const lgInfo = {
                channel: null,
                teammateIds: [],
                url: '',
            };

            // the user's matching lg is one they still belong to and that has the correct lg prefix
            const usersLg = (lg) => !lg.has_left_group && lg.learning_group_prefix === lgPrefix;

            // there may be more than one that matches, we're only going to find and return
            // info about the 1st.
            logger.debug(`createLearningGroupInfoSelector(${lgPrefix}): args`, {currentUserId, userLearningGroups});
            const learningGroup = userLearningGroups.find(usersLg);

            if (learningGroup === undefined) { // eslint-disable-line no-undefined
                return lgInfo;
            }

            lgInfo.channel = allChannels[learningGroup.channel_id];

            if (learningGroup.members) {
                lgInfo.teammateIds = learningGroup.members.map((member) => member.id).filter((id) => id !== currentUserId);
            }

            lgInfo.url = `/${team.name}/channels/${lgInfo.channel.name}`;

            return lgInfo;
        }
    );
}

/**
 * Selector that gets the current user's plg learning group's info
 *
 * @param {Object} state - the redux state
 *
 * @returns {{channel: Object, teammateIds: Array<string>, url: string}}
 */
internal.getPlgInfo = createLearningGroupInfoSelector('plg');

/**
 * Selector that gets the current user's capstone learning group's info
 *
 * @param {Object} state - the redux state
 *
 * @returns {{channel: Object, teammateIds: Array<string>, url: string}}
 */
internal.getCapstoneInfo = createLearningGroupInfoSelector('capstone');

/**
 * Selector that gets the current team's town-square channel info
 *
 * @param {Object} state - the redux state
 *
 * @returns {{channel: Object, url: string}}
 */
internal.getTownSquareInfo = createSelector(
    internal.getCurrentTeam,
    internal.getAllChannels,
    (team, allChannels) => {
        const tsqInfo = {
            channel: null,
            url: '',
        };

        const isTeamsTownSquare = (channel) => {
            return channel.name === 'town-square' && channel.team_id === team.id;
        };
        tsqInfo.channel = Object.values(allChannels).find(isTeamsTownSquare);
        tsqInfo.url = `/${team.name}/channels/${tsqInfo.channel.name}`;

        return tsqInfo;
    }
);

/**
 * Convert an array of LearningGroup objects to an array of IDs of the
 * users in the given user's PLG
 *
 * @param {string} prefix - the type of learning group
 *      see {@link https://github.com/rifflearning/mattermost-server/blob/develop/model/user.go}
 * @param {string} userId - the ID of the current user
 * @param {Array<UserLearningGroup>} learningGroups - array of LearningGroup objects
 *
 * @returns {Array<{channelId: string, teammateIds: Array<string>}>} object with the
 *      channelId of user's learning group of the requested type and the user ids of all
 *      members of that channel except the user.
 *      If no matching learning group is found, the returned channel id will be an
 *      empty string and the teammateIds will be an empty array.
 */
function getGroupChannel(prefix, userId, learningGroups) {
    const lgChannel = {
        channelId: '',
        teammateIds: [],
    };

    // the user's matching lg is one they still belong to and that has the correct lg prefix
    const usersLg = (lg) => !lg.has_left_group && lg.learning_group_prefix === prefix;

    // there may be more than one that matches, we're only going to find and return
    // info about the 1st.
    const learningGroup = learningGroups.find(usersLg);

    if (learningGroup === undefined) { // eslint-disable-line no-undefined
        return lgChannel;
    }

    lgChannel.channelId = learningGroup.channel_id;

    if (learningGroup.members) {
        lgChannel.teammateIds = learningGroup.members.map((user) => user.id).filter((id) => id !== userId);
    }

    return lgChannel;
}

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    RecTownSquarePost,
    RecTwoChatsPerWeek,
    RecConnectWithCourse,
    RecPostInPLGChannel,
    RecChatWithPLGTeam,
    RecPostInCapstoneChannel,
    RecChatWithCapstoneTeam,
    internal as _test,
};

