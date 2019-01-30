import React from 'react';
import { logger } from '../../utils/riff';
import PeerVideo from './PeerVideo';
import PeerAudio from './PeerAudio';

class SharedScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  isolateAudioFromPeer(peer) {
    let audioTrack = peer.videoEl.srcObject.getAudioTracks()[0];
    let stream = new MediaStream();
    stream.addTrack(audioTrack);
    return <PeerAudio audio={stream} id={peer.id} />
  }

  peerAudioTracks() {
    return this.props.peers.map(this.isolateAudioFromPeer);
  }

  render() {
    return (
      <React.Fragment>
        <PeerVideo
          key="shared_screen"
          id="shared_screen"
          type="screen"
          videoEl={this.props.videoEl}
          peerLength={1}
        />
        {this.peerAudioTracks()}
      </React.Fragment>
    );
  }
}

export default SharedScreen;
