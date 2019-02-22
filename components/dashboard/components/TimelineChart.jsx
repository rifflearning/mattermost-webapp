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
import _ from 'underscore';

import {logger} from 'utils/riff';

import createGantt from './gantt';
import ChartCard from './ChartCard';

const colorYou = '#ab45ab';
const colorOther = '#bdc3c7';
const peerColors = ['#f56b6b', '#128EAD', '#7caf5f', '#f2a466'];

const drawGantt = (props) => {
    logger.debug('GANTT PROPS:', props);
    const {processedTimeline, participantId} = props;
    const {utts, participants} = processedTimeline;

    // create map of id: name
    // local user will always be first.
    logger.debug('sorted participants:', participants);
    const participantNames = _.pluck(participants, 'name');
    const participantIds = _.pluck(participants, 'id');
    const participantMap = _.object(participantIds, participantNames);

    const getColor = (pId) => {
        const pIndex = participantIds.indexOf(pId) - 1;
        logger.debug(pId, 'participant index:', pIndex, 'color:', peerColors[pIndex]);
        let color = peerColors[pIndex];
        if (color === undefined) { // eslint-disable-line no-undefined
            color = colorOther;
        }
        return color;
    };

    // create extra key 'taskName' detailing name of speaker
    const utts2 = _.map(utts, (u) => {
        return {
            ...u,
            taskName: participantMap[u.participant],
            color: u.participant === participantId ? colorYou : getColor(u.participant),
        };
    });

    var gantt = createGantt('#gantt-' + props.meeting._id, props.width).taskTypes(participantNames); // eslint-disable-line no-underscore-dangle
    gantt(utts2);
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
    var chartDiv;
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
        />
    );
};

const TimelineChart = lifecycle(methods)(TimelineView);

export default TimelineChart;
