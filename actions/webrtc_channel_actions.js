// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" } }],
    "react/jsx-max-props-per-line": ["error", { "when": "multiline" }],
    "no-underscore-dangle": ["error", { "allow": [ "_id" ] }],
 */

import {getTimestamp} from 'utils/utils.jsx';
import {emitUserPostedEvent, postListScrollChangeToBottom} from 'actions/global_actions';
import {createPost} from 'actions/post_actions';

export const sendWebRtcMessage = (currentChannelId, userId, webRtcLink, /*teamName*/) => (/*dispatch*/) => {
    const time = getTimestamp();

    const post = {
        message: `I started a Riff meeting! Join here: ${webRtcLink}`,
        channel_id: currentChannelId,
        pending_post_id: `${userId}:${time}`,
        create_at: time,
    };

    emitUserPostedEvent(post);
    createPost(post, []);
    postListScrollChangeToBottom();
};
