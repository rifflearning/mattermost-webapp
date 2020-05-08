// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {
    _test,
    MILLISECONDS_PER_WEEK,
    weekNumToDate,
    weekNumToMillis,
    getCurrentWeekNumber,
} from 'utils/riff/recommendations/time';

describe('Riff Recommendations Time Utility', () => {
    describe('weekNumToDate', () => {
        const startTime = new Date(2019, 7, 30, 11, 2, 21);

        //Note: no week 0, week numbers indexed starting at 1.
        it('should return the start time for week 1', () => {
            expect(weekNumToDate(startTime, 1)).toStrictEqual(startTime);
        });
        it('should return a date exactly 1 week after the start', () => {
            expect(weekNumToDate(startTime, 2)).toStrictEqual(new Date(startTime.getTime() + MILLISECONDS_PER_WEEK));
        });
        it('should return a date exactly 7 weeks after the start', () => {
            expect(weekNumToDate(startTime, 8)).toStrictEqual(new Date(startTime.getTime() + (7 * MILLISECONDS_PER_WEEK)));
        });
        it('should return a date exactly 11 weeks after the start', () => {
            expect(weekNumToDate(startTime, 11)).toStrictEqual(new Date(startTime.getTime() + (10 * MILLISECONDS_PER_WEEK)));
        });
        it.skip('should log an error and return the start time for a negative week number', () => {
            // Not sure yet how to test log messages, and this expectation isn't implemented
            // and I'm not sure if it is actually what we'd want.
            expect('Not tested').toBe('tested');
            expect(weekNumToDate(startTime, -1)).toStrictEqual(startTime);
        });
        it.skip('should log an error and return the start time for a week number that is not an integer', () => {
            // Not sure yet how to test log messages, and this expectation isn't implemented
            // and I'm not sure if it is actually what we'd want.
            expect('Not tested').toBe('tested');
            expect(weekNumToDate(startTime, -1)).toStrictEqual(startTime);
        });
    });

    describe('weekNumToMillis tests:', () => {
        //Note: no week 0, week numbers indexed starting at 1.
        it('Course just started:', () => {
            expect(weekNumToMillis(1, 5)).toBe(5);
        });
        it('Week 2:', () => {
            expect(weekNumToMillis(2, 5)).toBe(5 + MILLISECONDS_PER_WEEK);
        });
        it('Week 8:', () => {
            expect(weekNumToMillis(8, 5)).toBe(5 + (7 * MILLISECONDS_PER_WEEK));
        });
        it('Week 11:', () => {
            expect(weekNumToMillis(11, 5)).toBe(5 + (10 * MILLISECONDS_PER_WEEK));
        });
    });

    describe('getCurrentWeekNumber tests:', () => {
        _test.now = jest.fn();
        _test.now.mockReturnValueOnce(5);
        it('Course just started this millisecond:', () => {
            expect(getCurrentWeekNumber(5)).toBe(1);
        });
        _test.now.mockReturnValueOnce(0.5 * MILLISECONDS_PER_WEEK);
        it('Middle of week 1:', () => {
            expect(getCurrentWeekNumber(0)).toBe(1);
        });
        _test.now.mockReturnValueOnce(MILLISECONDS_PER_WEEK);
        it('Alternate middle of week 1:', () => {
            expect(getCurrentWeekNumber(0.5 * MILLISECONDS_PER_WEEK)).toBe(1);
        });
        _test.now.mockReturnValueOnce(MILLISECONDS_PER_WEEK);
        it('Week 1 completed:', () => {
            expect(getCurrentWeekNumber(0)).toBe(2);
        });
        _test.now.mockReturnValueOnce(3.5 * MILLISECONDS_PER_WEEK);
        it('Middle of week 4:', () => {
            expect(getCurrentWeekNumber(0)).toBe(4);
        });
        _test.now.mockReturnValueOnce(4 * MILLISECONDS_PER_WEEK);
        it('Alternate middle of week 4:', () => {
            expect(getCurrentWeekNumber(0.5 * MILLISECONDS_PER_WEEK)).toBe(4);
        });
        _test.now.mockReturnValueOnce(4 * MILLISECONDS_PER_WEEK);
        it('Week 4 completed:', () => {
            expect(getCurrentWeekNumber(0)).toBe(5);
        });
    });
});
