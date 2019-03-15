// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" } }],
 */

import React from 'react';
import {ScaleLoader} from 'react-spinners';
import lifecycle from 'react-pure-lifecycle';

import {logger, PeerColors, textTruncate} from 'utils/riff';

import {Gantt} from './gantt';
import ChartCard from './ChartCard';

const drawGantt = (props) => {
    logger.debug('GANTT PROPS:', props);
    const {processedTimeline, participantId} = props;
    const {utts, participants} = processedTimeline;

    // create map of id: name
    // local user will always be first.
    logger.debug('sorted participants:', participants);

    //since the decision was made to limit the length of the name on the y-axis if overflowing,
    //the breakpoint at which the name should be truncated,
    //is 720px (width of parent, <MeetingViz/>)
    //what seemed to work was truncating the name to 13 characters, plus an ellipsis

    const maxNarrowWidth = 720;
    const maxNameLenNarrow = 13;
    const maxNameLenWide = 18; //even though signup limits to 22 char, this is a safety net, 22 char can break

    const truncateLength = props.width < maxNarrowWidth ? maxNameLenNarrow : maxNameLenWide;
    const participantNames = participants.map((p) => textTruncate(p.name, truncateLength));

    // create the participant map of id to name and color, filter out and
    // set the current user first, then add the other participants
    const participantMap = {};
    participants
        .filter((p) => {
            if (p.id !== participantId) {
                return true;
            }
            participantMap[p.id] = {name: p.name, color: PeerColors[0]};
            return false;
        })
        .reduce((pmap, p, i) => {
            pmap[p.id] = {
                name: p.name,
                color: p.id === participantId ? PeerColors[0] : PeerColors[(i % (PeerColors.length - 1)) + 1],
            };
            return pmap;
        }, participantMap);

    const numOtherPeers = participants.length - (participantMap[participantId] ? 1 : 0);
    if (numOtherPeers > PeerColors.length - 1) {
        logger.warn(`Not enough colors (${PeerColors.length - 1}) for all peers (${numOtherPeers})`);
    }

    // create extra key 'taskName' detailing name of speaker
    const utts2 = utts.map((u) => ({
        ...u,
        taskName: participantMap[u.participant].name,
        color: participantMap[u.participant].color,
    }));

    const gantt = new Gantt(`#gantt-${props.meeting._id}`, props.width); // eslint-disable-line no-underscore-dangle
    gantt.taskTypes = participantNames;
    gantt.draw(utts2);
};

const componentDidMount = (props) => {
    if (props.loaded & props.processedTimeline) {
        logger.debug('TIMELINE loaded, props:', props);
        drawGantt(props);
    }
};

const componentDidUpdate = (props) => {
    // logger.debug('component updating...', props);
    if (props.loaded & props.processedTimeline) {
        drawGantt(props);
    }

    //return false;
};

const methods = {
    componentDidUpdate,
    componentDidMount,
};

const chartInfo =
    'This chart shows a timeline of when people spoke during your meeting.';

// processedTimeline:
// processedUtterances: [list of utterances...]
// participants: [{id, name, ...}, ...]
const TimelineView = (props) => {
    logger.debug('timeline props:', props);
    let chartDiv;
    if (!props.loaded) { // eslint-disable-line no-negated-condition
        chartDiv = (
            <ScaleLoader color={'#8A6A94'}/>
        );
    } else {
        chartDiv = <div id={'gantt-' + props.meeting._id}/>; // eslint-disable-line no-underscore-dangle
    }
    return (
        <ChartCard
            title='Timeline'
            chartDiv={chartDiv}

            // messy, but here we need to give the child component
            // a way to redraw the chart
            redraw={() => {
                if (props.loaded && props.processedTimeline) {
                    drawGantt(props);
                }
            }}
            chartInfo={chartInfo}
            maxWidth={100}
            setWidth={props.width}
            meetingId={props.meeting._id} // eslint-disable-line no-underscore-dangle
        />
    );
};

const TimelineChart = lifecycle(methods)(TimelineView);

export default TimelineChart;
