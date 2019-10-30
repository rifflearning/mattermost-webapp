// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getGroupChannel, getRecommendations, _test} from 'utils/riff/recommendations';
import {getCurrentWeekNumber} from 'utils/riff/recommendations/time';

const plgGroup = {
    learning_group_prefix: 'plg',
    members: [
        {id: '1'},
        {id: '2'},
        {id: '3'},
        {id: '4'},
    ],
    channel_id: 'channel-plg-test',
};

const capstoneGroup = {
    learning_group_prefix: 'capstone',
    members: [
        {id: '1'},
        {id: '3'},
        {id: '5'},
        {id: '7'},
    ],
    channel_id: 'channel-capstone-test',
};

describe('utils/riff/recommendations/index', () => {
    describe('getGroupChannel', () => {
        const randomGroup = {
            learning_group_prefix: 'useless',
            members: [
                {id: '1'},
                {id: '2'},
                {id: '3'},
                {id: '4'},
            ],
            channel_id: 'unrelated-channel',
        };

        const testGroups = [plgGroup, capstoneGroup, randomGroup];

        it('should handle empty learningGroup being empty', () => {
            expect(getGroupChannel('1', [], 'plg')).toEqual({});
            expect(getGroupChannel('1', [], 'capstone')).toEqual({});
        });

        it('should return the requested learningGroup object based on prefix', () => {
            expect(getGroupChannel('1', testGroups, 'plg').channelId).toEqual(plgGroup.channel_id);
            expect(getGroupChannel('3', testGroups, 'plg').channelId).toEqual(plgGroup.channel_id);

            expect(getGroupChannel('1', testGroups, 'capstone').channelId).toEqual(capstoneGroup.channel_id);
            expect(getGroupChannel('7', testGroups, 'capstone').channelId).toEqual(capstoneGroup.channel_id);
        });

        it('should return an accurate array of teammateIds', () => {
            let teammateIds = ['2', '3', '4'];
            expect(getGroupChannel('1', testGroups, 'plg').teammateIds).toEqual(teammateIds);

            teammateIds = ['1', '3', '4'];
            expect(getGroupChannel('2', testGroups, 'plg').teammateIds).toEqual(teammateIds);

            teammateIds = ['3', '5', '7'];
            expect(getGroupChannel('1', testGroups, 'capstone').teammateIds).toEqual(teammateIds);

            teammateIds = ['1', '5', '7'];
            expect(getGroupChannel('3', testGroups, 'capstone').teammateIds).toEqual(teammateIds);
        });
    });

    describe('getRecommendations', () => {
        // have to mock these since we don't have access to the channel store
        _test.getChannelURL = jest.fn();
        _test.getChannelURL.mockReturnValue('url');

        _test.getTownSquareId = jest.fn();
        _test.getTownSquareId.mockReturnValue('town');

        const millisecondsInAWeek = 604800000;

        // we set our time offset to be in the middle of the week
        // prevents any issues with time passing during the test
        const timeOffset = millisecondsInAWeek / 2;

        // mimic time passing by sending the course start time further
        // back into the past
        const getCourseStartTime = (week) => (Date.now() - timeOffset) - (millisecondsInAWeek * (week - 1));
        const userId = '1';
        const teamId = '2';
        const learningGroups = [plgGroup, capstoneGroup];

        // quick sanity check to make sure we're mocking time correctly
        expect(getCurrentWeekNumber(getCourseStartTime(1))).toEqual(1);
        expect(getCurrentWeekNumber(getCourseStartTime(3))).toEqual(3);

        // generates list of numbers from 1 - 8
        const weekNumbers = [...Array(8).keys()].map((x) => x + 1);
        const recsByWeek = weekNumbers.map((week) => getRecommendations(userId, teamId, learningGroups, getCourseStartTime(week)));

        // TODO - it is currently very difficult to test the isComplete functions since they all
        // rely on the results of calls to external APIs
        // for now we're just testing shouldDisplay
        for (let i = 0; i < recsByWeek.length; i++) {
            it(`should display the recommendations for week ${i} in that week`, () => {
                for (const rec of recsByWeek[i]) {
                    const startWeek = rec.startWeek;
                    const endWeek = rec.startWeek + rec.numWeeksToDisplay;
                    const currentWeek = i + 1;
                    if (startWeek <= currentWeek && currentWeek < endWeek) {
                        expect(rec.shouldDisplay()).toEqual(true);
                    }
                    else {
                        expect(rec.shouldDisplay()).toEqual(false);
                    }
                }
            });
        }
    });
});
