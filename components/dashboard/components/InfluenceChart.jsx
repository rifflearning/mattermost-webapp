// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {ScaleLoader} from 'react-spinners';
import {HorizontalBar} from 'react-chartjs-2';
import _ from 'underscore';

import {logger} from 'utils/riff';

import ChartCard from './ChartCard';
import ChartTable from './ChartTable';

/* takes a string phrase and breaks it into separate phrases
   no bigger than 'maxwidth', breaks are made at complete words.*/

function formatLabel(str, maxwidth) {
    const sections = [];
    const words = str.split(' ');
    let temp = '';

    words.forEach((item, index) => {
        if (temp.length > 0) {
            const concat = temp + ' ' + item;

            if (concat.length > maxwidth) {
                sections.push(temp);
                temp = '';
            }
            else {
                if (index === (words.length - 1)) {
                    sections.push(concat);
                    return;
                }
                temp = concat;
                return;
            }
        }

        if (index === (words.length - 1)) {
            sections.push(item);
            return;
        }

        if (item.length < maxwidth) {
            temp = item;
        }
        else {
            sections.push(item);
        }
    });

    return sections;
}

// either 'mine' or 'theirs'
const getLabelsAndData = (uid, influenceType, influenceData) => {
    const res = _.filter(influenceData, (n) => {
        logger.debug(n.target, n.target === uid);
        if (influenceType === 'theirs') {
            return n.source === uid;
        }
        return n.target === uid;
    });
    logger.debug('influence type, res', uid, influenceType, res);
    const sortedRes = _.sortBy(res, (n) => -n.size);
    const labels = _.map(sortedRes, (n) => {
        return influenceType === 'theirs' ? n.targetName : n.sourceName;
    });
    const data = _.map(sortedRes, (n) => n.size);
    return {labels, data};
};

const transformDataForBarChart = (rawLabels, data) => {
    logger.debug('using labels and data:', rawLabels, data);
    const labels = _.map(rawLabels, (l) => formatLabel(l, 10));
    return {
        labels,
        datasets: [
            {
                label: 'Responses',
                backgroundColor: 'rgba(255,99,132,0.2)',
                borderColor: 'rgba(255,99,132,1)',
                borderWidth: 0.5,
                hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                hoverBorderColor: 'rgba(255,99,132,1)',
                data,
            },
        ],
    };
};

const options = {
    legend: {
        display: false,
    },
    scales: {
        yAxes: [
            {
                gridLines: {display: false},
            },
        ],
        xAxes: [
            {
                ticks: {
                    beginAtZero: true,
                    stepSize: 1,
                    autoSkip: true,
                    maxTicksLimit: 10,
                },
            },
        ],
        gridLines: {display: false},
    },
};

const getBarGraph = (influenceType, BarGraphData, options) => {
    if (BarGraphData.labels.length > 0) {
        return (
            <div style={{padding: '1rem'}}>
                <HorizontalBar data={BarGraphData} options={options}/>
            </div>
        );
    }
    const emptyText = influenceType === 'mine' ? "It doesn't look like you responded quickly to anyone in this meeting." : "It doesn't look like anyone responded to you quickly in this meeting.";
    return (
        <div>
            <p style={{margin: '1.5rem'}}>{emptyText}</p>
        </div>
    );
};

const chartInfoMine = 'This graph shows how many times each person spoke first after you finished speaking. Frequent first-responses indicate that a person is engaged by what you have to say.';
const chartInfoTheirs = 'This graph shows how many times you spoke first after another person finished speaking. Frequent first-responses indicate that you are engaged by what another person is saying.';
const BarChart = ({processedInfluence, participantId, influenceType, loaded, meeting}) => {
    //processedInfluence = addColorsToData(processedInfluence, participantId);

    const chartTitle = influenceType === 'mine' ? 'Who You Influenced' : 'Who Influenced You';
    const chartInfoText = influenceType === 'mine' ? chartInfoMine : chartInfoTheirs;

    const loadingDiv = (
        <ScaleLoader color={'#8A6A94'}/>
    );

    let BarGraph;
    let chartTable;
    if (loaded) {
        const labelsAndData = getLabelsAndData(participantId, influenceType, processedInfluence);
        logger.debug('influence labels and data,', influenceType, labelsAndData);

        const BarGraphData = transformDataForBarChart(labelsAndData.labels, labelsAndData.data);
        BarGraph = getBarGraph(influenceType, BarGraphData, options);

        chartTable = (
            <ChartTable
                cols={['Participant', 'Responses']}
                rows={labelsAndData.labels.map((label, i) => [
                    label,
                    labelsAndData.data[i],
                ])}
            />
        );
    }

    return (
        <ChartCard
            title={chartTitle}
            maxWidth={100}
            chartDiv={loaded ? BarGraph : loadingDiv}
            chartInfo={chartInfoText}
            chartTable={loaded ? chartTable : false}
            chartCardId={`cc-${meeting._id}-${chartTitle.replace(' ', '-')}`} // eslint-disable-line no-underscore-dangle
        />
    );
};

export default BarChart;
