// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
 */

import React from 'react';
import PropTypes from 'prop-types';

import PeerVideo from './PeerVideo';
import PeerAudio from './PeerAudio';

class SharedScreen extends React.Component {
    static propTypes = {

        /** the list of all other peers in the meeting */
        peers: PropTypes.arrayOf(PropTypes.object).isRequired,

        /** the video element (of the shared screen) we are adding to the DOM */
        videoEl: PropTypes.object.isRequired,
    };

    isolateAudioFromPeer(peer) {
        const audioTrack = peer.videoEl.srcObject.getAudioTracks()[0];
        const stream = new MediaStream();
        stream.addTrack(audioTrack);
        return (
            <PeerAudio
                audio={stream}
                id={peer.id}
            />
        );
    }

    peerAudioTracks() {
        // don't add audio from shared screen
        // this would cause echo / reverb
        return this.props.peers
            .filter((peer) => !this.props.videoEl.id.includes(peer.id))
            .map((peer) => this.isolateAudioFromPeer(peer));
    }

    render() {
        return (
            <React.Fragment>
                <PeerVideo
                    key='shared_screen'
                    id='shared_screen'
                    type='screen'
                    videoEl={this.props.videoEl}
                    peerLength={1}
                />
                {this.peerAudioTracks()}
            </React.Fragment>
        );
    }
}

export default SharedScreen;
