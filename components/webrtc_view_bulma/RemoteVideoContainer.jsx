import React from 'react';
import * as sc from './styled';
import SharedScreen from './SharedScreen'
import PeerVideo from './PeerVideo'
import { logger } from '../../utils/riff';


class RemoteVideoContainer extends React.Component {
    constructor(props) {
        super(props);
        console.log("remote video props:", props);
    }

    peerVideo(peerLength) {
        // returns a function
        // close over peerLength
        return function (peer) {
            const [riffId, displayName] = peer.nick.split("|");
            const riffIds = [...this.props.chat.webRtcRiffIds].sort();
            logger.debug("riff ids:", riffIds);
            const idx = riffIds.indexOf(riffId);
            const peerColor = this.props.chat.peerColors[idx];
            logger.debug("!!PEER COLOR:", peerColor, "IDX:", idx, "Riff ID:", riffId);
            return (
                <PeerVideo
                  key={peer.id}
                  id={peer.id}
                  videoEl={peer.videoEl}
                  type="peer"
                  peerColor={peerColor}
                  peerLength={peerLength}
                />
            );
        }.bind(this)
    }

    addPeerVideos() {
        let peerLength = this.props.peers.length;
        logger.debug("rendering", peerLength, "peers....", this.props.peers);
        logger.debug("names:", this.props.chat.webRtcPeerDisplayNames);
        logger.debug("riff ids:", this.props.chat.webRtcRiffIds);
        return this.props.peers.map(this.peerVideo(peerLength));
    }

    videos() {
        if (this.props.remoteSharedScreen) {
          return (
            <SharedScreen
              videoEl={this.props.remoteSharedScreen}
              peers={this.props.peers}
            />
          );
        } else {
          return this.addPeerVideos();
        }
    };


    render() {
        return (
            <div className = "remotes" id = "remoteVideos">
              <div ref = "remotes" className = "columns is-multiline is-centered is-mobile">
                {this.videos()}
              </div>
            </div>
        );
    }

}

export default RemoteVideoContainer;
