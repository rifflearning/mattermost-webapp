// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getAllPostsFromChannel} from 'actions/post_actions.jsx';
import TeamStore from 'stores/team_store.jsx';
import ChannelStore from 'stores/channel_store.jsx';

/** All internal functions and variables should be defined and used from this
 *  internal object to allow mocking in unit tests
 */
const internal = {
    getAllPostsFromChannel,
};

/**
 * Determins whether a particular user has posted in a channel or not.
 *
 * @userId: The id of the user.
 * @channelId: The id of the channel.
 * @returns true iff userId posted in channelId
 */
function didUserPostInChannel(userId, channelId) {
    const postsArray = internal.getAllPostsFromChannel(channelId);
    return postsArray.filter((post) => post.user_id === userId).length > 0;
}

/**
 * Determines the relative URL for a channel
 *
 * @targetChannelId: The id of the channel
 * @returns the url
 */
export function getChannelUrl(targetChannelId) {
    let {currentTeamName, channelName} = '';

    Object.keys(TeamStore.entities.teams).forEach((teamId) => {
        if (teamId === TeamStore.entities.currentTeamId) {
            currentTeamName = TeamStore.entities.teams[teamId].name;
        }
    });

    Object.keys(ChannelStore.entities.channels).forEach((channelId) => {
        if (channelId === targetChannelId) {
            channelName = ChannelStore.entities.channels[channelId].name;
        }
    });

    return `/${currentTeamName}/channels/${channelName}`;
}

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    didUserPostInChannel,
    internal as _test,
};
