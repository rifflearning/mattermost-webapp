// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" } }],
 */

import React from 'react';
import PropTypes from 'prop-types';
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
    const chartInfoClosed = () => {
        props.dispatch({type: INFO_CLICKED});

        // need to use timeout, won't throw error without, since div exists, but other
        // elements take focus priority if not using timeout
        setTimeout(() => {
            document.getElementById(`chart-info-btn-${props.chartCardId}`).focus();
        }, 100);
    };

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
                        onClick={() => props.dispatch({type: INFO_CLICKED})}
                        aria-describedby={`chart-info-${props.chartCardId}`}
                        id={`chart-info-btn-${props.chartCardId}`}
                        tabIndex='-1'
                    >
                        <MaterialIcon icon='info'/>
                    </button>
                </span>
            </CardTitle>
            {props.isInfoOpen && (
                <ChartInfoDiv
                    id={`chart-info-${props.chartCardId}`}
                    close={chartInfoClosed}
                    chartInfo={props.chartInfo}
                />
            )}
            <ChartDiv>
                {props.chartTable}
                {props.chartDiv}
            </ChartDiv>
        </Card>
    );
});

class ChartInfoDiv extends React.Component {
    static propTypes = {

        /** Unique string to use as the id attribute for the component */
        id: PropTypes.string.isRequired,

        /** Handler to call to stop displaying the ChartInfo */
        close: PropTypes.func.isRequired,

        /** Description of what the chart shows */
        chartInfo: PropTypes.string.isRequired,
    }

    componentDidMount() {
        this.ChartInfoDiv.focus();
    }
    render() {
        return (
            <div
                id={this.props.id}
                className='chart-info-div'
                ref={(ref) => {
                    this.ChartInfoDiv = ref;
                }}
                tabIndex='-1'
            >
                <span
                    className='has-text-right'
                    style={{float: 'right'}}
                >
                    <button
                        onClick={this.props.close}
                    >
                        <MaterialIcon icon='close'/>
                    </button>
                </span>
                <ChartInfo>{this.props.chartInfo}</ChartInfo>
            </div>
        );
    }
}

export default lifecycle(methods)(ChartCard);
