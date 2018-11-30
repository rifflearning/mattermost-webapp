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

    return (<div className="has-text-centered">
            <div className="control">
            {props.audioMuted ? <MutedButton {...props}/> : <NotMutedButton {...props}/>}
            </div>
            </div>
           );
};

const AudioStatusBar = (props) => {
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
          <p>Having trouble? refresh the page and allow access to your camera and mic.</p>
        </div>
    );
};

class WebRtcSidebar extends React.PureComponent {

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
                          <video className = "local-video"
                                 id = 'local-video'
                                 // this is necessary for thumos. yes, it is upsetting.
                                 height="175" width = "250"
                                 ref = {this.props.localVideoRef}
                                 style={videoStyle(this.props.mediaError)}/>
                          <canvas id = "video-overlay"
                                  height = "175" width = "250"
                                  style={{'display': 'none'}}>
                          </canvas>

                              {this.props.mediaError &&
                                  <VideoPlaceholder style={placeholderStyle(this.props.mediaError)}>
                                        <p> Can't see your video? Make sure your camera is enabled.
                                            </p>
                                      </VideoPlaceholder>
                                  }

                                  {this.props.inRoom && <AudioStatus {...this.props} webrtc={this.webrtc}/>}

                                  {!this.props.inRoom ? <AudioStatusBar {...this.props} />
                                      :
                                      <MeetingMediator {...this.props}></MeetingMediator>
                                      }
            </Menu>
        );
    };
};

export default WebRtcSidebar;
