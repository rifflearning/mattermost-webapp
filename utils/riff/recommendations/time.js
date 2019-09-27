// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const DAYS_PER_WEEK = 7;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;
const MILLISECONDS_PER_WEEK = DAYS_PER_WEEK * HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;

const internal = {
    now: Date.now,
};

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
    return courseStartTime + ((weekNum - 1) * MILLISECONDS_PER_WEEK);
}

/**
 * Converts a "week number" to a Date
 *
 * A "week number" indicates which week of the course a user is in
 * e.g. the first week of the course is week 1, second week is week 2, etc.
 *
 * @param {Date} startTime - The start time of the course in milliseconds
 * @param {number} weekNum - the week number to convert
 *
 * @returns {Date} the start of the requested week number
 */
function weekNumToDate(startTime, weekNum) {
    return new Date(startTime.getTime() + ((weekNum - 1) * MILLISECONDS_PER_WEEK));
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
    return getWeekNumber(new Date(courseStartTime), new Date(internal.now()));
}

/* ******************************************************************************
 * getWeekNumber                                                           */ /**
 *
 * Get the number of the week that the given timestamp is in, calculating
 * week 1 as starting at the specified startTime.
 *
 * @param {Date} startTime - start of week 1
 * @param {Date} timestamp - time of interest
 *
 * @returns {number} the week number that the given time is in
 */
function getWeekNumber(startTime, timestamp) {
    const millisSinceStart = timestamp.getTime() - startTime.getTime();
    return Math.ceil((1 + millisSinceStart) / MILLISECONDS_PER_WEEK);
}

export {
    DAYS_PER_WEEK,
    HOURS_PER_DAY,
    MINUTES_PER_HOUR,
    SECONDS_PER_MINUTE,
    MILLISECONDS_PER_SECOND,
    MILLISECONDS_PER_WEEK,
    weekNumToMillis,
    weekNumToDate,
    getWeekNumber,
    getCurrentWeekNumber,
    internal as _test,
};
