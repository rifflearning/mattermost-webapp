// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
*/

import React from 'react';
import PropTypes from 'prop-types';

class PeerAudio extends React.Component {
    static propTypes = {

        /** the id of the peer whose audio stream we are rendering */
        id: PropTypes.string,

        /** the audio stream to add to the DOM */
        audio: PropTypes.object,
    };

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
        return (
            <audio
                id={this.props.id + '_audio_only'}
                autoPlay={true}
                ref={this.addTrack}
            />
        );
    }
}

export default PeerAudio;
