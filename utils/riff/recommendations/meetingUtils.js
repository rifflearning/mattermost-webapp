// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {app, logger} from 'utils/riff';

/**
 * Returns a promise that resolves to an array of all the participantEvents from the given time range
 * that the user specified by `userId` was involved in
 *
 * @param {string} userId - the ID of the user to filter on
 * @param {number} startTimeMs - the start time of the search range in epoch time (millisecond)
 * @param {number} startTimeMs - the end time of the search range in epoch time (millisecond)
 *
 * @returns {Promise<Array<ParticipantEvent>>}
 */
function getUserParticipantEvents(userId, startTimeMs, endTimeMs) {
    return app.service('participantEvents').find({
        query: {
            timestamp: {
                $gt: startTimeMs,
                $lt: endTimeMs,
            },
            participants: userId,
            $limit: 10000,
        },
    });
}

const internal = {
    getUserParticipantEvents,
};

/**
 * Get the count of meetings that fit the given criteria
 * - meeting occurred in the given time period
 * - meeting was attended by the given participant
 * - meeting was also attended by at least one of the other participants
 *
 * @param {Object} constraint
 * @param {Date} constraint.startTime - only consider meetings that occurred after this time
 * @param {Date} constraint.endTime - only consider meetings that occurred before this time
 * @param {string} constraint.participantId - Id of participant who must have attended the meeting
 * @param {Set<string>} constraint.withOneParticipantOf - a set of ids of participants one of whom
 *      must have attended the meeting
 *
 * @returns {Promise<number>}
 */
async function numberOfMeetingsWhere({startTime, endTime, participantId, withOneParticipantOf}) {
    try {
        const {data: events} = await internal.getUserParticipantEvents(participantId, startTime.getTime(), endTime.getTime());

        const meetingsWithTeammates = events.reduce((meetings, event) => {
            if (event.participants.some((id) => withOneParticipantOf.has(id))) {
                meetings.add(event.meeting);
            }
            return meetings;
        }, new Set());

        return meetingsWithTeammates.size;
    }
    catch (e) {
        logger.error('numberOfMeetingsWhere: failed to count meetings',
                     {e, startTime, endTime, participantId, withOneParticipantOf});
        return 0;
    }
}

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    numberOfMeetingsWhere,
    internal as _test,
};
