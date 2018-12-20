import { createSelector } from 'reselect';
import { getCurrentTeam } from 'mattermost-redux/selectors/entities/teams';
import { getChannel } from 'mattermost-redux/selectors/entities/channels';
import { createWebRtcLink } from 'utils/webrtc/webrtc';

const getChannelName = (state, ownProps) => {
    let channel = getChannel(state, ownProps.channelId);
    return channel ? channel.name : {};
};

export const getWebRtcLink = createSelector(
    [getCurrentTeam, getChannelName],
    (team, channelName) => {
        return createWebRtcLink(team.name, channelName);
    }
);
