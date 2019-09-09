// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import {getRecommendations} from 'utils/riff/recommendations';
import {getCourseStartTime} from 'utils/riff/recommendations/time';
import {MAX_REC_DISPLAY_NUMBER} from 'utils/riff/recommendations/recs';
import {logger} from 'utils/riff';

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
    width: 35%;
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

        /** An array of learning groups that the current user is a member of */
        userLearningGroups: PropTypes.array,

        /** The id of the current user */
        currentUserId: PropTypes.string.isRequired,

        /** The id of the currently selected MM team */
        currentTeamId: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);

        this.updateRecommendations = this.updateRecommendations.bind(this);
        this.shouldUpdateRecommendations = this.shouldUpdateRecommendations.bind(this);
        this.state = {recommendations: []};
    }

    /**
     * Determines whether or not we need to update the recommendations
     * based on if props have changed
     *
     * The recommendations should be updated if the user ID changes,
     * the team ID changes, or if the userLearningGroups array changes
     * The first two are unlikely (impossible?) to happen
     * userLearningGroups however is likely to change on the user's first visit
     * to the dashboard
     */
    shouldUpdateRecommendations(prevProps) {
        return (
            prevProps.currentUserId !== this.props.currentUserId ||
            prevProps.currentTeamId !== this.props.currentTeamId ||
            prevProps.userLearningGroups.length !== this.props.userLearningGroups.length ||
            prevProps.userLearningGroups.some(
                (element, index) => this.props.userLearningGroups[index] !== element
            )
        );
    }

    async updateRecommendations() {
        try {
            const startTime = await getCourseStartTime();

            logger.debug(`RecommendationsView.updateRecommendations: course start time is ${new Date(startTime).toUTCString()}`);

            const allRecs = getRecommendations(
                this.props.currentUserId,
                this.props.currentTeamId,
                this.props.userLearningGroups,
                startTime,
            );

            const recsToDisplayInOrder = allRecs
                .filter((rec) => rec.shouldDisplay())
                .sort((a, b) => b.displayPriority() - a.displayPriority())
                .slice(0, MAX_REC_DISPLAY_NUMBER);

            logger.debug('RecommendationsView.updateRecommendations: recommendations to display', {recsToDisplayInOrder});

            this.setState({recommendations: recsToDisplayInOrder});
        }
        catch (e) {
            // Report and swallow the error (not sure what else to do w/ it)
            logger.error('RecommendationsView.updateRecommendations: Updating failed w/ exception', e);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.shouldUpdateRecommendations(prevProps)) {
            this.updateRecommendations();
        }
    }

    render() {
        const recommendations = this.state.recommendations.map((rec) => (
            <Recommendation
                recommendation={rec}
                key={rec.name}
            />
        ));

        return (
            <Container id='recommendations-view'>
                <Header>{'Riff Recommends'}</Header>
                {recommendations}
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
