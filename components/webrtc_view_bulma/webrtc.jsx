import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import lifecycle from 'react-pure-lifecycle';
import {ScaleLoader} from 'react-spinners';
import MaterialIcon from 'material-icons-react';

import webrtc from '../../utils/webrtc/webrtc';
import store from '../../stores/redux_store';
import RemoteVideoContainer from './RemoteVideoContainer';
import RenderVideos from './RenderVideos';
import LeaveRoomButton from './LeaveRoomButton';
import WebRtcSidebar from './WebrtcSidebar';
import TextChat from './TextChat';
import {VideoPlaceholder,
        ErrorNotification,
        MenuLabel,
        MenuLabelCentered,
        Menu,
        RoomNameEntry
       } from './styled';



// needs to be a regular component because we need to use
// refs in order to request a local stream with SimpleWebRTC.
class WebRtc extends Component {
    constructor (props) {
        super(props);
        console.log("webrt has these props:", props);
        this.onUnload = this.onUnload.bind(this);
        this.render = this.render.bind(this);
        // creating ref for local video so we can pass down to children
        this.localVideoRef = React.createRef();
    }

    componentDidMount () {
        console.log("adding local video to:", this.localVideoRef);
        let localVideo = ReactDOM.findDOMNode(this.localVideoRef.current);
        //TODO: "" here should be replaced by user info.
        this.webrtc = webrtc(localVideo,
                             this.props.dispatch,
                             store.getState);
        this.webrtc.changeNick(this.props.user.id + "|" + this.props.user.username);

        window.addEventListener("beforeunload", this.onUnload);
    }

    componentWillUnmount() {
        this.webrtc.stopLocalVideo();
        this.onUnload();
        window.removeEventListener('beforeunload', this.onUnload);
    }

    onUnload(event) {
        // unload event...
        // we previously left the riff room
    }

    render () {
        return (
            <div id='app-content'
                 className=''>
              <div className="section">
                <div className="columns is-fullheight">
                  <div className="column is-3 is-sidebar-menu is-hidden-mobile">
                  <WebRtcSidebar {...this.props}
                                 webrtc={this.webrtc}
                                 localVideoRef={this.localVideoRef}/>
                  </div>
                  <div className="column">
                  <RenderVideos inRoom={this.props.inRoom}
                                roomName={this.props.roomName}
                                handleKeyPress={this.props.handleKeyPress}
                                webRtcPeers={this.props.webRtcPeers}
                                handleRoomNameChange={null}
                                handleReadyClick={(event) => this.props.handleReadyClick(event, this.props, this.webrtc)}
                    joinButtonDisabled={false}
                    clearJoinRoomError={this.props.clearJoinRoomError}
                    joinRoomStatus={this.props.joinRoomStatus}
                    joinRoomMessage={this.props.joinRoomMessage}
                    chat={this.props}
                    webrtc={this.webrtc}
                    displayRoomName={false}
                    displayName={this.props.user.nickname == "" ?
                    "@" + this.props.user.username : this.props.user.nickname}
                    roDisplayName={true}>
                  </RenderVideos>
                  {this.props.inRoom && <TextChat/>}
                  </div>
                </div>
              </div>
            </div>
        );
    }
}


export default WebRtc;
