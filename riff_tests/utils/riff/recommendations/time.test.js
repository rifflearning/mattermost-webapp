// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {_test, getCourseStartTime, weekNumToMillis, getCurrentWeekNumber} from 'utils/riff/recommendations/time';

describe('Riff Recommendations Time Utility', () => {
    const mockTimelord = {create_at: 10};
    _test.getUserByName = jest.fn();

    describe('getCourseStartTime tests:', () => {
        _test.getUserByName.mockReturnValueOnce(mockTimelord);
        it('Returns timelord\'s creation time:', async (done) => {
            const result = await getCourseStartTime();
            expect(result).toBe(10);
            done();
        });
        _test.getUserByName.mockReturnValueOnce(null);
        it('Returns 0 if timelord does not exist:', async (done) => {
            const result = await getCourseStartTime();
            expect(result).toBe(0);
            done();
        });
    });

    describe('weekNumToMillis tests:', () => {
        //Note: no week 0, week numbers indexed starting at 1.
        it('Course just started:', () => {
            expect(weekNumToMillis(1, 5)).toBe(5);
        });
        it('Week 2:', () => {
            expect(weekNumToMillis(2, 5)).toBe(5 + _test.millisecondsInAWeek);
        });
        it('Week 8:', () => {
            expect(weekNumToMillis(8, 5)).toBe(5 + (7 * _test.millisecondsInAWeek));
        });
        it('Week 11:', () => {
            expect(weekNumToMillis(11, 5)).toBe(5 + (10 * _test.millisecondsInAWeek));
        });
    });

    describe('getCurrentWeekNumber tests:', () => {
        _test.now = jest.fn();
        _test.now.mockReturnValueOnce(5);
        it('Course just started this millisecond:', () => {
            expect(getCurrentWeekNumber(5)).toBe(1);
        });
        _test.now.mockReturnValueOnce(0.5 * _test.millisecondsInAWeek);
        it('Middle of week 1:', () => {
            expect(getCurrentWeekNumber(0)).toBe(1);
        });
        _test.now.mockReturnValueOnce(_test.millisecondsInAWeek);
        it('Alternate middle of week 1:', () => {
            expect(getCurrentWeekNumber(0.5 * _test.millisecondsInAWeek)).toBe(1);
        });
        _test.now.mockReturnValueOnce(_test.millisecondsInAWeek);
        it('Week 1 completed:', () => {
            expect(getCurrentWeekNumber(0)).toBe(2);
        });
        _test.now.mockReturnValueOnce(3.5 * _test.millisecondsInAWeek);
        it('Middle of week 4:', () => {
            expect(getCurrentWeekNumber(0)).toBe(4);
        });
        _test.now.mockReturnValueOnce(4 * _test.millisecondsInAWeek);
        it('Alternate middle of week 4:', () => {
            expect(getCurrentWeekNumber(0.5 * _test.millisecondsInAWeek)).toBe(4);
        });
        _test.now.mockReturnValueOnce(4 * _test.millisecondsInAWeek);
        it('Week 4 completed:', () => {
            expect(getCurrentWeekNumber(0)).toBe(5);
        });
    });
});
