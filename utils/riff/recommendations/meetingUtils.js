// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {app} from 'utils/riff';
import {weekNumToMillis} from 'utils/riff/recommendations/time';

/**
 * Returns an array of all the participantEvents from the given time range
 * that the user specified by `userId` was involved in
 *
 * @userId the ID of the user to filter on
 * @startTimeMs the start time of the search range in epoch time (millisecond)
 * @startTimeMs the end time of the search range in epoch time (millisecond)
 */
function getUserParticipantEvents(userId, startTimeMs, endTimeMs) {
    return app.service('participantEvents').find({
        query: {
            timestamp: {
                $gt: startTimeMs,
                $lt: endTimeMs,
            },
            participants: userId,
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
 * @userId the user ID (string)
 * @teamIds an array of the IDs of all of the user's team members
 * @startWeek the week number of the course to start the count from
 * @numWeeks the number of weeks to count (should be at least 1)
 */
async function numberOfUserMeetingsDuringWeeks(userId, teamIds, startWeek, numWeeks) {
    if (numWeeks <= 0) {
        return 0;
    }

    const startTimeMs = weekNumToMillis(startWeek);
    const endTimeMs = weekNumToMillis(startWeek + numWeeks);
    const events = await internal.getUserParticipantEvents(userId, startTimeMs, endTimeMs);
    const eventsWithTeammates = events.filter((event) => {
        // we count any meeting with at least one other team member
        return teamIds.some((id) => event.participants.includes(id));
    });
    const meetingsWithTeammates = new Set(eventsWithTeammates.map((event) => event.meeting));

    return meetingsWithTeammates.size;
}

export {
    numberOfUserMeetingsDuringWeeks,
    internal as _test,
};
