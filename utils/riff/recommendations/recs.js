// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getWeekNumber} from 'utils/riff/recommendations/time';

const MAX_REC_DISPLAY_NUMBER = 3;

// FIXME TEMPORARY MEASURE FOR TESTING
// -jr 8.22.2019
const internal = {
    getWeekNumber,
};

/**
 * Represents a recommendation for display in the Riff Dashboard
 */
class Recommendation {
    constructor(currentUser, startWeek, numWeeksToDisplay, priority, isCompleteFunc, displayText) {
        this.currentUser = currentUser; // string
        this.startWeek = startWeek; // int
        this.numWeeksToDisplay = numWeeksToDisplay; // int
        this.priority = priority; // int
        this.isComplete = isCompleteFunc; // function
        this.displayText = displayText; // string
    }

    /**
     * Determine whether the recommendation should be displayed based on
     * whether the current time is within the given range of weeks
     */
    shouldDisplay() {
        const currentWeek = internal.getWeekNumber();
        const endWeek = this.startWeek + this.numWeeksToDisplay;
        return currentWeek >= this.startWeek && currentWeek < endWeek;
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
    internal as _test,
};
