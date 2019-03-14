// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" } }],
 */

import React from 'react';
import styled from 'styled-components';
import MaterialIcon from 'material-icons-react';
import lifecycle from 'react-pure-lifecycle';
import {withReducer} from 'recompose';

import {logger} from 'utils/riff';

const CardTitle = styled.div.attrs({
    className: 'title is-5 has-text-left',
})`
    margin-left: 1rem;
    margin-right: 1rem;
    color: rgb(138, 106, 148);

    button {
        background: none;
        border: none;
    }
`;

const ChartDiv = styled.div.attrs({
    className: 'card-image has-text-centered is-centered',
})`
    padding-bottom: 1rem;
    .sigma-scene: {
        left: 0px;
    }
`;

const widthCard = (maxWidth) => {
    logger.debug('setting max width to:', maxWidth + 'vw');
    const Card = styled.div.attrs({
        className: 'card has-text-centered is-centered',
    })`
        display: flex;
        flex-direction: column;
        padding: 1rem;
        max-width: ${(/*props*/) => maxWidth + 'vw'};
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    `;
    return Card;
};

const ChartInfo = styled.p.attrs({
    className: 'has-text-weight-bold is-size-6',
})`
    padding: 2rem;
    color: #fff;
`;

const INFO_CLICKED = 'INFO_CLICKED';
const chartCardReducer = (isInfoOpen, action) => {
    switch (action.type) {
    case INFO_CLICKED:
        return !isInfoOpen;
    default:
        return isInfoOpen;
    }
};

const enhance = withReducer('isInfoOpen', 'dispatch', chartCardReducer, false);

// we use redraw here for pure d3 charts (like the TimelineChart)
// since we need a way to redraw when this component re-renders/updates.
const componentDidUpdate = (props) => {
    if (props.redraw) {
        props.redraw();
    }
};

const methods = {
    componentDidUpdate,
};

//const ChartCard = ({chartDiv, title, maxWidth}) => {
const ChartCard = enhance((props) => {

    const chartInfoClicked = () => {
      props.dispatch({type: INFO_CLICKED});
      //need to use timeout, because div is not in DOM yet
      setTimeout(() => {
        document.getElementById(`chart-info-${props.meetingId}-${props.title}`).focus();
      },100)
    }

    const chartInfoClosed = () => {
      props.dispatch({type: INFO_CLICKED});
      //need to use timeout, won't throw error without, since div exists, but other elements take focus priority if not using timeout
      setTimeout(() => {
        document.getElementById(`chart-info-btn-${props.meetingId}-${props.title}`).focus();
      },100)
    }

    const ChartInfoDiv = styled.div.attrs({
        tabIndex: '-1',
        id: `chart-info-${props.meetingId}-${props.title}`,
    })`
        position: absolute;
        top: 0px;
        left: 0px;
        height: 100%;
        width: 100%;
        background-color: rgba(171, 69, 171, 0.9);
        z-index: 1;

        button {
            background: none;
            border: none;
        }
    `;

    const mw = props.maxWidth ? props.maxWidth : 25;
    const Card = widthCard(mw + 2);
    logger.debug('chart div:', props.chartDiv);
    return (
        <Card>
            <CardTitle>
                {props.title}
                <span
                    className='has-text-right'
                    style={{float: 'right'}}
                >
                    <button
                        onClick={chartInfoClicked}
                        aria-describedby={`chart-info-${props.meetingId}-${props.title}`}
                        id={`chart-info-btn-${props.meetingId}-${props.title}`}
                    >
                        <MaterialIcon icon='info'/>
                    </button>
                </span>
            </CardTitle>
            {props.isInfoOpen && (
                <ChartInfoDiv meetingId={props.meetingId}>
                    <span
                        className='has-text-right'
                        style={{float: 'right'}}
                    >
                        <button
                            onClick={chartInfoClosed}
                        >
                            <MaterialIcon icon='close'/>
                        </button>
                    </span>
                    <ChartInfo>{props.chartInfo}</ChartInfo>
                </ChartInfoDiv>
            )}
            <ChartDiv>
                {props.chartTable}
                {props.chartDiv}
            </ChartDiv>
        </Card>
    );
});

export default lifecycle(methods)(ChartCard);
