// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

class PeerAudio extends React.Component {
    constructor(props) {
        super(props);
        this.addTrack = this.addTrack.bind(this);
    }

    addTrack(el) {
        if (el == null) {
            return;
        }
        el.srcObject = this.props.audio;
        el.play();
    }

    render() {
        return <audio id={this.props.id + '_audio_only'} autoPlay={true} ref={this.addTrack}/>;
    }
}

export default PeerAudio;
