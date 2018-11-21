import util from 'util';
import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import Mediator from './charts';
import startRiffListener from './RiffListener';
import { app, socket} from "../../utils/riff";


class MeetingMediator extends Component {
    constructor(props) {
        super(props)
    }

    componentDidUpdate() {
        //TODO: props.riff here has getters and setters and not values....????
        console.log("updating with participants:", this.props.riff.participants);
        let riffCopy = Object.assign({}, this.props.riff);
        if (this.mm) {
            this.mm.update_users(riffCopy.participants);
        }
    }

    componentDidMount() {
        console.log("MM props:", this.props);
        startRiffListener();
        this.startMM();
    }

    startMM() {
        // use ... spread syntax to try to copy instead of
        // passing our state/props by reference.
        let mediatorProps = Object.assign({}, this.props);
        this.mm = new Mediator(
            app,
            (mediatorProps.riff.participants || []),
            mediatorProps.user.id,
            mediatorProps.roomName,
            mediatorProps.user.username,
            mediatorProps.peerColors,
            mediatorProps.webRtcRiffIds,
        );
    }

    render() {
        return (
            <div id = "meeting-mediator">
            </div>
        );
    }
}

export default MeetingMediator;
