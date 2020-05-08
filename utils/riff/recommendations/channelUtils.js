// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getAllPostsFromChannel} from 'actions/post_actions.jsx';

/** All internal functions and variables should be defined and used from this
 *  internal object to allow mocking in unit tests
 */
const internal = {
    getAllPostsFromChannel,
};

/**
 * Determines whether a particular user has posted in a channel or not.
 *
 * TODO: use searchPost (or searchPostWithParams)
 *      {"terms":"from:mike_admin in:plg-195 ","include_deleted_channels":false,"time_zone_offset":-14400}
 *
 * @param {string} userId - The id of the user.
 * @param {string} channelId - The id of the channel.
 *
 * @returns {Promise<bool>} true if userId posted in channelId
 */
async function didUserPostInChannel(userId, channelId) {
    const postsInChannel = await internal.getAllPostsFromChannel(channelId);

    // for user-posted posts, the type is empty. for system-posted posts, it is
    // populated. we want to make sure we're not counting system-posted messages
    return postsInChannel.some((post) => post.type === '' && post.user_id === userId);
}

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    didUserPostInChannel,
    internal as _test,
};
