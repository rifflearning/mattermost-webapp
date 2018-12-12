import {joinChannel, getChannelByNameAndTeamName, markGroupChannelOpen} from 'mattermost-redux/actions/channels';
import {getUser, getUserByUsername, getUserByEmail} from 'mattermost-redux/actions/users';
import {getTeamByName} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId, getUserByUsername as selectUserByUsername, getUser as selectUser} from 'mattermost-redux/selectors/entities/users';
import {getCurrentChannelId, getChannelByName, getOtherChannels, getChannel, getChannelsNameMapInTeam} from 'mattermost-redux/selectors/entities/channels';
import * as WebRtcActions from '../../../actions/webrtc_actions';

import {Constants} from 'utils/constants.jsx';
import {openDirectChannelToUser} from 'actions/channel_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import * as Utils from 'utils/utils.jsx';

const LENGTH_OF_ID = 26;
const LENGTH_OF_GROUP_ID = 40;
const LENGTH_OF_USER_ID_PAIR = 54;

export function onWebRtcByIdentifierEnter({match, history}) {
    return (dispatch, getState) => {
        const state = getState();
        const {path, identifier, team, videoId} = match.params;

        if (!getTeamByName(state, team)) {
            return;
        }

        // always first check if its an ID or a name.
        // webrtc rooms are always made with channel names, not ids.
        if (identifier.length == LENGTH_OF_ID || identifier.length == LENGTH_OF_USER_ID_PAIR || identifier.length == LENGTH_OF_GROUP_ID) {
            dispatch(goToVideoByChannelIdentifier(match, history));
        } else {
            const channelsByName = getChannelByName(state, identifier);
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
    }
};

export function goToVideoByChannelIdentifier(match, history) {
    return async (dispatch, getState) => {
        const state = getState();
        const {team, identifier, videoId} = match.params;
        const channelId = identifier.toLowerCase();

        console.log("channelId:", channelId);
        console.log("match:", match.params);

        let channel = getChannel(state, channelId) || getChannelByName(state, channelId);
        const teamObj = getTeamByName(state, team);

        console.log("got channel object", channel);

        if (!teamObj) {
            //TODO: not a team???
            return;
        }

        if (!channel) {
            //TODO: error, cant join a video for a channel that doesnt exist.
            console.log("cant join video for channel that doesnt exist.");
        }

        dispatch(WebRtcActions.joinWebRtcRoom(channel.name, team, videoId));
    };
};



export function goToVideoByChannelName(match, history) {
    return async (dispatch, getState) => {
        const state = getState();
        const {team, identifier, videoId} = match.params;
        const channelName = identifier.toLowerCase();

        console.log("channel name:", channelName);
        console.log("match:", match.params);

        const teamObj = getTeamByName(state, team);
        if (!teamObj) {
            return;
        }

        let channel = getChannelsNameMapInTeam(state, teamObj.id)[channelName];

        if (!channel) {
            //TODO: error, cant join a video for a channel that doesnt exist.
            console.log("cant join video for channel that doesnt exist.")
        }

        dispatch(WebRtcActions.joinWebRtcRoom(channel.name, team, videoId));
    };
};
