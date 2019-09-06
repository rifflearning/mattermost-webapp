// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import {Recommendation} from './Recommendation';

const Header = styled.div.attrs({
    className: 'recommendations-view-header',
})`
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 2rem;
`;

const Container = styled.div.attrs({
    className: 'recommendations-view',
})`
    width: 40%;
    height: 100%;
    float: right;

    @media(max-width: 1020px) {
      height: auto;
      float: none;
      width: 100%;
    }
`;

/* ******************************************************************************
 * RecommendationsView                                                     */ /**
 *
 * React component to render course connection recommendations.
 *
 ********************************************************************************/
class RecommendationsView extends React.Component {
    static propTypes = {

        /** An array of Recommendation objects*/
        recommendations: PropTypes.array,
    };

    render() {
        // Filter recommendations, only returning ones where shouldDisplay() === true
        // Sort recommendations by displayPriority (descending)
        // Render only the first 3
        // Display as Recommendation components
        return (
            <Container id='recommendations-view'>
                <Header>{'Riff Recommends'}</Header>
                {this.props.recommendations.filter((recommendation) => {
                    return (recommendation.shouldDisplay());
                }).sort((a, b) => {
                    return (b.displayPriority() - a.displayPriority());
                }).slice(0, 3).map((recommendation) => {
                    return (
                        <Recommendation
                            recommendation={recommendation}
                            key={recommendation.id}
                        />
                    );
                })}
            </Container>
        );
    }
}

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    RecommendationsView,
};
