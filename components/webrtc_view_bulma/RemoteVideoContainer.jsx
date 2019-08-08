/* ******************************************************************************
 * RemoteVideoContainer.jsx                                                     *
 * *************************************************************************/ /**
 *
 * @fileoverview Remote video container react component
 *
 * [More detail about the file's contents]
 *
 * Created on       Nov 21, 2018
 * @author          Mike Lippert
 * @author          Dan Calacci
 * @author          Brec Hanson
 * @author          Jordan Reedie
 *
 * @copyright (c) 2019-present Riff Learning, Inc.,
 *            MIT License (see https://opensource.org/licenses/MIT)
 *
 * ******************************************************************************/
/* eslint
    header/header: "off",
    "react/jsx-max-props-per-line": ["error", { "when": "multiline" }],
*/

import React from 'react';
import PropTypes from 'prop-types';

import { calculateBitrate, logger } from '../../utils/riff';

import SharedScreen from './SharedScreen';
import PeerVideo from './PeerVideo';

class RemoteVideoContainer extends React.Component {
    static propTypes = {

        chat: PropTypes.shape({
            peerColors: PropTypes.array,
            webRtcRiffIds: PropTypes.array,
            webRtcPeerDisplayNames: PropTypes.array,
        }).isRequired,

        /** list of all peers to display */
        peers: PropTypes.arrayOf(PropTypes.object).isRequired,

        /** If a Peer is sharing their screen, this will
         *   have the remote shared screen element
         *  Otherwise, this will be null
         */
        remoteSharedScreen: PropTypes.object,

        /** List of the IDs of all of the webrtc peers */
        riffIds: PropTypes.arrayOf(PropTypes.string),
    };

    constructor(props) {
        super(props);
        logger.debug('remote video props:', props);
    }

    componentDidUpdate() {
        const updatedBitrate = calculateBitrate(this.props.peers.length);
        this.props.setVideoBitrateLimit(updatedBitrate);
    }

    peerVideo(peerLength) {
        // returns a function
        // close over peerLength
        return (peer) => {
            const [riffId, displayName] = peer.nick.split('|'); // eslint-disable-line no-unused-vars
            const riffIds = [...this.props.chat.webRtcRiffIds].sort();
            logger.debug('riff ids:', riffIds);
            const idx = riffIds.indexOf(riffId);
            const peerColor = this.props.chat.peerColors[idx];
            logger.debug('!!PEER COLOR:', peerColor, 'IDX:', idx, 'Riff ID:', riffId);
            return (
                <PeerVideo
                    key={peer.id}
                    id={peer.id}
                    displayName={displayName}
                    videoEl={peer.videoEl}
                    type='peer'
                    peerColor={peerColor}
                    peerLength={peerLength}
                />
            );
        };
    }

    addPeerVideos() {
        const peerLength = this.props.peers.length;
        logger.debug('rendering', peerLength, 'peers....', this.props.peers);
        logger.debug('names:', this.props.chat.webRtcPeerDisplayNames);
        logger.debug('riff ids:', this.props.chat.webRtcRiffIds);
        const peerVideos = this.props.peers.map(this.peerVideo(peerLength));
        if (peerLength >= 4) {
            // return the videos separated into two rows
            // this may not be the best way to do this,
            // but it's the one i thought of first and
            // code freeze is tomorrow :)
            return (
                <div className='column'>
                    <div className='row'>
                        <div className='columns'>
                            {peerVideos.slice(0, peerLength / 2)}
                        </div>
                    </div>
                    <div className='row' style={{paddingTop: '25px'}}>
                        <div className='columns'>
                            {peerVideos.slice(peerLength / 2)}
                        </div>
                    </div>
                </div>
            );
        }

        return peerVideos;
    }

    videos() {
        if (this.props.remoteSharedScreen) {
            return (
                <SharedScreen
                    videoEl={this.props.remoteSharedScreen}
                    peers={this.props.peers}
                />
            );
        }
        return this.addPeerVideos();
    }

    render() {
        return (
            <div className='remotes' id='remoteVideos'>
                <div ref='remotes' className='columns is-multiline is-centered is-mobile'>
                    {this.videos()}
                </div>
            </div>
        );
    }
}

export default RemoteVideoContainer;
