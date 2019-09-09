// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getCurrentWeekNumber} from './time';

//The maximum number of recommendations that will be displayed at once.
const MAX_REC_DISPLAY_NUMBER = 3;

// FIXME TEMPORARY MEASURE FOR TESTING
// -jr 8.22.2019
const internal = {
    getCurrentWeekNumber,
};

/* ******************************************************************************
 * Recommendation                                                          */ /**
 *
 * A Recommendation describes some action the user should take because Riff
 * believes it will enhance their performance (e.g. make the meetings they attend
 * more productive, help them do better in a course...) based on information known
 * at the current time (such as if the user has had a riff video meeting, or how
 * many interactions in various channels they've had).
 *
 ********************************************************************************/
class Recommendation {
    /**
     * Constructor to initialize a recommendation
     *
     * @param {string} currentUser - The id of the current user.
     * @param {number} startWeek - The week number (1-indexed) when this Recommendation
     *      should first be displayed.
     * @param {number} numWeeksToDisplay - The total number of weeks, including the
     *      first one, to display the Recommendation.
     * @param {number} priority - The relative priority this Rec. should be displayed in
     *      (bigger = higher on page).
     * @param {function(): Promise<bool>} isComplete - Async function resolving to true
     *      if the Rec. should be marked as completed, false otherwise.
     * @param {string | ReactElement} displayText - The text displayed to the user
     *      regarding this Rec. May be a string or a react element
     * @param {number} courseStartTime - The start time of the course, in milliseconds
     *      since the Unix epoch start, local timezone.
     */
    constructor(currentUser, startWeek, numWeeksToDisplay, priority, isCompleteFunc, displayText, courseStartTime, name) {
        /** The id of the current user.
         *  @type {string}
         */
        this.currentUser = currentUser;

        /** The week number (1-indexed) when this Recommendation should first be displayed.
         *  @type {number}
         */
        this.startWeek = startWeek;

        /** The total number of weeks, including the first one, to display the Recommendation.
         *  @type {number}
         */
        this.numWeeksToDisplay = numWeeksToDisplay;

        /** The relative priority this Rec. should be displayed in (bigger = higher on page).
         *  @type {number}
         */
        this.priority = priority;

        /** Async function resolving to true if the Rec. should be marked as completed, false otherwise.
         *  @type {function(): Promise<bool>}
         */
        this.isComplete = isCompleteFunc;

        /** The text displayed to the user regarding this Rec. May be a string or a react element
         *  @type {string | ReactElement}
         */
        this.displayText = displayText;

        /** The start time of the course, in milliseconds since the Unix epoch start, local timezone.
         *  @type {number}
         */
        this.courseStartTime = courseStartTime;

        /** Short descriptive text describing this recommendation
         *  @type {string}
         */
        this.name = name;
    }

    /**
     * Determine whether the recommendation should be displayed based on
     * whether the current time is within the given range of weeks
     */
    shouldDisplay() {
        const currentWeek = internal.getCurrentWeekNumber(this.courseStartTime);
        const endWeek = this.startWeek + this.numWeeksToDisplay;
        return this.startWeek <= currentWeek && currentWeek < endWeek;
    }

    /**
     * Calculate the relative priority of this recommendation
     * based on the week it should be displayed and the provided
     * priority number
     *
     */
    displayPriority() {
        return (this.startWeek * MAX_REC_DISPLAY_NUMBER) + this.priority;
    }
}

export {
    Recommendation,
    MAX_REC_DISPLAY_NUMBER,
    internal as _test,
};
