import React from 'react';
import { logger } from '../../utils/riff';
import * as sc from './styled';

class PeerVideo extends React.Component {
    constructor (props) {
        super(props);
        this.appendVideo = this.appendVideo.bind(this);
        this.video = this.props.videoEl;
    }

    appendVideo (el) {
      logger.debug("appending?", "color:", this.props.peerColor)
      if (el !== null) {
        this.video.style.setProperty('overflow', 'hidden');
        this.video.style.setProperty('display', 'block');
        this.video.style.setProperty('width', '100%');
        this.video.style.setProperty('height', '100%');
        this.video.style.setProperty('margins', '5px');
        this.video.style.setProperty('border-radius', '5px');
        if (this.props.type === "peer") {
          // we don't want to clip any of the shared screen,
          // so only apply this to peers
          this.video.style.setProperty('object-fit', 'cover');
          this.video.style.setProperty('border-bottom-right-radius', '0px');
          this.video.style.setProperty('border-bottom-left-radius', '0px');
        }
        el.appendChild(this.video);
        this.video.play()
      }
    }

    render () {
      let style = {
        'padding': '0.25rem',
      };

      if (this.props.type === "peer") {
        style.borderBottom = '5px solid ' + this.props.peerColor;
        style.padding = '0';
        style.margin = '0.25rem';
        style.borderBottomRightRadius = '5px';
        style.borderBottomLeftRadius = '5px';
      }

      let classes = "videoContainer remotes column";

      if (this.props.peerLength < 4) {
        style.width = '100vh';
        style.height = '80vh';
      } else {
        style.width = '50vh';
        style.height = '40vh';
        classes += " is-narrow";
      }

      return (
        <div
          className={classes}
          id={"container_" + this.props.id}
          style={style}
          ref={this.appendVideo}
        />
      );
    }
}

export default PeerVideo;
