// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {getChannelUrl} from 'utils/riff/recommendations/channelUtils';

function getRecommendations(/* userId */) {
    return [
        {
            id: 1,
            isCompleted: () => {
                return true;
            },
            shouldDisplay: () => {
                return true;
            },
            displayPriority: () => {
                return 20;
            },
            displayText: React.createElement('div', null, 'Hi, you are not very connected with your team :('),
        },
        {
            id: 2,
            isCompleted: () => {
                return false;
            },
            shouldDisplay: () => {
                return false;
            },
            displayPriority: () => {
                return 2;
            },
            displayText: React.createElement('div', null, 'You should really start messaging some people!'),
        },
        {
            id: 3,
            isCompleted: () => {
                return false;
            },
            shouldDisplay: () => {
                return true;
            },
            displayPriority: () => {
                return 3;
            },
            displayText: React.createElement('div', null, 'Schedule a Riff video call with your team for your upcoming group work.'),
        },
        {
            id: 4,
            isCompleted: () => {
                return false;
            },
            shouldDisplay: () => {
                return true;
            },
            displayPriority: () => {
                return 4;
            },
            displayText: React.createElement('div', null, 'Do some more stuff.'),
        },
        {
            id: 5,
            isCompleted: () => {
                return false;
            },
            shouldDisplay: () => {
                return true;
            },
            displayPriority: () => {
                return 5;
            },
            displayText: React.createElement('div', null,
                React.createElement('span', null, 'Reach out to other learners in the course to build your network. '),
                React.createElement('a', {href: getChannelUrl('wqqscqq61pyn8f7op99t13goew')}, 'Town Square'),
                React.createElement('span', null, ' is a great place to start.'),
            ),
        },
    ];
}

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    getRecommendations,
};
