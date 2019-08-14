/* ******************************************************************************
 * MeetingMediator.jsx                                                          *
 * *************************************************************************/ /**
 *
 * @fileoverview Meeting mediator react component
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
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" } }],
    "react/jsx-max-props-per-line": ["error", { "when": "multiline" }],
    "no-underscore-dangle": ["error", { "allow": [ "_id" ] }],
*/

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import ChartCard from 'components/dashboard/components/ChartCard';

import {app, logger} from 'utils/riff';
import ChartTable from 'components/dashboard/components/ChartTable';

import Mediator from './charts';
import startRiffListener from './RiffListener';

const MMContainer = styled.div.attrs({
})`
    display: inline-block;
    position: relative;
    width: 100%;
    padding-bottom: 100%;
    vertical-align: top;
    overflow: hidden;
`;

/**
 *  Chart configuration properties
 */
const chartConfig = {
    cardTitle: 'Meeting Mediator',
    info: 'The Meeting Mediator provides real-time feedback about the last five minutes ' +
          'of your conversation. Thick lines and proximity to the central node indicate ' +
          'conversational dominance. Click a node to see the how much a person has spoken. ' +
          'The center node displays the number of exchanges between participants. A higher ' +
          'number represents a more energetic conversation.',
};

class MeetingMediator extends React.Component {
    static propTypes = {
        user: PropTypes.shape({
            id: PropTypes.string,
            username: PropTypes.string,
            nickname: PropTypes.string,
        }).isRequired,
        riff: PropTypes.object.isRequired,
        webRtcPeers: PropTypes.arrayOf(PropTypes.object).isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            tableRows: [],
            caption: null,
        };
        this.namesById = this.getNamesById();
        this.updateAccessibleTable = this.updateAccessibleTable.bind(this);
    }

    componentDidUpdate(prevProps) {
        //TODO: props.riff here has getters and setters and not values....????
        logger.debug('MeetingMediator.componentDidUpdate: updating with participants:', this.props.riff.participants);
        const riffCopy = Object.assign({}, this.props.riff);

        if (prevProps.webRtcPeers !== this.props.webRtcPeers ||
            prevProps.user.id !== this.props.user.id ||
            prevProps.user.username !== this.props.user.username
        ) {
            this.namesById = this.getNamesById();
        }

        if (this.mm) {
            this.mm.update_users(riffCopy.participants, this.namesById);
        }
    }

    componentDidMount() {
        logger.debug('MeetingMediator.componentDidMount: MM props:', this.props);
        startRiffListener();
        this.startMM();
    }

    getNamesById() {
        const namesById = this.props.webRtcPeers.reduce((memo, p) => {
            const data = p.nick.split('|');
            memo[data[0]] = data[1];
            return memo;
        }, {});
        namesById[this.props.user.id] = this.props.user.username;
        return namesById;
    }

    updateAccessibleTable(data) {
        this.setState({
            tableRows: data.turns.map((turn) => [
                this.namesById[turn.participant],
                [`${Math.round(turn.turns * 100)}%`],
            ]),
            caption: `Turns taken: The group has taken ${data.transitions} turns ` +
                     'between participants in the last five minutes.',
        });
    }

    startMM() {
        // use ... spread syntax to try to copy instead of
        // passing our state/props by reference.
        const mediatorProps = Object.assign({}, this.props);
        this.mm = new Mediator(
            app,
            (mediatorProps.riff.participants || []),
            mediatorProps.user.id,
            mediatorProps.roomName,
            mediatorProps.user.username,
            mediatorProps.peerColors,
            this.updateAccessibleTable,
            this.namesById
        );
    }

    render() {
        const chartTable = this.state.tableRows.length ? (
            <ChartTable
                cols={['Participant', 'Amount of Speaking']}
                rows={this.state.tableRows}
                caption={this.state.caption}
            />
        ) : null;

        const chartDiv = <MMContainer id='meeting-mediator'/>;

        return (
            <div style={{marginTop: '10px'}}>
                <ChartCard
                    title={chartConfig.cardTitle}
                    chartInfo={chartConfig.info}
                    chartDiv={chartDiv}
                    chartTable={chartTable}
                    chartCardId='meeting-mediator-card'
                    longDescription={true}

                    /*isMediatorCard is a temporary prop until the dashboard is
                    redesigned. The new meeting mediator card in riff-rtc has a
                    purple border and no box-shadow. Since the ChartCard
                    component is also used in the dashboard, and doesn't require
                    these styles, we must distinguish the meeting mediator chart
                    card (for now).
                    .*/
                    isMediatorCard={true}
                />
            </div>
        );
    }
}

export default MeetingMediator;
