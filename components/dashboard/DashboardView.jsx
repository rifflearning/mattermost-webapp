// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import $ from 'jquery';

import * as UserAgent from 'utils/user_agent.jsx';
import {logger} from 'utils/riff';

import MeetingViz from './components/MeetingViz';

const LoadingErrorMessage = styled.div.attrs({
    className: 'loading-error-message',
})`
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%,-50%);
    text-align: center;
    color: #4a4a4a;
    font-size: 28px;
`;

// TODO Add dispatch and click

// All dispatches were ripped out re-copy back in once server is working

/* ******************************************************************************
 * DashboardView                                                           */ /**
 *
 * React component to present the Riff Metrics for meetings the user attended
 *
 ********************************************************************************/
class DashboardView extends React.Component {
    static propTypes = {

        /** riffdata authorization token */
        riffAuthToken: PropTypes.string,

        /** The current mattermost user */
        user: PropTypes.object.isRequired,

        /** The list of meeting objects to be presented */
        meetings: PropTypes.arrayOf(PropTypes.object).isRequired,

        /** The number of meetings to display in the scrolling list */
        numMeetingsToDisplay: PropTypes.number.isRequired,

        /** ??? I'm not sure what the value signifies -mjl 2019-09-02 */
        shouldFetch: PropTypes.bool.isRequired,

        /** ??? */
        loadingError: PropTypes.object.isRequired,

        /** function to set up the connection to the riffdata server if it doesn't exist yet */
        authenticateRiff: PropTypes.func.isRequired,

        /** function to load the meetings for a particular user (it had better be the current user) */
        loadRecentMeetings: PropTypes.func.isRequired,

        /** ??? */
        maybeLoadNextMeeting: PropTypes.func.isRequired,
    };

    /* **************************************************************************
     * componentDidMount                                                   */ /**
     *
     * Lifecycle method of a React component.
     * This is invoked immediately after a component is mounted (inserted into the
     * tree). Initialization that requires DOM nodes should go here.
     *
     * Load the user's list of meetings. As this may be a time consuming operation
     * we wait until this page is mounted and we know that the list is actually
     * needed.
     *
     * @see {@link https://reactjs.org/docs/react-component.html#componentdidmount|React.Component.componentDidMount}
     */
    componentDidMount() {
        if (this.props.riffAuthToken) {
            logger.debug(`DashboardView.didMount: going to load recent meetings for ${this.props.user.id}`);
            this.props.loadRecentMeetings(this.props.user.id);
        }

        $('body').addClass('app__body');

        // IE Detection
        if (UserAgent.isInternetExplorer() || UserAgent.isEdge()) {
            $('body').addClass('browser--IE');
        }
    }

    componentDidUpdate() {
        if (this.props.riffAuthToken && this.props.shouldFetch) {
            this.props.loadRecentMeetings(this.props.user.id);
        }
    }

    /**
     * TODO: remove this functionality from here. I'm not sure why it has to be here anyway -mjl 2019-09-02
     */
    UNSAFE_componentWillMount() { // eslint-disable-line camelcase
        logger.debug('DashboardView.willMount: user:', this.props.user);
        if (!this.props.riffAuthToken) {
            this.props.authenticateRiff();
        }
    }

    // componentWillUnmount() {
    //     $('body').removeClass('app__body');
    // }

    /* **************************************************************************
     * render                                                              */ /**
     *
     * Required method of a React component.
     * @see {@link https://reactjs.org/docs/react-component.html#render|React.Component.render}
     */
    render() {
        logger.debug(`DashboardView.render: only loading: ${this.props.numMeetingsToDisplay} Meetings`);
        const meetingVisualizations = this.props.meetings.slice(0, this.props.numMeetingsToDisplay).map((m) => {
            return (
                <MeetingViz
                    key={m._id}
                    meeting={m}
                    allMeetings={this.props.meetings}
                    maybeLoadNextMeeting={this.props.maybeLoadNextMeeting}
                    user={this.props.user}
                />
            );
        });

        const component = () => {
            //errored (catch all static message is shown, these errors are all related to having no meetings)
            if (this.props.loadingError.status) {
                return (
                    <LoadingErrorMessage>
                        <div>{'Welcome to your Riff Dashboard!'}</div>
                        <br/>
                        <div>{'Once you have a Riff video meeting,'}</div>
                        <div>{'your Riff stats will display here.'}</div>
                    </LoadingErrorMessage>
                );
            }

            //meetings
            if (this.props.meetings.length > 0) {
                return (
                    <div style={{overflowY: 'scroll'}}>
                        {meetingVisualizations}
                    </div>
                );
            }

            //default
            return false;
        };

        return (
            <div className='app__content'>
                {component()}
            </div>
        );
    }
}

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    DashboardView,
};
