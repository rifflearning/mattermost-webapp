// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" } }],
    "react/jsx-max-props-per-line": ["error", { "when": "multiline" }],
    "no-underscore-dangle": ["error", { "allow": [ "_id" ] }],
 */

// TODO: These are action creators, so this file defining them doesn't belong in components
//       and should be moved. -mjl 2019-08-20

import {getTeamByName} from 'mattermost-redux/selectors/entities/teams';
import {
    getChannelByName,
    getChannel,
    getChannelsNameMapInCurrentTeam,
} from 'mattermost-redux/selectors/entities/channels';

import * as WebRtcActions from 'actions/webrtc_actions';
import {logger} from 'utils/riff';

const LENGTH_OF_ID = 26;
const LENGTH_OF_GROUP_ID = 40;
const LENGTH_OF_USER_ID_PAIR = 54;

export function onWebRtcByIdentifierEnter({match, history}) {
    return (dispatch, getState) => {
        const state = getState();
        const {identifier, team} = match.params;

        if (!getTeamByName(state, team)) {
            return;
        }

        // always first check if its an ID or a name.
        if (identifier.length === LENGTH_OF_ID ||
            identifier.length === LENGTH_OF_USER_ID_PAIR ||
            identifier.length === LENGTH_OF_GROUP_ID) {
            dispatch(goToVideoByChannelIdentifier(match, history));
        } else {
            dispatch(goToVideoByChannelName(match, history));
        }

        //TODO: we can implement more advanced logic, see channel_identifier_router
        // if (identifier.length === LENGTH_OF_ID) {
        //     // if it's a channel we can identify easily
        //     if (channelsByName || moreChannelsByName) {
        //         dispatch(goToVideoByChannelName(match, history));
        //     } else {
        //         dispatch(goToVideoByChannelId(match, history));
        //     }
        // } else if (identifier.indexOf('@') === 0) {
        //     // direct message
        // }
        // } else if (identifier.length === LENGTH_OF_GROUP_ID) {
        //     dispatch(goToGroupChannelByGroupId(match, history));
        // } else if (identifier.length === LENGTH_OF_USER_ID_PAIR) {
        //     dispatch(goToDirectChannelByUserIds(match, history));
        // }
    };
}

export function goToVideoByChannelIdentifier(match, /*history*/) {
    return async (dispatch, getState) => {
        const state = getState();
        const {team, identifier, videoId} = match.params;
        const channelId = identifier.toLowerCase();

        logger.debug('channelId:', channelId);
        logger.debug('match:', match.params);

        const channel = getChannel(state, channelId) || getChannelByName(state, channelId);
        const teamObj = getTeamByName(state, team);

        logger.debug('got channel object', channel);

        if (!teamObj) {
            //TODO: not a team???
            return;
        }

        if (!channel) {
            //TODO: error, cant join a video for a channel that doesnt exist.
            logger.error('cant join video for channel that doesnt exist.');
        }

        dispatch(WebRtcActions.joinWebRtcRoom(channelId, team, videoId));
    };
}

export function goToVideoByChannelName(match, /*history*/) {
    return async (dispatch, getState) => {
        const state = getState();
        const {team, identifier, videoId} = match.params;
        const channelName = identifier.toLowerCase();

        const teamObj = getTeamByName(state, team);
        if (!teamObj) {
            return;
        }

        const channel = getChannelsNameMapInCurrentTeam(state)[channelName];

        if (!channel) {
            //TODO: error, cant join a video for a channel that doesnt exist.
            logger.error('cant join video for channel that doesnt exist.');
        }

        const channelIdentifier = channel ? channel.name : channelName;

        dispatch(WebRtcActions.joinWebRtcRoom(channelIdentifier, team, videoId));
    };
}
