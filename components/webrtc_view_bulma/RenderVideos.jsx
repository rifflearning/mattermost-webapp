import React from 'react';
import styled from 'styled-components';
import {ScaleLoader} from 'react-spinners';
import RemoteVideoContainer from './RemoteVideoContainer';
import * as sc from './styled';
import {getPeerListString} from 'utils/riff'

class RenderVideos extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.webRtcPeers.length > 0) {
            return (
                <div style={{margin: 'auto'}}
                    className='columns has-text-centered is-centered'>
                    <div className='column'
                        tabIndex='0'
                        aria-label={`Video chat.${getPeerListString(this.props.webRtcPeers)}`}>
                        <RemoteVideoContainer
                            ref='remote'
                            peers = {this.props.webRtcPeers}
                            chat={this.props.chat}
                            remoteSharedScreen={this.props.webRtcRemoteSharedScreen}
                        />
                    </div>
                </div>
            );
        } else {
            return (
                <div style={{width: '100%', alignItems: 'center'}}className='columns is-centered is-vcentered'>
                  <div className='column'>
                    {!this.props.inRoom || !this.props.riff.meetingId ?


                        <React.Fragment>
                              {this.props.displayRoomName &&
                                  <div className='columns has-text-centered is-centered'>
                                        <div className='has-text-centered column is-half' style={{whiteSpace: 'nowrap'}}>
                                              <div className='columns'>
                                                    <div className='column'>
                                                          <h2 className='is-size-4'>Joining room</h2>
                                                        </div>
                                                        <div className='column'>
                                                              <sc.RoomNameEntry
                                                                    type='text'
                                                                    name='room'
                                                                    placeholder='my-room-name'
                                                                    value={this.props.roomName}
                                                                    readOnly={this.props.roRoomName}
                                                                    onChange={event => this.props.handleRoomNameChange(event.target.value)}/>
                                                            </div>
                                                  </div>
                                            </div>
                                      </div>
                                      }
                                      <div className='columns is-centered'>
                                            {this.props.roDisplayName ?
                                                <div className='has-text-centered column is-half' style={{whiteSpace: 'nowrap'}}>
                                                      <h2 className='is-size-4'>Joining as:
                                                            <span style={{paddingLeft: '.5rem', color: 'rgb(138,106,148)'}}>
                                                                  {this.props.displayName}
                                                                </span>
                                                          </h2>
                                                    </div>
                                                    :
                                                    <div className='has-text-centered column is-half' style={{whiteSpace: 'nowrap'}}>
                                                          <div className='columns'>
                                                                <div className='column'>
                                                                      <h2 className='is-size-4'>With display name </h2>
                                                                    </div>
                                                                    <div className='column'>
                                                                          <sc.RoomNameEntry
                                                                                type='text'
                                                                                name='name'
                                                                                placeholder='Your Name'
                                                                                value={this.props.displayName}
                                                                                readOnly={this.props.roDisplayName}
                                                                                onKeyPress={ (event) => this.props.handleKeyPress(event, this.props.webrtc) }
                                                                                onChange={event => this.props.handleDisplayNameChange(event.target.value)}>
                                                                              </sc.RoomNameEntry>
                                                                        </div>
                                                              </div>
                                                        </div>
                                                        }
                                          </div>



                                          <div className='columns has-text-centered is-centered'>
                                                <div className='has-text-centered is-centered column' >
                                                      <a className='button is-outlined is-primary'
                                                             style={{'marginTop': '10px'}}
                                                             disabled={this.props.joinButtonDisabled}
                                                             onClick={this.props.handleReadyClick}>Join Room</a>
                                                          { this.props.joinRoomStatus === 'error' &&
                                                            <sc.ErrorNotification>
                                                                  <button className='delete' onClick={this.props.clearJoinRoomError}></button>
                                                                      {this.props.joinRoomMessage}
                                                                </sc.ErrorNotification>
                                                                }
                                                    </div>
                                              </div>
                            </React.Fragment>
                            :
                            <div className='columns has-text-centered is-centered is-vcentered'
                                     style={{minHeight: '80vh', minWidth: '80vw'}}>
                                  <div className='column is-vcentered has-text-centered'>
                                        <h1>Nobody else here...</h1>
                                            <ScaleLoader color={'#8A6A94'}/>
                                      </div>
                                </div>

                            }
                  </div>
                </div>
          );
        };
    };
};

export default RenderVideos;
