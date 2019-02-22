// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" } }],
 */

import React from 'react';
import ReactChartkick, {PieChart} from 'react-chartkick';
import {ScaleLoader} from 'react-spinners';
import Chart from 'chart.js';
import _ from 'underscore';

import {logger} from 'utils/riff';

import ChartTable from './ChartTable';
import ChartCard from './ChartCard';

ReactChartkick.addAdapter(Chart);

const formatChartData = (processedUtterances, participantId) => {
    logger.debug('formatting:', processedUtterances);

    const colorYou = '#ab45ab';
    let nextOtherUser = 1;

    const data = [];
    const peerColors = ['#f56b6b', '#128EAD', '#7caf5f', '#f2a466'];
    const colors = [];
    const sortedUtterances = _.sortBy(processedUtterances, 'participantId');

    sortedUtterances.forEach((p) => {
        // our display name from firebase if we've got it.
        const label = p.name;

        if (p.participantId === participantId) {
            data.unshift(['You', p.lengthUtterances]);
            colors.unshift(colorYou);
        } else {
            data.push([label || `User ${nextOtherUser++}`, p.lengthUtterances]);
            colors.push(peerColors[nextOtherUser++ - 1]);
        }
    });

    return {data, colors};
};

const chartInfo =
    'This shows a breakdown of how long each member of your meeting spoke for. More \
equal speaking time across all members is associated with higher creativity, more trust between \
group members, and better brainstorming.';

const TurnChart = ({processedUtterances, participantId, loaded}) => {
    let chartDiv;
    let chartTable;
    if (loaded) {
        const r = formatChartData(processedUtterances, participantId);
        logger.debug('data for chart:', r.data);

        const chartOptions = {
            tooltips: {
                callbacks: {
                    label(tooltipItem, data) {
                        const label = data.labels[tooltipItem.index] || '';
                        let seconds =
                            data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] || -1;
                        const minutes = Math.trunc(seconds / 60);
                        seconds = Math.round(seconds % 60);

                        const tooltip = `${label}${label ? ': ' : ''}${minutes}m ${seconds}s`;
                        return tooltip;
                    },
                },
            },
        };

        chartDiv = (
            <PieChart
                donut={true}
                library={chartOptions}
                data={r.data}
                colors={r.colors}
                height='250px'
                width='100%'
            />
        );

        const totalTime = r.data.reduce((prev, curr) => {
            return prev + curr[1];
        }, 0);

        const getTimeString =
            (seconds) => `${Math.trunc(seconds / 60)} minutes ${Math.round(seconds % 60)} seconds`;

        const getPercentageString =
            (seconds) => `${Math.round((seconds / totalTime) * 100)}%`;

        chartTable = (
            <ChartTable
                cols={['Participant', 'Percent Speaking Time', 'Total Speaking Time']}
                rows={r ? r.data.map((participant) => [
                    participant[0],
                    getPercentageString(participant[1]),
                    getTimeString(participant[1]),
                ]) : []}
            />
        );
    }

    const loadingDiv = (
        <ScaleLoader color={'#8A6A94'}/>
    );

    return (
        <ChartCard
            title='Speaking Time'
            chartDiv={loaded ? chartDiv : loadingDiv}
            chartInfo={chartInfo}
            maxWidth={100}
            chartTable={loaded ? chartTable : false}
        />
    );
};

export default TurnChart;
