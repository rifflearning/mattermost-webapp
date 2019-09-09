// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {app} from 'utils/riff';
import {weekNumToMillis} from 'utils/riff/recommendations/time';

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
 * Return the number of meetings a user participated in
 * that had at least one teammate
 *
 * TODO: for something that is just counting, there seem to be potentially large
 * intermediate collections created. Can't we do this a little more efficiently? -mjl 2019-09-09
 *
 * @param {string} userId - the user ID (string)
 * @param {Array<string>} teammateIds - an array of the IDs of all of the user's team members
 * @param {number} startWeek - the week number of the course to start the count from
 * @param {number} numWeeks - the number of weeks to count (should be at least 1)
 *
 * @returns {Promise<number>}
 */
async function numberOfUserMeetingsDuringWeeks(userId, teammateIds, startWeek, numWeeks, courseStartTime) {
    if (numWeeks <= 0) {
        return 0;
    }

    const startTimeMs = weekNumToMillis(startWeek, courseStartTime);
    const endTimeMs = weekNumToMillis(startWeek + numWeeks, courseStartTime);
    const events = await internal.getUserParticipantEvents(userId, startTimeMs, endTimeMs);
    const eventsWithTeammates = events.data.filter((event) => {
        // we count any meeting with at least one other team member
        return teammateIds.some((id) => event.participants.includes(id));
    });
    const meetingsWithTeammates = new Set(eventsWithTeammates.map((event) => event.meeting));

    return meetingsWithTeammates.size;
}

export {
    numberOfUserMeetingsDuringWeeks,
    internal as _test,
};
