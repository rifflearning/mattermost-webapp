// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import sizeMe from 'react-sizeme';
import styled from 'styled-components';
import Waypoint from 'react-waypoint';
import moment from 'moment';
import _ from 'underscore';

import {
    loadMeetingData,
} from 'actions/views/dashboard';

import {logger} from 'utils/riff';

import {getIsRhsOpen} from 'selectors/rhs';

import TurnChart from './TurnChart';
import InfluenceChart from './InfluenceChart';
import TimelineChart from './TimelineChart';

const MeetingHeader = styled.h3.attrs({
    className: 'meeting-header',
})`
    font-weight: bold;
    padding-bottom: .5rem;
`;

const getMeetingIndex = (meetings, meetingId) => {
    const meetingIds = _.pluck(meetings, '_id');
    return _.indexOf(meetingIds, meetingId);
};

const formatMeetingDuration = (meeting) => {
    if (meeting === null) {
        return '';
    }

    // support showing data on in progress meeting by giving them a fake end time of now
    if (!meeting.endTime) {
        meeting = {...meeting, endTime: new Date()};
    }

    const diff = moment(new Date(meeting.endTime)).diff(moment(new Date(meeting.startTime)), 'minutes');
    return `${diff} minutes`;
};

const mapStateToProps = (state, ownProps) => {
    const {lti, dashboard, riff} = state.views;
    const riffState = {...lti, ...dashboard, ...riff};
    const meetingId = ownProps.meeting._id;
    const idx = getMeetingIndex(dashboard.meetings, meetingId);
    logger.debug('meeting for this viz is:', riffState.meetings[idx]);
    logger.debug('timeline for this viz is:', idx, dashboard.timelineData[idx]);
    return {
        processedUtterances: dashboard.processedUtterances[idx],
        influenceData: dashboard.influenceData[idx],
        timelineData: dashboard.timelineData[idx],
        selectedMeetingDuration: formatMeetingDuration(dashboard.meetings[idx]),
        loaded: dashboard.statsStatus[idx] === 'loaded',
        rhsOpen: getIsRhsOpen(state),
    };
};

const mapDispatchToProps = (dispatch) => ({
    loadMeetingData: (uid, meetingId) => {
        dispatch(loadMeetingData(uid, meetingId));
    },
});

const Header = (props) => {
    logger.debug('HEADER props:', props);
    const meetingDate = moment(props.meeting.startTime).format('M/D/Y, h:mm A');
    return (
        <div
            className=''
            style={{
                paddingBottom: '2rem',
                paddingTop: '2rem',
            }}
        >
            <MeetingHeader>{'Meeting Metrics'}</MeetingHeader>
            <span>{meetingDate}</span>
            <span>{`, Attendees: ${props.processedUtterances.length}, `}</span>
            <span>{`Duration: ${props.selectedMeetingDuration}`}</span>
            <div className='column is-half has-text-left'/>
        </div>
    );
};

Header.propTypes = {
    meeting: PropTypes.object.isRequired,
    processedUtterances: PropTypes.array.isRequired,
    selectedMeetingDuration: PropTypes.string,
};

class MeetingViz extends React.Component {
    static propTypes = {
        user: PropTypes.object.isRequired,
        allMeetings: PropTypes.array.isRequired,
        size: PropTypes.shape({
            height: PropTypes.number,
            width: PropTypes.number,
        }),
        loaded: PropTypes.bool.isRequired,
        meeting: PropTypes.object.isRequired,
        selectedMeetingDuration: PropTypes.string,
        processedUtterances: PropTypes.array.isRequired,
        influenceData: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.object,
        ]),
        timelineData: PropTypes.object.isRequired,

        loadMeetingData: PropTypes.func.isRequired,
        maybeLoadNextMeeting: PropTypes.func,
    };

    static defaultProps = {
        processedUtterances: [],
        influenceData: {},
        timelineData: {},
    };

    shouldComponentUpdate(nextProps /*, nextState*/) {
        let shouldUpdate = false;

        if (nextProps.size.width > 0 && this.props.size.width !== nextProps.size.width) {
            logger.debug('size changed');
            shouldUpdate = true;
        }

        if (this.props.loaded !== nextProps.loaded) {
            logger.debug('loaded changed');
            shouldUpdate = true;
        }

        logger.debug('DEBUG Should update?: ', shouldUpdate);
        return shouldUpdate;
    }

    constructor(props) {
        super(props);
        this.state = {};

        // only load if the data hasn't been loaded yet.
        // NEW: waypoint should take care of this for us.
        // if (!this.props.loaded) {
        //     props.loadMeetingData(props.user.id, props.meeting._id);
        // }
        this.loadThisAndMaybeMore = this.loadThisAndMaybeMore.bind(this);
    }

    loadThisAndMaybeMore({event}) {
        if (!this.props.loaded) {
            logger.debug('NOT loaded, waypoint loading this meeting...', event);
            this.props.loadMeetingData(this.props.user.id,
                                       this.props.meeting._id);
            this.props.maybeLoadNextMeeting(this.props.meeting._id, this.props.allMeetings);
        }
    }

    render() {
        return (
            <Waypoint onEnter={this.loadThisAndMaybeMore}>
                <div>
                    <Header {...this.props}/>
                    <div
                        className='columns is-centered'
                        style={{marginLeft: '2rem', marginRight: '1rem'}}
                    >
                        <div
                            className='column'
                            style={{paddingBottom: '0px'}}
                        >
                            <div className={`columns is-centered is-hidden-touch ${this.props.rhsOpen ? 'is-hidden' : ''}`}>
                                <div className='column is-centered has-text-centered'>
                                    <TurnChart
                                        processedUtterances={this.props.processedUtterances}
                                        loaded={this.props.loaded}
                                        participantId={this.props.user.id}
                                        meeting={this.props.meeting}
                                    />
                                </div>
                                <div className='column is-centered' >
                                    <InfluenceChart
                                        influenceType={'mine'}
                                        processedInfluence={this.props.influenceData}
                                        loaded={this.props.loaded}
                                        participantId={this.props.user.id}
                                        meeting={this.props.meeting}
                                    />
                                </div>
                                <div className='column is-centered' >
                                    <InfluenceChart
                                        influenceType={'theirs'}
                                        processedInfluence={this.props.influenceData}
                                        loaded={this.props.loaded}
                                        participantId={this.props.user.id}
                                        meeting={this.props.meeting}
                                    />
                                </div>
                            </div>
                            <div className={`columns is-multiline is-centered ${this.props.rhsOpen ? '' : 'is-hidden-desktop'}`}>
                                <div className={`column has-text-centered is-centered is-full-tablet ${this.props.rhsOpen ? 'is-full' : ''}`}>
                                    <TurnChart
                                        processedUtterances={this.props.processedUtterances}
                                        loaded={this.props.loaded}
                                        participantId={this.props.user.id}
                                        meeting={this.props.meeting}
                                    />
                                </div>

                                <div className='column'>
                                    <div className='columns is-multiline is-hidden-mobile'>
                                        <div className='column is-half has-text-centered is-centered'>
                                            <InfluenceChart
                                                influenceType={'mine'}
                                                processedInfluence={this.props.influenceData}
                                                loaded={this.props.loaded}
                                                participantId={this.props.user.id}
                                                meeting={this.props.meeting}
                                            />
                                        </div>
                                        <div className='column is-half has-text-centered is-centered'>
                                            <InfluenceChart
                                                influenceType={'theirs'}
                                                processedInfluence={this.props.influenceData}
                                                loaded={this.props.loaded}
                                                participantId={this.props.user.id}
                                                meeting={this.props.meeting}
                                            />
                                        </div>
                                    </div>
                                    <div className='columns is-multiline is-hidden-tablet'>
                                        <div className='column has-text-centered is-centered'>
                                            <InfluenceChart
                                                influenceType={'mine'}
                                                processedInfluence={this.props.influenceData}
                                                loaded={this.props.loaded}
                                                participantId={this.props.user.id}
                                                meeting={this.props.meeting}
                                            />
                                        </div>
                                        <div className='column has-text-centered is-centered'>
                                            <InfluenceChart
                                                influenceType={'theirs'}
                                                processedInfluence={this.props.influenceData}
                                                loaded={this.props.loaded}
                                                participantId={this.props.user.id}
                                                meeting={this.props.meeting}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div
                                className='section'
                                style={{padding: '0px'}}
                            >
                                <div className='columns is-centered'>
                                    <div className='column is-centered has-text-centered'>
                                        <TimelineChart
                                            processedTimeline={this.props.timelineData}
                                            loaded={this.props.loaded}
                                            meeting={this.props.meeting}
                                            participantId={this.props.user.id}
                                            width={this.props.size.width}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Waypoint>
        );
    }
}

export default sizeMe({monitorWidth: true})(connect(mapStateToProps, mapDispatchToProps)(MeetingViz));
