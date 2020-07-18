// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// Riff Learning lint overrides
/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" }, "ObjectExpression": "first" }],
    "react/jsx-max-props-per-line": ["error", { "when": "multiline" }],
    "no-underscore-dangle": ["error", { "allow": [ "_id" ] }],
*/

import React from 'react';
import PropTypes from 'prop-types';
import {ScaleLoader} from 'react-spinners';

import {readablePeers, Colors} from 'utils/riff';

import RemoteVideoContainer from './RemoteVideoContainer';
import * as sc from './styled';

class RenderVideos extends React.Component {
    static propTypes = {

        chat: PropTypes.shape({
            peerColors: PropTypes.array,
            webRtcRiffIds: PropTypes.array,
            webRtcPeerDisplayNames: PropTypes.array,
        }).isRequired,

        riff: PropTypes.shape({
            meetingId: PropTypes.string,
        }).isRequired,

        webrtc: PropTypes.shape({
            setVideoBitrateLimit: PropTypes.func,
        }),

        /** list of all peers to display */
        webRtcPeers: PropTypes.arrayOf(PropTypes.object).isRequired,

        /** If a Peer is sharing their screen, this will
         *   have the remote shared screen element
         *  Otherwise, this will be null
         */
        webRtcRemoteSharedScreen: PropTypes.object,

        /** List of the IDs of all of the webrtc peers */
        riffIds: PropTypes.arrayOf(PropTypes.string),

        shouldFocusJoinRoomError: PropTypes.bool,
        inRoom: PropTypes.bool.isRequired,
        displayRoomName: PropTypes.bool,
        roomName: PropTypes.string,
        roRoomName: PropTypes.bool,
        displayName: PropTypes.string,
        roDisplayName: PropTypes.bool,
        joinRoomStatus: PropTypes.string,
        joinRoomMessage: PropTypes.string,
        joinButtonDisabled: PropTypes.bool,

        focusJoinRoomErrorComplete: PropTypes.func.isRequired,
        handleDisplayNameChange: PropTypes.func,
        clearJoinRoomError: PropTypes.func.isRequired,
        handleRoomNameChange: PropTypes.func,
        handleReadyClick: PropTypes.func.isRequired,
        handleKeyPress: PropTypes.func,
    };

    componentDidUpdate(prevProps /*, prevState*/) {
        //just updated DOM, which has an error message...focus on error
        if (!prevProps.shouldFocusJoinRoomError && this.props.shouldFocusJoinRoomError && this.JoinRoomErrorRef) {
            this.JoinRoomErrorRef.focus();
            this.props.focusJoinRoomErrorComplete();
        }
    }

    render() {
        if (this.props.webRtcPeers.length > 0) {
            return (
                <div
                    style={{margin: 'auto'}}
                    className='columns has-text-centered is-centered'
                >
                    <div
                        className='column'
                        tabIndex='0'
                        aria-label={`Video chat. ${readablePeers(this.props.webRtcPeers)}`}
                    >
                        <RemoteVideoContainer
                            peers={this.props.webRtcPeers}
                            chat={this.props.chat}
                            remoteSharedScreen={this.props.webRtcRemoteSharedScreen}
                            setVideoBitrateLimit={(bitrateLimit) => (
                                this.props.webrtc.setVideoBitrateLimit(bitrateLimit)
                            )}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div
                className='columns is-centered is-vcentered'
                style={{width: '100%', alignItems: 'center'}}
            >
                <div className='column'>
                    {!this.props.inRoom || !this.props.riff.meetingId ? (
                        <React.Fragment>
                            {this.props.displayRoomName &&
                                <div className='columns has-text-centered is-centered'>
                                    <div
                                        className='has-text-centered column is-half'
                                        style={{whiteSpace: 'nowrap'}}
                                    >
                                        <div className='columns'>
                                            <div className='column'>
                                                <h2 className='is-size-4'>{'Joining room'}</h2>
                                            </div>
                                            <div className='column'>
                                                <sc.RoomNameEntry
                                                    type='text'
                                                    name='room'
                                                    placeholder='my-room-name'
                                                    value={this.props.roomName}
                                                    readOnly={this.props.roRoomName}
                                                    onChange={(event) => this.props.handleRoomNameChange(event.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                            <div className='columns is-centered'>
                                {this.props.roDisplayName ? (
                                    <div
                                        className='has-text-centered column is-half'
                                        style={{whiteSpace: 'nowrap'}}
                                    >
                                        <h2 className='is-size-4'>{'Joining as:'}
                                            <span style={{paddingLeft: '.5rem', color: 'rgb(138,106,148)'}}>
                                                {this.props.displayName}
                                            </span>
                                        </h2>
                                    </div>
                                ) : (
                                    <div
                                        className='has-text-centered column is-half'
                                        style={{whiteSpace: 'nowrap'}}
                                    >
                                        <div className='columns'>
                                            <div className='column'>
                                                <h2 className='is-size-4'>{'With display name'}</h2>
                                            </div>
                                            <div className='column'>
                                                <sc.RoomNameEntry
                                                    type='text'
                                                    name='name'
                                                    placeholder='Your Name'
                                                    value={this.props.displayName}
                                                    readOnly={this.props.roDisplayName}
                                                    onKeyPress={(event) => this.props.handleKeyPress(event, this.props.webrtc)}
                                                    onChange={(event) => this.props.handleDisplayNameChange(event.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className='columns has-text-centered is-centered'>
                                <div className='has-text-centered is-centered column'>
                                    {this.props.joinRoomStatus === 'error' &&
                                        <div
                                            tabIndex='-1'
                                            ref={(ref) => {
                                                this.JoinRoomErrorRef = ref;
                                            }}
                                        >
                                            <sc.ErrorNotification>
                                                <button
                                                    className='delete'
                                                    onClick={this.props.clearJoinRoomError}
                                                    aria-label='Close form error message'
                                                />
                                                {this.props.joinRoomMessage}
                                            </sc.ErrorNotification>
                                        </div>
                                    }
                                    <button
                                        className='button is-outlined is-primary'
                                        style={{marginTop: '10px'}}
                                        disabled={this.props.joinButtonDisabled}
                                        onClick={this.props.handleReadyClick}
                                    >
                                        {'Join Room'}
                                    </button>
                                </div>
                            </div>
                        </React.Fragment>
                    ) : (
                        <div
                            className='columns has-text-centered is-centered is-vcentered'
                            style={{minHeight: '80vh', minWidth: '80vw'}}
                        >
                            <div className='column is-vcentered has-text-centered'>
                                <h1>{'Nobody else here...'}</h1>
                                <ScaleLoader color={Colors.lightRoyal}/>
                            </div>
                        </div>

                    )}
                </div>
            </div>
        );
    }
}

export default RenderVideos;
