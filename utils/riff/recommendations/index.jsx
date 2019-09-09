// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Link} from 'react-router-dom';
import {Datasets} from 'mattermost-redux/constants/user_analytics';

// TODO: Don't use this store, use the mattermost-redux selectors and pass in the
// redux state. Such as import {getChannelsInTeam} from 'mattermost-redux/selectors/entities/channels';
// -mjl 2019-09-09
import ChannelStore from 'stores/channel_store';

// TODO: Accessing the redux store directly is a bad practice, we should be hooking
// up to the redux state via react-redux, but for now... -mjl 2019-09-10
import store from 'stores/redux_store.jsx';

import {logger} from 'utils/riff';
import {didUserPostInChannel, getChannelURL} from 'utils/riff/recommendations/channelUtils';
import {Recommendation} from 'utils/riff/recommendations/recs';
import {numberOfUserMeetingsDuringWeeks} from 'utils/riff/recommendations/meetingUtils';
import {getCurrentWeekNumber} from 'utils/riff/recommendations/time';

/**
 * Convert an array of LearningGroup objects to an array of IDs of the
 * users in the given user's PLG
 *
 * @param {string} userId - the ID of the current user
 * @param {Array<UserLearningGroup>} learningGroups - array of LearningGroup objects
 * @param {string} prefix - the type of learning group
 *      see {@link https://github.com/rifflearning/mattermost-server/blob/develop/model/user.go}
 *
 * @returns {Array<>} user ids of the members of the UserLearningGroup w/ the
 *      matching prefix.
 */
function getGroupChannel(userId, learningGroups, prefix) {
    const firstLearningGroup = learningGroups.find((group) => group.learning_group_prefix === prefix && !group.has_left_group);

    if (firstLearningGroup === undefined) { // eslint-disable-line no-undefined
        return {};
    }
    let teammateIds = [];
    if (firstLearningGroup.members) {
        teammateIds = firstLearningGroup.members.map((user) => user.id).filter((id) => id !== userId);
    }

    return {
        teammateIds,
        channelId: firstLearningGroup.channel_id,
    };
}

function getTownSquareId(teamId) {
    const isTeamsTownSquare = (channel) => {
        return channel.name === 'town-square' && channel.team_id === teamId;
    };
    const townSquareChannel = Object.values(ChannelStore.entities.channels).find(isTeamsTownSquare);
    return townSquareChannel.id;
}

const internal = {
    getChannelURL,
    getTownSquareId,
    recNames: [],
};

/**
 * Get all the recommendations that could potentially be displayed to the current user.
 *
 * TODO: Recommendations' definitions could possibly be moved to an external file or database.
 *
 * @param {string} userId - The id of the current user.
 * @param {string} teamId - The id of the team for which these recommendations should be produced.
 * @param {Array<UserLearningGroup>} learningGroups - An array of LearningGroup objects, representing
 *      learning groups that the current user is a memeber of.
 * @param {number} courseStartTime - The starting time of the course, in milliseconds since the
 *      Unix Epoch, local time.
 *
 * @returns {Array<Recommendation>} of Recommendation objects representing all the
 *      Recommendations that might be displayed.
 */
function getRecommendations(userId, teamId, learningGroups, courseStartTime) {
    const plgChannel = getGroupChannel(userId, learningGroups, 'plg');
    const capstoneChannel = getGroupChannel(userId, learningGroups, 'capstone');

    const townSquareId = internal.getTownSquareId(teamId);
    const hasPostedInTownSquare = new Recommendation(
        userId,
        1, // first week to display this recommendation
        2, // number of weeks to display for
        0, // relative priority to other recs for this week
        () => didUserPostInChannel(userId, townSquareId),
        <React.Fragment>
            {'Introduce yourself in '}
            <Link to={internal.getChannelURL(townSquareId)}>
                {'~Town Square'}
            </Link>
            {' to begin connecting with other learners in the course.'}
        </React.Fragment>,
        courseStartTime,
        'User has posted in Town Square ever.',
    );

    const hasTwoMeetingsPerWeek = new Recommendation(
        userId,
        2, // first week to display this recommendation
        // eslint-disable-next-line no-magic-numbers
        7, // number of weeks to display for
        0, // relative priority to other recs for this week
        async () => {
            const currentWeek = getCurrentWeekNumber(courseStartTime);
            let numMtgsPLG = 0;
            let numMtgsCap = 0;
            if ('teammateIds' in plgChannel) {
                numMtgsPLG = await numberOfUserMeetingsDuringWeeks(userId, plgChannel.teammateIds, currentWeek, 1, courseStartTime);
            }
            if ('teammateIds' in capstoneChannel) {
                numMtgsCap = await numberOfUserMeetingsDuringWeeks(userId, capstoneChannel.teammateIds, currentWeek, 1, courseStartTime);
            }
            return numMtgsPLG + numMtgsCap >= 2;
        },
        'Have two Riff calls with your team this week. ' +
        'Teams who do are more likely to finish the course and have higher grades.',
        courseStartTime,
        'User has held two Riff meetings with their PLG this week.',
    );

    const hasConnectedWithCourse = new Recommendation(
        userId,
        // eslint-disable-next-line no-magic-numbers
        5, //first week to display this recommendation
        3, // number of weeks to display for
        0, // relative priority to other recs for this week
        async () => {
            // TODO see about doing this via redux and the state -mjl 2019-09-09
            // also depending on data already having been retrieved is probably not a good idea.
            const userInteractons = store.getState().entities.users.analytics[Datasets.USER_INTERACTIONS];
            const userConnections = userInteractons.filter((interaction) => {
                return interaction.context === 'course';
            }).map((interaction) => {
                return interaction.username;
            });
            logger.debug('Rec#hasConnectedWithCourse.isCompleted: userConnections', {userConnections});
            return new Set(userConnections).size > 9;
        },
        <React.Fragment>
            {'Reach out to other learners in the course to build your network. '}
            <Link to={internal.getChannelURL(townSquareId)}>
                {'~Town Square'}
            </Link>
            {' is a great place to start.'}
        </React.Fragment>,
        courseStartTime,
        'User connected broadly with others.',
    );

    const defaultRecs = [
        hasPostedInTownSquare,
        hasTwoMeetingsPerWeek,
        hasConnectedWithCourse,
    ];

    // if a user has not joined a PLG or capstone group yet, we don't want to
    // display a recommendation about them
    let plgRecs = [];
    if (plgChannel.channelId) {
        const hasPostedInPLG = new Recommendation(
            userId,
            1, // first week to display this recommendation
            2, // number of weeks to display for
            2, // relative priority to other recs for this week
            () => didUserPostInChannel(userId, plgChannel.channelId),
            <React.Fragment>
                {'Head over to your '}
                <Link to={internal.getChannelURL(plgChannel.channelId)}>
                    {'PLG channel'}
                </Link>
                {' and say hello to your team.'}
            </React.Fragment>,
            courseStartTime,
            'User has made at least one post in their PLG.',
        );

        const hasMetWithPLG = new Recommendation(
            userId,
            1, // first week to display this recommendation
            1, // number of weeks to display for
            1, // relative priority to other recs for this week
            async () => {
                const numMtgs = await numberOfUserMeetingsDuringWeeks(userId, plgChannel.teammateIds, 1, 1, courseStartTime);
                return numMtgs > 0;
            },
            'Have a Riff video call with your PLG team.',
            courseStartTime,
            'User has met with PLG at least once.',
        );

        plgRecs = [hasPostedInPLG, hasMetWithPLG];
    }

    let capstoneRecs = [];
    if (capstoneChannel.channelId) {
        const hasPostedInCapstone = new Recommendation(
            userId,
            // eslint-disable-next-line no-magic-numbers
            4, // first week to display this recommendation
            2, // number of weeks to display for
            2, // relative priority to other recs for this week
            () => didUserPostInChannel(userId, capstoneChannel.channelId),
            <React.Fragment>
                {'Head over to your '}
                <Link to={internal.getChannelURL(capstoneChannel.channelId)}>
                    {'capstone channel'}
                </Link>
                {' and say hello to your team.'}
            </React.Fragment>,
            courseStartTime,
            'User has made at least one post in their Capstone channel.',
        );

        const hasMetWithCapstone = new Recommendation(
            userId,
            // eslint-disable-next-line no-magic-numbers
            4, //first week to display this recommendation
            1, // number of weeks to display for
            1, // relative priority to other recs for this week
            async () => {
                const numMtgs = await numberOfUserMeetingsDuringWeeks(userId, capstoneChannel.teammateIds, 1, 1, courseStartTime);
                return numMtgs > 0;
            },
            'Have a Riff video call with your Capstone team.',
            courseStartTime,
            'User has held a Riff video meeting with their Capstone team.',
        );

        capstoneRecs = [hasPostedInCapstone, hasMetWithCapstone];
    }

    const allRecs = defaultRecs.concat(plgRecs, capstoneRecs);

    internal.recNames = allRecs.map((rec) => rec.name);

    return allRecs;
}

export {
    internal as _test,
    getGroupChannel,
    getRecommendations,
};
