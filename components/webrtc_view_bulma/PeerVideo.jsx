/* ******************************************************************************
 * PeerVideo.jsx                                                                *
 * *************************************************************************/ /**
 *
 * @fileoverview Peer video react component
 *
 * [More detail about the file's contents]
 *
 * Created on       Jan 30, 2019
 * @author          Brec Hanson
 * @author          Mike Lippert
 * @author          Jordan Reedie
 *
 * @copyright (c) 2019-present Riff Learning, Inc.,
 *            MIT License (see https://opensource.org/licenses/MIT)
 *
 * ******************************************************************************/

/* eslint
    header/header: "off",
*/

import React from 'react';
import PropTypes from 'prop-types';

import {logger} from 'utils/riff';

class PeerVideo extends React.Component {
    static propTypes = {

        /** the id of the peer whose video stream we are rendering */
        id: PropTypes.string,

        /** the color associated with this peer in the meeting mediator */
        peerColor: PropTypes.string.isRequired,

        /** the type of video we are rendering (peer or screen) */
        type: PropTypes.oneOf(['peer', 'screen']).isRequired,

        /** the number of other users in the meeting */
        peerLength: PropTypes.number,

        /** the user's display name */
        displayName: PropTypes.string,

        /** the video element we are displaying */
        videoEl: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.appendVideo = this.appendVideo.bind(this);
        this.video = this.props.videoEl;
    }

    appendVideo(el) {
        logger.debug('appending?', 'color:', this.props.peerColor);
        if (el !== null) {
            this.video.style.setProperty('overflow', 'hidden');
            this.video.style.setProperty('display', 'block');
            this.video.style.setProperty('width', '100%');
            this.video.style.setProperty('margins', '5px');
            this.video.style.setProperty('border-radius', '5px');

            // when we have less than four peers, we display them in one row.
            // with more than four, we display them in two rows
            // set height to account for this
            if (this.props.peerLength < 4) {
                this.video.style.setProperty('height', '85vh');
            } else {
                this.video.style.setProperty('height', '42vh');
            }

            if (this.props.type === 'peer') {
                // we don't want to clip any of the shared screen,
                // so only apply this to peers
                this.video.style.setProperty('object-fit', 'cover');
            }
            el.insertBefore(this.video, el.firstChild);
            this.video.play();
        }
    }

    render() {
        const style = {
            padding: '0.25rem',
        };

        const nameStyle = {
            marginTop: '-30px',
            height: '30px',
            borderBottomRightRadius: '5px',
            borderBottomLeftRadius: '5px',
            position: 'relative',
        };

        const backgroundStyle = {
            opacity: 0.7,
            width: '100%',
            height: '100%',
            borderBottomRightRadius: '5px',
            borderBottomLeftRadius: '5px',
        };

        const labelStyle = {
            position: 'absolute',
            background: '#fff',
            padding: '2px 7px',
            top: '3px',
            left: '7px',
            borderBottomLeftRadius: '3px',
            borderBottomRightRadius: '3px',
            fontSize: '12px',
        };

        if (this.props.type === 'peer') {
            style.padding = '0';
            style.margin = '0.25rem';
            backgroundStyle.background = this.props.peerColor;
        }

        const classes = 'videoContainer remotes column';

        return (
            <div
                className={classes}
                id={'container_' + this.props.id}
                style={style}
                ref={this.appendVideo}
            >
                <div style={nameStyle}>
                    <div style={backgroundStyle}/>
                    <span style={labelStyle}>{this.props.displayName}</span>
                </div>
            </div>
        );
    }
}

export default PeerVideo;
