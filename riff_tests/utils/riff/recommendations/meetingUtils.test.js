// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {numberOfUserMeetingsDuringWeeks, _test} from 'utils/riff/recommendations/meetingUtils';
import {weekNumToMillis} from 'utils/riff/recommendations/time';

// TODO - test data
describe('Meeting Utils', () => {
    describe('numberOfUserMeetingsDuringWeeks', () => {
        // a quick helper function to generate participant events
        // so we don't have to write out the whole object every time
        const generateEvent = (meeting, timestamp, participants) => ({
            meeting,
            timestamp,
            participants,
        });

        // for use with mocking return vals from API
        const wrapInPromise = (toWrap) => new Promise((resolve) => resolve({data: toWrap}));

        const userId = 'A';
        const teamIds = ['B', 'C', 'D'];

        // just a timestamp offset so all the timestamps dont happen at exactly the same time
        // it's in milliseconds
        let offset = 10000;

        const startWeek = 1;
        const numWeeks = 1;
        _test.getUserParticipantEvents = jest.fn();

        const eventsMtgWithNoTeammates = [
            generateEvent('mtg-1', weekNumToMillis(1) + offset++, [userId]),
            generateEvent('mtg-1', weekNumToMillis(1) + offset++, [userId, 'not-teammate']),
            generateEvent('mtg-1', weekNumToMillis(1) + offset++, [userId]),
        ];

        it('should handle when the user has been in no meetings with teammates', async () => {
            _test.getUserParticipantEvents.mockReturnValueOnce(wrapInPromise([]));
            let result = await numberOfUserMeetingsDuringWeeks(userId, teamIds, startWeek, numWeeks);
            expect(result).toBe(0);
            _test.getUserParticipantEvents.mockReturnValueOnce(wrapInPromise(eventsMtgWithNoTeammates));
            result = await numberOfUserMeetingsDuringWeeks(userId, teamIds, startWeek, numWeeks);
            expect(result).toBe(0);
        });

        const eventsOneMtgWithOneTeammate = eventsMtgWithNoTeammates.concat([
            generateEvent('mtg-2', weekNumToMillis(1) + offset++, [userId]),
            generateEvent('mtg-2', weekNumToMillis(1) + offset++, [userId, teamIds[1]]),
            generateEvent('mtg-2', weekNumToMillis(1) + offset++, [userId]),
        ]);

        it('should handle when the user has been in exactly one meeting with exactly one teammate', async () => {
            _test.getUserParticipantEvents.mockReturnValueOnce(wrapInPromise(eventsOneMtgWithOneTeammate));
            const result = await numberOfUserMeetingsDuringWeeks(userId, teamIds, startWeek, numWeeks);
            expect(result).toBe(1);
        });

        const eventsOneMtgWithMultipleTeammates = eventsOneMtgWithOneTeammate.concat([
            generateEvent('mtg-2', weekNumToMillis(1) + offset++, [userId]),
            generateEvent('mtg-2', weekNumToMillis(1) + offset++, [userId, teamIds[1], teamIds[2]]),
            generateEvent('mtg-2', weekNumToMillis(1) + offset++, [userId, teamIds[1]]),
            generateEvent('mtg-2', weekNumToMillis(1) + offset++, [userId, teamIds[1], teamIds[3]]),
            generateEvent('mtg-2', weekNumToMillis(1) + offset++, [userId, teamIds[1]]),
            generateEvent('mtg-2', weekNumToMillis(1) + offset++, [userId]),
        ]);

        it('should handle when the user has been in exactly one meeting with more than one teammate', async () => {
            _test.getUserParticipantEvents.mockReturnValueOnce(wrapInPromise(eventsOneMtgWithMultipleTeammates));
            const result = await numberOfUserMeetingsDuringWeeks(userId, teamIds, startWeek, numWeeks);
            expect(result).toBe(1);
        });

        const eventsThreeMtgsWithMutilpleTeammates = eventsOneMtgWithMultipleTeammates.concat([
            generateEvent('mtg-3', weekNumToMillis(1) + offset++, [userId]),
            generateEvent('mtg-3', weekNumToMillis(1) + offset++, [userId, teamIds[1], teamIds[2]]),
            generateEvent('mtg-3', weekNumToMillis(1) + offset++, [userId, teamIds[1]]),
            generateEvent('mtg-4', weekNumToMillis(1) + offset++, [userId, teamIds[1], teamIds[3]]),
            generateEvent('mtg-4', weekNumToMillis(1) + offset++, [userId, teamIds[1]]),
            generateEvent('mtg-4', weekNumToMillis(1) + offset++, [userId]),
        ]);

        it('should handle when the user has been in multiple meetings with more than one teammate', async () => {
            _test.getUserParticipantEvents.mockReturnValueOnce(wrapInPromise(eventsThreeMtgsWithMutilpleTeammates));
            const result = await numberOfUserMeetingsDuringWeeks(userId, teamIds, startWeek, numWeeks);
            expect(result).toBe(3);
        });
    });
});
