// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" } }],
    "react/jsx-max-props-per-line": ["error", { "when": "multiline" }],
    "no-underscore-dangle": ["error", { "allow": [ "_id" ] }],
 */

import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch} from 'react-router-dom';
import classNames from 'classnames';

import Navbar from 'components/navbar';
import WebRtcIdentifierRouter from 'components/webrtc_layout/webrtc_identifier_router';

export default class WebRtc extends React.PureComponent {
    static propTypes = {
        lhsOpen: PropTypes.bool,
        rhsOpen: PropTypes.bool.isRequired,
        rhsMenuOpen: PropTypes.bool.isRequired,
    };

    render() {
        return (
            <div
                key='inner-wrap'
                className={classNames('inner-wrap', 'channel__wrap', {
                    'move--right': this.props.lhsOpen,
                    'move--left': this.props.rhsOpen,
                    'move--left-small': this.props.rhsMenuOpen,
                })}
            >
                <div className='row header'>
                    <div id='navbar'>
                        <Navbar/>
                    </div>
                </div>
                <div className='row main'>
                    <Switch>
                        <Route
                            path={'/:team/:identifier/video/:videoId'}
                            component={WebRtcIdentifierRouter}
                        />
                    </Switch>
                </div>
            </div>
        );
    }
}
