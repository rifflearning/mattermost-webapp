// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {
    Sigma,
    RandomizeNodePositions,
    RelativeSize,
    EdgeShapes,
    NodeShapes,
} from 'react-sigma';
import ForceLink from 'react-sigma/lib/ForceLink';
import _ from 'underscore';

import {logger} from 'utils/riff';

import ChartCard from './ChartCard';

const peerColors = ['#f56b6b', '#128EAD', '#7caf5f', '#f2a466'];

const addColorsToData = (networkData, participantId) => {
    logger.debug(networkData);
    const otherNodes = _.map(
        _.filter(networkData.nodes, (n) => n.id !== participantId),
        (n, idx) => {
            return {
                ...n,
                color: peerColors[idx],
            };
        }
    );
    logger.debug('other nodes:', otherNodes, 'length:', otherNodes.length);

    // const participantNode = {id: participantId, color: colorYou};
    // otherNodes.push(participantNode);

    return {
        ...networkData,
        nodes: otherNodes,
    };
};

const addLabelsToData = (networkData, participantId) => {
    const newNodes = _.map(networkData.nodes, (n) => {
        if (n.id === participantId) {
            return {
                ...n,
                label: 'You',
            };
        }
        return n;
    });

    return {
        ...networkData,
        nodes: newNodes,
    };
};

const chartInfo =
    'This network graph represents who you are most likely to speak after. \
A stronger connection to another person in your meeting means you are likely paying more \
attention to what they have to say.';

const NetworkChart = ({processedNetwork, participantId, networkStatus}) => {
    if (networkStatus === 'loading') {
        return (<p>{'Loading..'}</p>);
    }

    logger.debug('data for network:', processedNetwork);
    let annotatedNetwork = addColorsToData(processedNetwork, participantId);
    annotatedNetwork = addLabelsToData(annotatedNetwork, participantId);

    const Network = (
        <Sigma
            graph={annotatedNetwork}
            renderer='canvas'
            style={{
                width: '24.8vw',
                height: '25vw',
            }}
            settings={{
                drawEdges: true,
                clone: false,
                maxNodeSize: 20,
                minNodeSize: 20,
                minEdgeSize: _.min(annotatedNetwork.edges, (e) => {
                    return e.size;
                }).size,
                maxEdgeSize: _.max(annotatedNetwork.edges, (e) => {
                    return e.size;
                }).size,
                defaultEdgeColor: 'rgb(243, 108,	110)',
                defaultNodeColor: '#bdc3c7',
            }}
        >
            <RelativeSize initialSize={10}/>
            <EdgeShapes default='curvedArrow'/>
            <NodeShapes
                default='circle'
                borderColor='#FF3333'
            />
            <ForceLink
                background={true}
                easing='cubicInOut'
            />
            <RandomizeNodePositions/>
        </Sigma>
    );

    return (
        <ChartCard
            title='Influence'
            chartDiv={Network}
            chartInfo={chartInfo}
        />
    );
};

export default NetworkChart;
