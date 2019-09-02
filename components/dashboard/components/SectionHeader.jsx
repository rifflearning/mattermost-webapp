// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Title = styled.div`
font-size: ${(props) => {
        return props.mainHeader ? '40px' : '32px';
    }};
font-weight: bold;
`;

const Desc = styled.div`
font-size: ${(props) => {
        return props.mainHeader ? '20px' : '16px';
    }};
`;

const Hr = styled.hr`
height: 3px;
background: #4a4a4a;
`;

/* ******************************************************************************
 * SectionHeader                                                           */ /**
 *
 * React component to render a title and description for a section in the
 * dashboard.
 *
 ********************************************************************************/
class SectionHeader extends React.Component {
    static propTypes = {

        /** A title for this dashboard section */
        title: PropTypes.string.isRequired,

        /** A multi-line description for this dashboard section */
        desc: PropTypes.string.isRequired,

        /** Denotes whether to increase size of text and place horizontal line at bottom */
        mainHeader: PropTypes.bool,
    };

    render() {
        return (
            <div>
                <Title mainHeader={this.props.mainHeader}>{this.props.title}</Title>
                <Desc mainHeader={this.props.mainHeader}>{this.props.desc}</Desc>
                {this.props.mainHeader && <Hr/>}
            </div>
        );
    }
}

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    SectionHeader,
};
