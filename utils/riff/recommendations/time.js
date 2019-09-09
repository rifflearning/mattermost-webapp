// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getUserByName} from 'actions/user_actions';

const DAYS_PER_WEEK = 7;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;

const millisecondsInAWeek = DAYS_PER_WEEK * HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;
const courseStartTimeUsername = 'timelord';

const internal = {
    getUserByName,
    millisecondsInAWeek,
    now: Date.now,
};

/**
 * Get the start time of the course.
 *
 * TODO: This function is a hack. Course start time is measured from the creation time
 *     of the user with name matching courseStartTimeUsername, which is a hard-coded
 *     module-specific constant. This should be moved to config at some point...
 * FIXME: If an instance has two teams, they will share the same timelord, and thus,
 *        the same start time. This would not be desired behavior.
 *
 * @returns {number} The start time of the course in milliseconds since the start of the
 *     Unix epoch, or 0 (start of unix epoch) if the course has not yet started.
 */
async function getCourseStartTime() {
    const timeLord = await internal.getUserByName(courseStartTimeUsername);
    if (timeLord === null) {
        return 0;
    }
    return timeLord.create_at;
}

/**
 * Converts a "week number" to a timestamp in milliseconds
 *
 * A "week number" indicates which week of the course a user is in
 * e.g. the first week of the course is week 1, second week is week 2, etc.
 *
 * @param {number} weekNum - the week number to convert
 * @param {number} courseStartTime - The start time of the course in milliseconds
 *      since the unix epoch, local time.
 *
 * @returns {number} the start of the week as an epoch timestamp (ms)
 */
function weekNumToMillis(weekNum, courseStartTime) {
    return courseStartTime + ((weekNum - 1) * millisecondsInAWeek);
}

/**
 * Get the current week number (1-indexed), relative to the course start time.
 *
 * @param {number} courseStartTime - The start time of the course in milliseconds
 *      since the unix epoch, local time.
 *
 * @returns {number} One more than the number of complete weeks elapsed since
 *      the course start (i.e. the 'week number').
 */
function getCurrentWeekNumber(courseStartTime) {
    const millisSinceCourseStart = internal.now() - courseStartTime;
    return Math.ceil((1 + millisSinceCourseStart) / millisecondsInAWeek);
}

export {
    weekNumToMillis,
    getCurrentWeekNumber,
    getCourseStartTime,
    internal as _test,
};
