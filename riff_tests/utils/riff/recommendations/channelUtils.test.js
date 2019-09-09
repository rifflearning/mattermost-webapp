// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

//import didUserPostInChannel from 'utils/riff/recommendations/channelUtils'
import {_test, didUserPostInChannel, getChannelURL} from 'utils/riff/recommendations/channelUtils';

describe('Riff Recommendation Channel Utils', () => {
    const uid = 'abcUserID';
    const cid = 'xyzChannelID';
    const targetPost = {prop1: 'v1', user_id: uid, type: ''};
    const otherPost = {prop1: 'v1', user_id: 'otherID', type: ''};
    const channelJoinPost = {prop1: 'v1', user_id: uid, type: 'join'};

    const targetChannel = {id: 'abcd123', name: 'plgchan'};
    const otherChannel = {id: '123abcd', name: 'otherchan'};
    const currentTeam = {id: 'xyz456', name: 'riffTeam'};
    const otherTeam = {id: 'lmp789', name: 'otherTeam'};

    _test.getAllPostsFromChannel = jest.fn();
    _test.TeamStore = {entities: {currentTeamId: currentTeam.id, teams: {xyz456: currentTeam, lmp789: otherTeam}}};

    describe('getChannelURL', () => {
        _test.ChannelStore = {entities: {channels: {abcd123: targetChannel, '123abcd': otherChannel}}};
        it('Normal channel.', () => {
            expect(getChannelURL(targetChannel.id)).toBe('/riffTeam/channels/plgchan');
        });
        _test.ChannelStore = {entities: {channels: {'123abcd': otherChannel}}};
        it('Channel not present: ', () => {
            expect(() => {
                getChannelURL('5');
            }).toThrow(Error);
        });
        _test.ChannelStore = {entities: {channels: {}}};
        it('No channels at all.', () => {
            expect(getChannelURL(targetChannel.id)).toBe('/riffTeam/channels/plgchan');
        });
        _test.ChannelStore = {entities: {channels: {abcd123: targetChannel, '123abcd': targetChannel}}};
        it('Two channels with same name.', () => {
            expect(getChannelURL(targetChannel.id)).toBe('/riffTeam/channels/plgchan');
        });
    });

    describe('didUserPostInChannel', () => {
        let mockPosts = [targetPost, otherPost];
        _test.getAllPostsFromChannel.mockReturnValueOnce(mockPosts);
        it('user did post once', async (done) => {
            const didPost = await didUserPostInChannel(uid, cid);
            expect(didPost).toBe(true);
            done();
        });

        mockPosts = [otherPost, otherPost];
        _test.getAllPostsFromChannel.mockReturnValueOnce(mockPosts);
        it('user did not post', async (done) => {
            const didPost = await didUserPostInChannel(uid, cid);
            expect(didPost).toBe(false);
            done();
        });

        mockPosts = [targetPost, targetPost];
        _test.getAllPostsFromChannel.mockReturnValueOnce(mockPosts);
        it('user posted more than once.', async (done) => {
            const didPost = await didUserPostInChannel(uid, cid);
            expect(didPost).toBe(true);
            done();
        });

        mockPosts = [];
        _test.getAllPostsFromChannel.mockReturnValueOnce(mockPosts);
        it('empty posts', async (done) => {
            const didPost = await didUserPostInChannel(uid, cid);
            expect(didPost).toBe(false);
            done();
        });

        mockPosts = [channelJoinPost];
        _test.getAllPostsFromChannel.mockReturnValueOnce(mockPosts);
        it('Only join events', async (done) => {
            const didPost = await didUserPostInChannel(uid, cid);
            expect(didPost).toBe(false);
            done();
        });

        mockPosts = [channelJoinPost, targetPost];
        _test.getAllPostsFromChannel.mockReturnValueOnce(mockPosts);
        it('Join & regular post', async (done) => {
            const didPost = await didUserPostInChannel(uid, cid);
            expect(didPost).toBe(true);
            done();
        });
    });
});
