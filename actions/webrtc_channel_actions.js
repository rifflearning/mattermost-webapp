import {getTimestamp} from 'utils/utils.jsx';
import {emitUserPostedEvent, postListScrollChangeToBottom} from 'actions/global_actions';
import {createPost} from 'actions/post_actions';
import {app, socket} from 'utils/riff';
import parse from 'url-parse';


export const sendWebRtcMessage = (currentChannelId, userId, webRtcLink, teamName) => (dispatch) => {
    const time = getTimestamp();

    let post = {
        message: "I started a Riff meeting! Join here: " + webRtcLink,
        channel_id: currentChannelId,
        pending_post_id: `${userId}:${time}`,
        create_at: time,
    };
    emitUserPostedEvent(post);
    createPost(post,[]);
    postListScrollChangeToBottom();
};
