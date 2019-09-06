// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getUserByName} from 'actions/user_actions';

const millisecondsInAWeek = 604800000;
const courseStartTimeUsername = 'timelord';

/**
 * Get the start time of the course.
 *
 * @returns The start time of the course in milliseconds since the start of the
 *     Unix epoch, or 0 (start of unix epoch) if the course has not yet started.
 *
 * TODO: This function is a hack. Course start time is measured from the creation time
 *     of the user with name matching courseStartTimeUsername, which is a hard-coded
 *     module-specific constant. This should be moved to config at some point...
 */
function getCourseStartTime() {
    const timeLord = getUserByName(courseStartTimeUsername);
    if (timeLord === null) {
        return 0;
    }
    return timeLord.createAt;
}

/**
 * Converts a "week number" to a timestamp in milliseconds
 *
 * A "week number" indicates which week of the course a user is in
 * e.g. the first week of the course is week 1, second week is week 2, etc.
 *
 * @weekNum the week number to convert
 * @returns the start of the week as an epoch timestamp (ms)
 *
 */
function weekNumToMillis(weekNum) {
    return getCourseStartTime() + ((weekNum - 1) * millisecondsInAWeek);
}

function getWeekNumber() {
    const millisSinceCourseStart = Date.now() - getCourseStartTime();
    return Math.ceil(millisSinceCourseStart / millisecondsInAWeek);
}

export {
    weekNumToMillis,
    getWeekNumber,
    getCourseStartTime,
};
