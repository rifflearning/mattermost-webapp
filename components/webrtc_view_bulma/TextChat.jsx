// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {connect} from 'react-redux';
import {Widget, addResponseMessage, addUserMessage, dropMessages} from 'react-chat-widget';
import styled from 'styled-components';
import lifecycle from 'react-pure-lifecycle';
import _ from 'underscore';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {sendTextChatMsg, setTextChatBadge} from '../../actions/webrtc_actions';
import {logger} from '../../utils/riff';

import 'react-chat-widget/lib/styles.css';

const RiffChat = styled.div`
.rcw-conversation-container > .rcw-header {
  background-color: rgb(138,106,148);
}

.rcw-conversation-container > .rcw-header > .rcw-close-button {
  background-color: rgb(138,106,148);
}

.rcw-message > .rcw-client {
background-color: rgb(138,106,148);
color: #fff;
word-wrap: break-word;
}

.rcw-launcher {
background-color: rgb(138,106,148);
}
`;

const mapStateToProps = (state) => ({
    ...state.views.webrtc,
    riff: state.views.riff,
    messages: state.views.webrtc.textchat.messages,
    roomName: state.views.webrtc.roomName,
    badge: state.views.webrtc.textchat.badge,
    uid: getCurrentUser(state).id,
});

const mapDispatchToProps = (dispatch) => ({
    dispatch,
    removeBadge: () => {
        logger.debug('removing badge...');
        dispatch(setTextChatBadge(false));
    },
});

const componentDidMount = (props) => {
    dropMessages();
    _.each(props.messages, (m) => {
        if (m.participant === props.uid) {
            addUserMessage(m.message);
        } else {
            addResponseMessage(`**${m.name}**: ${m.message}`);
        }
    });
};

const componentDidUpdate = (props, prevProps) => {
    logger.debug('updating text chat component...', props.messages);

    function arrayDiff(a, b) {
        return [
            ...a.filter((x) => !b.includes(x)),
            ...b.filter((x) => !a.includes(x)),
        ];
    }
    if (props.messages !== prevProps.messages && props.messages.length > 0) {
        let newMessages = arrayDiff(props.messages, prevProps.messages);
        newMessages = _.filter(newMessages, (m) => m.participant !== props.uid);
        logger.debug('new messages:', newMessages);
        _.each(newMessages, (m) => {
            addResponseMessage(`**${m.name}**: ${m.message}`);
            props.dispatch(setTextChatBadge(true));
        });
    }

    if (props.messages.length === 0) {
        logger.debug('props messages EMPTY, clearing messages on chat component.');
        dropMessages();
    }
};

const mapMergeProps = (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    handleNewUserMessage: (event) => {
        dispatchProps.dispatch(sendTextChatMsg(event,
                                               stateProps.uid,
                                               stateProps.riff.meetingId));
    },
});

const methods = {
    componentDidMount,
    componentDidUpdate,
};

const ChatView = (props) => (
    <RiffChat onClick={() => props.removeBadge()}>
        <Widget
            handleNewUserMessage={props.handleNewUserMessage}
            onClick={() => props.removeBadge()}
            title=''
            subtitle=''
            badge={props.badge}
        />
    </RiffChat>
);

const Chat = lifecycle(methods)(ChatView);

export default connect(mapStateToProps,
                       mapDispatchToProps,
                       mapMergeProps)(Chat);
