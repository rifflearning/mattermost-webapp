import React from 'react';
import PropTypes from 'prop-types';

import WebRtcView from 'components/webrtc_view_bulma/index';
import {onWebRtcByIdentifierRouter} from './actions';

export default class WebRtcIdentifierRouter extends React.PureComponent {
    static propTypes = {


        /*
         * Object from react-router
         */
        match: PropTypes.shape({
            params: PropTypes.shape({
                identifier: PropTypes.string.isRequired,
                team: PropTypes.string.isRequired,
                videoId: PropTypes.string.isRequired
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
