// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export const stateShim = {
    user: {
        email: null,
        uid: 'U9E20cskz8eiI9tC7EnzaU0gXO23',
        verified: null,
    },
    riff: {
        meetingId: null,
        authToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6ImFjY2VzcyJ9.eyJ1c2VySWQiOiI1Yjg4MWIyNjZlMjk5ODAwMGY4YmI0NzgiLCJpYXQiOjE1NDAzMzExMTUsImV4cCI6MTU0MDQxNzUxNSwiYXVkIjoiaHR0cHM6Ly95b3VyZG9tYWluLmNvbSIsImlzcyI6ImZlYXRoZXJzIiwic3ViIjoiYW5vbnltb3VzIiwianRpIjoiNWI5NmIwOGYtMTYxNC00MDYxLWFhNzUtNTQ0NDliMjBkNDY2In0.YrDuEBJT6qzjEjE39mpSmaSc0q3_ENw6ECWKuHLgdZg',
        authError: null,
        participants: [],
        turns: [],
        transitions: [],
    },
    riffAuthToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6ImFjY2VzcyJ9.eyJ1c2VySWQiOiI1Yjg4MWIyNjZlMjk5ODAwMGY4YmI0NzgiLCJpYXQiOjE1NDAzMzExMTUsImV4cCI6MTU0MDQxNzUxNSwiYXVkIjoiaHR0cHM6Ly95b3VyZG9tYWluLmNvbSIsImlzcyI6ImZlYXRoZXJzIiwic3ViIjoiYW5vbnltb3VzIiwianRpIjoiNWI5NmIwOGYtMTYxNC00MDYxLWFhNzUtNTQ0NDliMjBkNDY2In0.YrDuEBJT6qzjEjE39mpSmaSc0q3_ENw6ECWKuHLgdZg',
    meetings: [
        {
            _id: 'welcome-1',
            participants: [],
            room: 'welcome',
            active: false,
            meetingUrl: 'welcome',
            startTime: '2018-10-18T16:46:36.743Z',
            __v: 0,
            endTime: '2018-10-18T17:18:08.593Z',
        },
        {
            _id: 'react-1',
            participants: [],
            room: 'react',
            active: false,
            meetingUrl: 'react',
            startTime: '2018-10-16T12:45:18.590Z',
            __v: 0,
            endTime: '2018-10-16T13:16:19.978Z',
        },
    ],
    numMeetings: 3,
    fetchMeetingsStatus: 'loaded',
    fetchMeetingsMessage: null,
    lastFetched: '2018-10-23T21:45:15.810Z',
    shouldFetch: false,
    selectedMeeting: {
        _id: 'react-1',
        participants: [],
        room: 'react',
        active: false,
        meetingUrl: 'react',
        startTime: '2018-10-16T12:45:18.590Z',
        __v: 0,
        endTime: '2018-10-16T13:16:19.978Z',
    },
    processedUtterances: [
        {
            participantId: 'lRVjzZiEQxMUMlrE503W6PhUAi03',
            lengthUtterances: 365.12100000000015,
            numUtterances: 260,
            meanLengthUtterances: 1.404311538461539,
            meetingId: 'react-1',
            name: 'Dan',
        },
        {
            participantId: 'U9E20cskz8eiI9tC7EnzaU0gXO23',
            lengthUtterances: 216.58200000000008,
            numUtterances: 250,
            meanLengthUtterances: 0.8663280000000003,
            meetingId: 'react-1',
            name: 'Ryan Joyner',
        },
        {
            participantId: 'ufgeRgJfO8byPt6oFxtnIKntMhm1',
            lengthUtterances: 402.1169999999999,
            numUtterances: 259,
            meanLengthUtterances: 1.5525752895752891,
            meetingId: 'react-1',
            name: 'Beth',
        },
        {
            participantId: 'V4Kc1uN0pgP7oVhaDjcmp6swV2F3',
            lengthUtterances: 149.36500000000004,
            numUtterances: 113,
            meanLengthUtterances: 1.3218141592920358,
            meetingId: 'react-1',
            name: 'Mike',
        },
    ],
    processedNetwork: null,
    processedTimeline: null,
    statsStatus: 'loaded',
};
