import {getTimestamp} from 'utils/utils.jsx';
import {emitUserPostedEvent, postListScrollChangeToBottom} from 'actions/global_actions';
import {createPost} from 'actions/post_actions';
import {app, socket} from 'utils/riff';


export const sendWebRtcMessage = (currentChannelId, userId, webRtcLink, teamName) => (dispatch) => {
    const time = getTimestamp();
    console.log("teamName:", teamName)

    const fullLink = window.location.href.split(teamName)[0] + webRtcLink;
    let post = {
        message: "I started a webrtc chat! Join here: " + fullLink,
        channel_id: currentChannelId,
        pending_post_id: `${userId}:${time}`,
        create_at: time,
    };
    emitUserPostedEvent(post);
    createPost(post,[]);
    postListScrollChangeToBottom();
};
