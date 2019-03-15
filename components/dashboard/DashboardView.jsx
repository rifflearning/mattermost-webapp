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
import styled from 'styled-components';
import {ScaleLoader} from 'react-spinners';

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
    color: #4A4A4A;
    font-size: 28px;
`;

// TODO Add dispatch and click

// All dispatches were ripped out re-copy back in once server is working

const DashboardView = (props) => {
    logger.debug('only loading:', props.numLoadedMeetings, 'Meetings');
    const meetingVisualizations = props.meetings.slice(0, props.numLoadedMeetings).map((m) => {
        return (
            <MeetingViz
                key={m._id}
                meeting={m}
                allMeetings={props.meetings}
                maybeLoadNextMeeting={props.maybeLoadNextMeeting}
                user={props.user}
            />
        );
    });
    const component = () => {
        //errored (catch all static message is shown, these errors are all related to having no meetings)
        if (props.loadingError.status) {
            return (
                <LoadingErrorMessage>
                    <div>{'Welcome to your Riff Dashboard!'}</div>
                    <br/>
                    <div>{'Once you have a Riff video meeting,'}</div>
                    <div>{'your Riff stats will display here.'}</div>
                </LoadingErrorMessage>
            );
        }

        //loading, until first meeting's stats are loaded (the above loadingError has also not loaded yet)
        if (props.statsStatus[0] !== 'loaded') {
            return (
                <div
                    className='columns has-text-centered is-centered is-vcentered'
                    style={{minHeight: '80vh', minWidth: '80vw'}}
                >
                    <ScaleLoader color='#8A6A94'/>
                </div>
            );
        }

        //meetings
        if (props.meetings.length > 0) {
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
};

export default DashboardView;
