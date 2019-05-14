import util from 'util';
import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import styled from 'styled-components';
import Mediator from './charts';
import startRiffListener from './RiffListener';
import { app, socket} from "../../utils/riff";
import ChartTable from '../dashboard/components/ChartTable'

const MMContainer = styled.div.attrs({
})`
    display: inline-block;
    position: relative;
    width: 100%;
    padding-bottom: 100%;
    vertical-align: top;
    overflow: hidden;
`;


class MeetingMediator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tableRows: []
        };
        this.namesById = this.getNamesById();
        this.updateAccessibleTable = this.updateAccessibleTable.bind(this);
    }

    componentDidUpdate(prevProps) {
        //TODO: props.riff here has getters and setters and not values....????
        console.log("updating with participants:", this.props.riff.participants);
        let riffCopy = Object.assign({}, this.props.riff);

        if (prevProps.webRtcPeers !== this.props.webRtcPeers ||
            prevProps.user.id !== this.props.user.id ||
            prevProps.user.username !== this.props.user.username
        ) {
            this.namesById = this.getNamesById();
        }

        if (this.mm) {
            this.mm.update_users(riffCopy.participants);
        }
    }

    componentDidMount() {
        console.log("MM props:", this.props);
        startRiffListener();
        this.startMM();
    }

    getNamesById() {
        let namesById = this.props.webRtcPeers.reduce((memo, p) => {
            const data = p.nick.split('|');
            memo[data[0]] = data[1];
            return memo;
        }, {});
        namesById[this.props.user.id] = this.props.user.username;
        return namesById;
    }

    updateAccessibleTable(data) {
        this.setState({
            tableRows: data.turns.map(turn => [
                this.namesById[turn.participant],
                [`${Math.round(turn.turns * 100)}%`]
            ])
        });
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
            null,
            this.updateAccessibleTable,
        );
    }

    render() {
        return (
            <React.Fragment>
                <MMContainer id = "meeting-mediator">
                </MMContainer>
                {this.state.tableRows.length ? (
                    <ChartTable
                        cols={['Participant', 'Amount of Speaking']}
                        rows={this.state.tableRows}
                    />
                ) : null }
            </React.Fragment>
        );
    }
}

export default MeetingMediator;
