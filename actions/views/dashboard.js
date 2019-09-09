// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" } }]
 */

import _ from 'underscore';

import {DashboardActionTypes} from 'utils/constants.jsx';
import {
    app,
    cmpObjectProp,
    getDurationInSeconds,
    groupByPropertyValue,
    logger,
    mapObject,
    reverseCmp,
} from 'utils/riff';

export const loadMoreMeetings = () => {
    return {
        type: DashboardActionTypes.DASHBOARD_LOAD_MORE_MEETINGS,
    };
};

export const updateMeetingList = (meetings) => {
    return {
        type: DashboardActionTypes.DASHBOARD_FETCH_MEETINGS,
        status: 'loaded',
        meetings,
    };
};

export const selectMeeting = (meeting) => {
    return {
        type: DashboardActionTypes.DASHBOARD_SELECT_MEETING,
        meeting,
    };
};

export const setCourseStartTime = (courseStartTime) => {
    return {
        type: DashboardActionTypes.DASHBOARD_SET_COURSE_START_TIME,
        courseStartTime,
    };
};

export const loadRecentMeetings = (uid) => (dispatch) => {
    dispatch({
        type: DashboardActionTypes.DASHBOARD_LOADING_ALL_MEETINGS,
    });

    // set it to not re-fetch. This changes lastFetched to now
    // we re-set this after the following block of code.
    dispatch(updateMeetingList([]));

    return app
        .service('participants')
        .find({query: {_id: uid}})
        .then((res) => {
            if (res.data.length === 0) {
                // no found participants. Throw an error to break out early.
                throw new Error('no participant');
            }
            logger.debug('>>fetched participant:', res);
            return res.data[0];
        })
        .then((participant) => {
            return participant.meetings;
        })
        .then((meetingIds) => {
            return app.service('meetings').find({query: {_id: meetingIds}});
        })
        .then((allMeetingObjsForParticipant) => {
            logger.debug('raw meeting objects received:', allMeetingObjsForParticipant);
            const usefulMeetings = allMeetingObjsForParticipant.filter((m) => {
                //  any meeting "in progress" is useful
                if (!m.endTime) {
                    return true;
                }

                // meetings longer than 2 minutes are useful
                const durationSecs = getDurationInSeconds(m.startTime, m.endTime);
                return durationSecs > 2 * 60;
            });

            if (usefulMeetings.length === 0) {
                throw new Error('no useful meetings after filter');
            }

            // fetch data for first meeting
            return usefulMeetings;

            // dispatch(updateMeetingList(usefulMeetings));
        })
        .then((meetingObjects) => {
            const pEvents = meetingObjects.map((m) => {
                return app
                    .service('participantEvents')
                    .find({query: {meeting: m._id, $limit: 500}}); // eslint-disable-line no-underscore-dangle
            });
            return Promise.all(pEvents).then((vals) => {
                logger.debug('pevents in promise', vals);
                return {meetings: meetingObjects, pEvents: vals};
            });
        })
        .then(({meetings, pEvents}) => {
            // only return meetings that have over 1 participant.
            const numParticipants = pEvents.map((pe) => {
                return _.uniq(
                    _.flatten(
                        pe.data.map((p) => {
                            return p.participants;
                        })
                    )
                ).length;
            });

            // TODO: this will include meetings where someone joins but does not speak.
            // because we use the utterance data to inform our shit, the # of attendees will also be wrong.
            // right thing to do here is to try and create a service on the server that will reliably give
            // us # of attendees
            logger.debug('num participants:', numParticipants, meetings);
            const meetingsWithOthers = meetings.filter((m, idx) => {
                return numParticipants[idx] >= 2;
            });
            logger.debug('kept meetings:', meetingsWithOthers);
            if (meetingsWithOthers.length === 0) {
                throw new Error('no meetings after participants filter');
            }
            meetingsWithOthers.sort(reverseCmp(cmpObjectProp('startTime'))); // sort by descending time

            // limit to 10 to begin with
            //meetings = _.first(meetings, 2);

            dispatch(updateMeetingList(meetingsWithOthers));
            if (meetingsWithOthers.length > 0) {
                const newSelectedMeeting = meetingsWithOthers[0];
                logger.debug('meeting list is now:', meetingsWithOthers);
                logger.debug('selected meeting is:', meetingsWithOthers[0]._id); // eslint-disable-line no-underscore-dangle
                dispatch(selectMeeting(newSelectedMeeting));
                dispatch(loadMeetingData(uid, newSelectedMeeting._id)); // eslint-disable-line no-underscore-dangle
            }
        })
        .catch((err) => {
            if (err.message === 'no participant') {
                dispatch({
                    type: DashboardActionTypes.DASHBOARD_LOADING_ERROR,
                    status: true,
                    message:
                        'No meetings found. Meetings that last for over two minutes will show up here.',
                });
            } else if (err.message === 'no useful meetings after filter') {
                dispatch({
                    type: DashboardActionTypes.DASHBOARD_LOADING_ERROR,
                    status: true,
                    message:
                        "We'll only show meetings that lasted for over two minutes. Go have a riff!",
                });
            } else if (
                err.message === 'no meetings after nparticipants filter'
            ) {
                dispatch({
                    type: DashboardActionTypes.DASHBOARD_LOADING_ERROR,
                    status: true,
                    message:
                        'Only had meetings by yourself? Come back after some meetings with others to explore some insights.',
                });
            } else {
                logger.error("Couldn't retrieve meetings", err);

                //dispatch(loadRecentMeetings(uid));
            }
        });
};

const processUtterances = (utterances, meetingId) => {
//    logger.debug('processing utterances:', utterances);

    // {'participant': [utteranceObject, ...]}
    const participantUtterances = groupByPropertyValue(utterances, 'participant');

    // {'participant': number of utterances}
    const numUtterances = mapObject(participantUtterances, (val) => {
        return val.length;
    });
    const lengthUtterances = mapObject(participantUtterances, (val) => {
        return val.reduce((uSecs, u) => uSecs + getDurationInSeconds(u.startTime, u.endTime), 0);
    });

    // {'participant': mean length of utterances in seconds}
    const meanLengthUtterances = Object.keys(participantUtterances).reduce((meanU, k) => {
        meanU[k] = lengthUtterances[k] / numUtterances[k];
        return meanU;
    }, {});
    const participants = Object.keys(participantUtterances);

    const visualizationData = participants.map((participantId) => {
        return {

            //    name: participant['name'],
            participantId,
            lengthUtterances:
                participantId in lengthUtterances ?
                    lengthUtterances[participantId] :
                    0,
            numUtterances:
                participantId in numUtterances ?
                    numUtterances[participantId] :
                    0,
            meanLengthUtterances:
                participantId in meanLengthUtterances ?
                    meanLengthUtterances[participantId] :
                    0,
        };
    });

    logger.debug('viz data:', visualizationData);

    visualizationData.map((v) => {
        return Object.assign(v, {
            displayName: 'displayName',
            meetingId,
        });
    });

    // const promises = visualizationData.map((v) => {
    //     const docId = v.participantId + '_' + meetingId;
    //     const docRef = db.collection('meetings').doc(docId);
    //     return docRef.get().then((doc) => {
    //         return Object.assign(v, {
    //             displayName: doc.displayName,
    //             meetingId,
    //         });
    //     });
    // });
    //return Promise.all(promises);

    logger.debug('data returned:', visualizationData);
    return visualizationData;
};

export const processInfluence = (uid, utterances, meetingId) => { // eslint-disable-line no-unused-vars
    const participantUtterances = groupByPropertyValue(utterances, 'participant');
    const participants = Object.keys(participantUtterances);
    const sortedUtterances = utterances.slice().sort(cmpObjectProp('startTime'));

    let recentUttCounts = sortedUtterances.map((ut, idx) => {
        // get list of utterances within 2 seconds that are not by the speaker.
        const recentUtterances = sortedUtterances.slice(0, idx).filter((recentUt) => {
            const timeDiff = getDurationInSeconds(recentUt.endTime, ut.startTime);
            const recent = timeDiff < 3 && timeDiff > 0;
            const sameParticipant = ut.participant === recentUt.participant;
            return recent && !sameParticipant;
        });
        if (recentUtterances.length > 0) {
            return {
                participant: ut.participant,
                counts: _.countBy(recentUtterances, 'participant'),
            };
        }
        return false;
    });

    recentUttCounts = _.compact(recentUttCounts);
    logger.debug('recent utt counts:', recentUttCounts);

    // create object with the following format:
    // {participantId: {participantId: Count, participantId: Count, ...}}
    const aggregatedCounts = recentUttCounts.reduce((memo, ut) => {
        if (!(ut.participant in memo)) {
            memo[ut.participant] = {};
        }

        // update count object that's stored in memo, adding new
        // keys as we need to.
        // obj here should be an object of {participantId: nUtterances}
        const obj = memo[ut.participant];
        for (const [k, v] of Object.entries(ut.counts)) {
            if (k in obj) {
                obj[k] += v;
            } else {
                obj[k] = v;
            }
        }

        return memo;
    }, {});

    // limit to only the current user
    //aggregatedCounts = aggregatedCounts[uid];

    const finalEdges = [];
    for (const [mainParticipant, counts] of Object.entries(aggregatedCounts)) {
        for (const [participant2, cnt] of Object.entries(counts)) {
            const id = `e${finalEdges.length}`;
            const edge = {id, source: mainParticipant, target: participant2, size: cnt};
            finalEdges.push(edge);
        }
    }

    // filter any edges under 0.2 weight
    //finalEdges = _.filter(finalEdges, (e) => { return !(e.size < 0.1*sizeMultiplier); });

    const nodes = participants.map((p) => ({id: p}));
    nodes.sort(cmpObjectProp('id'));

    const barLabels = {};
    const promises = nodes.map((n) => {
        return app.service('participants').get(n.id)
            .then((res) => {
                barLabels[n.id] = res.name;
                return {
                    ...n,
                    label: res.name,
                };
            });
    });

    return Promise.all(promises).then(() => {
        finalEdges.forEach((e) => {
            e.targetName = barLabels[e.target];
            e.sourceName = barLabels[e.source];
        });
        return finalEdges;
    });
};

export const processTimeline = (uid, utterances, meetingId) => { // eslint-disable-line no-unused-vars
    const participantUtterances = groupByPropertyValue(utterances, 'participant');
    const utts = utterances.map((u) => {
        return {
            ...u,
            startDate: new Date(u.startTime),
            endDate: new Date(u.endTime),
            taskName: u.participant,
        };
    });

    utts.sort(cmpObjectProp('startTime'));

    const participantIds = Object.keys(participantUtterances);
    const otherParticipantIds = participantIds.filter((p) => (p !== uid));
    logger.debug('local uid:', uid);
    logger.debug('other participants:', otherParticipantIds);
    const promises = otherParticipantIds.map((p) => {
        return app
            .service('participants')
            .get(p)
            .then((res) => {
                return {name: res.name, id: p};
            });
    });

    const startTime = _.min(utts, (u) => {
        return u.startTime;
    });
    const endTime = _.max(utts, (u) => {
        return u.endTime;
    });

    return Promise.all(promises).then((participants) => {
        // add local participant
        const sortedParticipants = participants.slice(0).sort(cmpObjectProp('id'));
        sortedParticipants.unshift({name: 'You', id: uid});
        logger.debug('sending sorted participants:', sortedParticipants);
        return {
            utts,
            sortedParticipants,
            startTime,
            endTime,
        };
    });
};

export const loadMeetingData = (uid, meetingId) => (dispatch) => {
    logger.debug('loading meeting data:', uid, meetingId);
    dispatch({
        type: DashboardActionTypes.DASHBOARD_MEETING_LOAD_STATUS,
        status: 'loading',
        meetingId,
    });
    logger.debug('finding utterances for meeting', meetingId);
    return app
        .service('utterances')
        .find({query: {meeting: meetingId, $limit: 10000, stitch: true}})
        .then((utterances) => {
            logger.debug('>>>', meetingId, 'utterances', utterances);
            return {
                processedUtterances: processUtterances(utterances, meetingId),
                processedInfluence: processInfluence(uid, utterances, meetingId),
                processedTimeline: processTimeline(uid, utterances, meetingId),
            };
        })
        .then(({processedUtterances, processedInfluence, processedTimeline}) => {
            logger.debug(
                'utterances:',
                processedUtterances,
                'influence:',
                processedInfluence,
                'timeline:',
                processedTimeline
            );

            processedInfluence.then((influenceObj) => {
                dispatch({
                    type: DashboardActionTypes.DASHBOARD_FETCH_MEETING_INFLUENCE,
                    meetingId,
                    influenceData: influenceObj,
                });
            });

            const promises = processedUtterances.map((u) => {
                return app
                    .service('participants')
                    .get(u.participantId)
                    .then((res) => {
                        return {...u, name: res.name};
                    });
            });
            Promise.all(promises).then((processedUtterances) => {
                logger.debug('processed utterances:', processedUtterances, 'for meeting ID', meetingId);
                dispatch({
                    type:
                    DashboardActionTypes.DASHBOARD_FETCH_MEETING_UTTERANCES,
                    meetingId,
                    processedUtterances,
                });
            });

            // dispatch processed utterance (aggregated) data
            // processedUtterances.then((processedUtterances) => {
            //     const promises = _.map(processedUtterances, (u) => {
            //         return app.
            //             service('participants').
            //             get(u.participantId).
            //             then((res) => {
            //                 return {...u, name: res.name};
            //             });
            //     });
            //     Promise.all(promises).then((processedUtterances) => {
            //         logger.debug('processed utterances:', processedUtterances);
            //         dispatch({
            //             type:
            //                 DashboardActionTypes.DASHBOARD_FETCH_MEETING_STATS,
            //             status: 'loaded',
            //             processedUtterances,
            //         });
            //     });
            // });

            processedTimeline.then((processedTimeline) => {
                logger.debug('processed timeline:', processedTimeline);
                dispatch({
                    type: DashboardActionTypes.DASHBOARD_FETCH_MEETING_TIMELINE,
                    meetingId,
                    timelineData: processedTimeline,
                });
            });
        })
        .catch((err) => {
            // re-call load meeting here?
            logger.error("couldn't retrieve meeting data", err);
        });
};
