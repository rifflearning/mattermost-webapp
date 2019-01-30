import React, {PureComponent} from 'react';
import MaterialIcon from 'material-icons-react';
import LeaveRoomButton from './LeaveRoomButton';
import MeetingMediator from './MeetingMediator';
import {VideoPlaceholder,
        ErrorNotification,
        MenuLabel,
        MenuLabelCentered,
        Menu,
        RoomNameEntry
       } from './styled';
import { isScreenShareSourceAvailable } from '../../utils/webrtc/webrtc';
import { detect } from 'detect-browser';
import { logger } from '../../utils/riff';


const browser = detect();


const videoStyle = (mediaError) => {
    if (mediaError) {
        return {'borderRadius': '5px', 'display': 'none'};
    } else {
        return {'borderRadius': '5px', 'display': 'inline-block'};
    }
};

const placeholderStyle = (mediaError) => {
    if (!mediaError) {
        return {'borderRadius': '5px', 'display': 'none'};
    } else {
        return {'borderRadius': '5px', 'display': 'inline-block'};
    }
};

const AudioStatus = (props) => {
    const MutedButton = (props) =>
          (<a className="button is-rounded is-danger"
           onClick={event => props.handleMuteAudioClick(event,
                                                        props.audioMuted,
                                                        props.webrtc)}>
           <MaterialIcon icon="mic_off"/>
           </a>);

    const NotMutedButton = (props) =>
          (<a className="button is-rounded"
           onClick={event => props.handleMuteAudioClick(event,
                                                        props.audioMuted,
                                                        props.webrtc)}>
           <MaterialIcon icon="mic"/>
           </a>);


     const ScreenShareButton = (props) => {
      let classNames = "button is-rounded";
      let icon = "screen_share";
      let disabled = false;
      let ariaLabel = "Share Your Screen";
      if (props.webRtcRemoteSharedScreen) {
        disabled = true;
      } else if (props.isUserSharing) {
        icon = "stop_screen_share";
        ariaLabel = "Stop Sharing Your Screen";
      }

      let onClick = (event) => {
        props.handleScreenShareClick(
          event,
          props.userSharing,
          props.webRtcRemoteSharedScreen,
          props.webrtc);
      };

      return (
        <button className="button is-rounded"
           onClick={onClick}
           disabled={disabled}
           aria-label={ariaLabel}>
           <MaterialIcon icon="screen_share"/>
           </button>);
    }

    return (<div className="has-text-centered">
            <div className="control">
            {props.audioMuted ? <MutedButton {...props}/> : <NotMutedButton {...props}/>}
            {isScreenShareSourceAvailable() && <ScreenShareButton {...props}/>}
            </div>
            </div>
           );
};

const AudioStatusBar = (props) => {
    const screenShareWarning = () => {
    // inform the user screen sharing is not available on their device
    let text = '';
    let experimental = false;
    let alertText = 'Copy and paste "chrome://flags/#enable-experimental-web-platform-features" into your ';
    alertText +=    'address bar, click its "Enable" link, and restart Chrome.';
    switch (browser && browser.name) {
      case 'chrome':
        let version = parseInt(browser.version.split('.')[0]);
        if (version >= 70) {
          text = 'Please enable experimental features in your chrome settings to use screen sharing.\n';
          experimental = true;
        } else {
          text = 'Please update chrome to the latest version to use screen sharing.';
        }
        break;
      case 'firefox':
        text = 'Please make sure you have the latest version of firefox to use screen sharing.';
        break;
      default:
        text =  'Screen sharing is not supported in this browser. '
        text += 'Please use the latest version of Chrome or Firefox to enable screen sharing.';
    }

    let howToAlert = (e) => {
      e.preventDefault();
      alert(alertText);
    };

    return (
      <div style={{paddingBottom: "20px"}}>
        <MaterialIcon icon="warning" color="#f44336" />
        <p> Screen Sharing is disabled! </p>
        <p> {text} </p>
        {experimental &&
          <a href="#" onClick={howToAlert}>How to enable experimental features</a>
        }
      </div>
    );

  }
    return (
        <div className="has-text-centered" style={{marginTop: '1rem'}}>
          <div className="level">
            <div className="level-item" style={{'maxWidth': '20%'}}>
              <MaterialIcon icon="mic"></MaterialIcon>
            </div>
            <div className="level-item">
              <progress style={{maxWidth: '100%', margin: 0}} className="progress is-success" value={props.volume} max="100"></progress>
            </div>
          </div>
          {!isScreenShareSourceAvailable() && screenShareWarning()}
          <p>Having trouble? refresh the page and allow access to your camera and mic.</p>
        </div>
    );
};

class WebRtcSidebar extends React.PureComponent {


    constructor (props) {
      super(props);
      this.appendLocalScreen = this.appendLocalScreen.bind(this);
    }

    localVideo() {
      return (
        <React.Fragment>
           <video className = "local-video"
                 id = 'local-video'
                 // this is necessary for thumos. yes, it is upsetting.
                 height="175" width = "250"
                 style={videoStyle(this.props.mediaError)}
                 ref={this.props.reattachVideo}

                 />
          <canvas id = "video-overlay"
                  height = "175" width = "250"
                  style={{'display': 'none'}}>
          </canvas>
        </React.Fragment>
      );
    }

    appendLocalScreen(container) {
      let screen = this.props.webRtcLocalSharedScreen;
      try {
        screen.style = this.videoStyle();
        screen.height = 175;
        screen.width = 250;
        screen.className = 'local-video';
        screen.muted = true;
        container.appendChild(screen);
      } catch (err) {
        // it is possible that the connection will end
        // in the middle of trying to display the shared screen
        // this will cause a TypeError
        logger.debug("Screen nulled while rendering", err);
      }
    }

    videoStyle() {
      if (this.props.mediaError) {
        return {'borderRadius': '5px', 'display': 'none'};
      } else {
        return {'borderRadius': '5px', 'display': 'inline-block'};
      }
    }

    localSharedScreen() {
      return <div id='local-screen-container' ref={this.appendLocalScreen} />;
    }

    render () {
        return (
            <Menu>
              {!this.props.inRoom ?
                  <MenuLabelCentered>
                        Check your video and microphone before joining.
                      </MenuLabelCentered> :
                      <MenuLabelCentered>
                            {this.props.inRoom && <LeaveRoomButton
                                                        webrtc={this.props.webrtc}
                                                        leaveRiffRoom={this.props.riffParticipantLeaveRoom}
                                                        leaveRoom={this.props.leaveRoom}/>}
                          </MenuLabelCentered>
              }

                              {!this.props.webRtcLocalSharedScreen ? this.localVideo() : this.localSharedScreen()}

                              {this.props.mediaError &&
                                  <VideoPlaceholder style={placeholderStyle(this.props.mediaError)}>
                                        <p> Can't see your video? Make sure your camera is enabled.
                                            </p>
                                      </VideoPlaceholder>
                                  }

                                  {this.props.inRoom && <AudioStatus {...this.props}/>}

                                  {!this.props.inRoom ? <AudioStatusBar {...this.props} />
                                      :
                                      <MeetingMediator {...this.props}></MeetingMediator>
                                      }
            </Menu>
        );
    };
};

export default WebRtcSidebar;
