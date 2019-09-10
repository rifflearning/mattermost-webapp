// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Recommendation, _test} from 'utils/riff/recommendations/recs';

describe('Recommendations Class', () => {
    // default vals for generating test recommendations
    const defaultRecParams = [
        'user',
        1,
        1,
        1,
        () => true,
        'This is a rec!',

        // courseStartTime gets mocked out anyway
        0,

        // a name for the recommendation
        'test',
    ];

    const paramNameToIndex = {
        currentUser: 0,
        startWeek: 1,
        numWeeksToDisplay: 2,
        priority: 3,
        isCompleteFunc: 4,
        displayText: 5,
        startTime: 6,
        name: 7,
    };

    const defaultRec = new Recommendation(...defaultRecParams);

    // quick generator func to make testing easier
    // allows creation of a recommendation with the default values above,
    // except with the specified keyToReplace swapped out for the given value
    // e.g. generateRec('priority', 2) generates a rec with all the above
    // values the same except for priority
    const generateRec = (keyToReplace, val) => {
        const genParams = [...defaultRecParams];
        genParams[paramNameToIndex[keyToReplace]] = val;
        return new Recommendation(...genParams);
    };

    // we need to be able to mock the week number for testing shouldDisplay
    _test.getCurrentWeekNumber = jest.fn();

    it('should calculate if meeting is complete based on provided function', () => {
        expect(defaultRec.isComplete()).toBe(true);
        const incompleteRec = generateRec('isCompleteFunc', () => false);
        expect(incompleteRec.isComplete()).toBe(false);
    });

    it('should calculate whether or not to display properly', () => {
        _test.getCurrentWeekNumber.mockReturnValueOnce(1);
        expect(defaultRec.shouldDisplay()).toBe(true);
        _test.getCurrentWeekNumber.mockReturnValueOnce(2);
        expect(defaultRec.shouldDisplay()).toBe(false);

        const threeWeekRec = generateRec('numWeeksToDisplay', 3);
        _test.getCurrentWeekNumber.mockReturnValueOnce(1);
        expect(threeWeekRec.shouldDisplay()).toBe(true);
        _test.getCurrentWeekNumber.mockReturnValueOnce(2);
        expect(threeWeekRec.shouldDisplay()).toBe(true);
        _test.getCurrentWeekNumber.mockReturnValueOnce(3);
        expect(threeWeekRec.shouldDisplay()).toBe(true);
        _test.getCurrentWeekNumber.mockReturnValueOnce(4);
        expect(threeWeekRec.shouldDisplay()).toBe(false);
    });

    it('should calculate priority correctly', () => {
        // displayPriority is calculated as (startWeek * max_display_num) + priority
        _test.getCurrentWeekNumber.mockReturnValueOnce(1);
        expect(defaultRec.displayPriority()).toBe(4);

        const weekFourRec = generateRec('startWeek', 4);
        expect(weekFourRec.displayPriority()).toBe(13);

        const highPrioRec = generateRec('priority', 3);
        expect(highPrioRec.displayPriority()).toBe(6);
    });

    it('should display given text', () => {
        expect(defaultRec.displayText).toBe(defaultRecParams[paramNameToIndex.displayText]);
        const text = 'This Works!';
        const textRec = generateRec('displayText', text);
        expect(textRec.displayText).toBe(text);
    });
});
