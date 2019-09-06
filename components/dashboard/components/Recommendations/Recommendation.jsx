// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    "react/require-optimization": "off",
    multiline-ternary: ["error", "always-multiline"],
*/

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import FontAwesome from 'react-fontawesome';

const Container = styled.div.attrs({
    className: 'recommendation-container',
})`
    overflow: hidden;
    margin-bottom: 2rem;
`;

const IconWrapper = styled.div.attrs({
    className: 'recommendation-icon-wrapper',
})`
    border: 3px solid ${(props) => {
        return props.color;
    }};
    background: ${(props) => {
        return props.background ? props.background : '';
    }};
    border-radius: 1.8rem;
    width: 1.8rem;
    height: 1.8rem;
    float: left;
    text-align: center;
    display: table;
    float: left;

    .fa {
        vertical-align: middle;
        display: table-cell;
    }
`;

const Text = styled.div.attrs({
    className: 'recommendation-text',
})`
    font-size: 15px;
    width: calc(95% - 1.8rem);
    float: right;
`;

/* ******************************************************************************
 * Recommendation                                                          */ /**
 *
 * React component to render a course connection recommendation.
 *
 ********************************************************************************/
class Recommendation extends React.Component {
    static propTypes = {

        /** A Recommendation object containing a course connection recommendation*/
        recommendation: PropTypes.object,
    };

    render() {
        return (
            <Container>
                {this.props.recommendation.isCompleted() ?
                    <IconWrapper
                        color='#009e0f'
                    >
                        <FontAwesome
                            name='check'
                            style={{color: '#009e0f'}}
                        />
                    </IconWrapper> :
                    <IconWrapper
                        color='#4a4a4a'
                        background='#cccccc'
                    >
                        <FontAwesome
                            name='plus'
                            style={{color: '#4a4a4a'}}
                        />
                    </IconWrapper>
                }
                <Text>{this.props.recommendation.displayText}</Text>
            </Container>
        );
    }
}

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    Recommendation,
};
