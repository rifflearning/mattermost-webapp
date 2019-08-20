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

import WebRtcView from 'components/webrtc_view_bulma/index';

export default class WebRtcIdentifierRouter extends React.PureComponent {
    static propTypes = {

        /*
         * Object from react-router
         */
        match: PropTypes.shape({
            params: PropTypes.shape({
                identifier: PropTypes.string.isRequired,
                team: PropTypes.string.isRequired,
                videoId: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,

        actions: PropTypes.shape({
            onWebRtcByIdentifierEnter: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);
        this.props.actions.onWebRtcByIdentifierEnter(props);
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (this.props.match.params.team !== nextProps.match.params.team ||
            this.props.match.params.identifier !== nextProps.match.params.identifier) {
            this.props.actions.onWebRtcByIdentifierEnter(nextProps);
        }
    }

    render() {
        return <WebRtcView/>;
    }
}
