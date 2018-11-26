import React from 'react';
import * as sc from './styled';


class PeerVideo extends React.Component {
    constructor (props) {
        super(props);
        this.appendVideo = this.appendVideo.bind(this);
        this.video = this.props.peer.videoEl;
    }

    appendVideo (el) {
        console.log("appending?", "color:", this.props.peerColor)
        if (el !== null) {

            this.video.style.setProperty('overflow', 'hidden');
            this.video.style.setProperty('display', 'block');
            this.video.style.setProperty('width', '100%');
            this.video.style.setProperty('height', '100%');
            this.video.style.setProperty('margins', '5px');
            this.video.style.setProperty('object-fit', 'cover');
            this.video.style.setProperty('border-radius', '5px');
            //      this.video.style.setProperty('border-bottom', '5px solid ' + this.props.peerColor);
            el.appendChild(this.video);
        }
    }

    render () {
        if (this.props.peerLength < 4) {
            this.video.style.setProperty('border-bottom', '5px solid ' + this.props.peerColor);
            return (
                <div className = {"videoContainer remotes column"}
                     id = {"container_" + this.props.peer.id}
                     style = {{'width': '100vh', 'height': '75vh', 'padding': '0.25rem',
                               'borderBottom': '5px solid ' + this.props.PeerColor,
                     'position': 'relative'}}
                     ref={this.appendVideo}>
                  <sc.VideoUsernameTag>
                    @{this.props.displayName}
                  </sc.VideoUsernameTag>
                </div>
            );
            // if we have over 4 participants, make it small squares instead of
            // vertical slices.
        } else {
            this.video.style.setProperty('border-bottom', '5px solid ' + this.props.peerColor);
            return (
                <div className = {"videoContainer remotes column is-narrow"}
                     id = {"container_" + this.props.peer.id}
                     style = {{'width': '50vh', 'height': '40vh', 'padding': '0.25rem',
                     'borderBottom': '5px solid ' + this.props.PeerColor}}
                     ref={this.appendVideo}>
                  <sc.VideoUsernameTag>
                    {this.props.displayName}
                  </sc.VideoUsernameTag>
                </div>
            );
        }
    }
}

class RemoteVideoContainer extends React.Component {
    constructor(props) {
        super(props);
        console.log("remote video props:", props);
    }

    videos() {
        let peerLength = this.props.peers.length;
        console.log("rendering", peerLength, "peers....", this.props.peers);
        console.log("names:", this.props.chat.webRtcPeerDisplayNames);
        console.log("riff ids:", this.props.chat.webRtcRiffIds);
        return this.props.peers.map(function (peer) {
            //      const idx = this.props.chat.webRtcPeers.map(item => item.id).indexOf(peer.id);
            let [riffId, displayName] = peer.nick.split("|");
            let sortedRiffIds = this.props.chat.webRtcRiffIds.slice();
            let riffIds = sortedRiffIds.sort();
            console.log("riff ids:", riffIds);
            const idx = riffIds.indexOf(riffId);
            let peerColor = this.props.chat.peerColors[idx];
            console.log("!!PEER COLOR:", peerColor, "IDX:", idx, "Riff ID:", riffId);
            return (<PeerVideo key={ peer.id }
                    peer = { peer }
                    displayName = { displayName }
                    peerColor = {peerColor}
                    peerLength = {peerLength}></PeerVideo>);
        }.bind(this));
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
