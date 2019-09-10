// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getAllPostsFromChannel} from 'actions/post_actions.jsx';

// TODO: Don't use these stores, use the mattermost-redux selectors and pass in the
// redux state. Such as import {getChannelsInTeam} from 'mattermost-redux/selectors/entities/channels';
// -mjl 2019-09-09
import TeamStore from 'stores/team_store.jsx';
import ChannelStore from 'stores/channel_store.jsx';

/** All internal functions and variables should be defined and used from this
 *  internal object to allow mocking in unit tests
 */
const internal = {
    getAllPostsFromChannel,
    TeamStore,
    ChannelStore,
};

/**
 * Determines whether a particular user has posted in a channel or not.
 *
 * @param {string} userId - The id of the user.
 * @param {string} channelId - The id of the channel.
 *
 * @returns {bool} true if userId posted in channelId
 */
async function didUserPostInChannel(userId, channelId) {
    const postsInChannel = await internal.getAllPostsFromChannel(channelId);

    // for user-posted posts, the type is empty. for system-posted posts, it is
    // populated. we want to make sure we're not counting system-posted messages
    return postsInChannel.some((post) => post.type === '' && post.user_id === userId);
}

/**
 * Determines the relative URL of the given channel
 *
 * @param {string} targetChannelId - The id of the channel
 *
 * @returns {string} the url
 */
function getChannelURL(targetChannelId) {
    if (!(targetChannelId in internal.ChannelStore.entities.channels)) {
        throw new Error(`${targetChannelId} does not exist.`);
    }

    const currentTeamName = internal.TeamStore.entities.teams[internal.TeamStore.entities.currentTeamId].name;
    const channelName = internal.ChannelStore.entities.channels[targetChannelId].name;

    return `/${currentTeamName}/channels/${channelName}`;
}

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    didUserPostInChannel,
    getChannelURL,
    internal as _test,
};
