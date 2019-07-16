/* ******************************************************************************
 * MeetingMediator.jsx                                                                *
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
            mediatorProps.webRtcRiffIds,
            null,
            this.updateAccessibleTable,
            this.namesById
        );
    }

    render() {
        return (
            <React.Fragment>
                <MMContainer id='meeting-mediator'/>
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
