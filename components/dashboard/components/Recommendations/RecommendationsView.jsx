// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import {MAX_REC_DISPLAY_NUMBER, RecommendationBase} from 'utils/riff/recommendations';
import {app, logger} from 'utils/riff';

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
 * When this component is instantiated the recommendations are updated and
 * some set of those are displayed. The recommendations that are displayed
 * are also logged.
 * We don't refresh the recommendations until a new RecommendationsView is
 * instantiated.
 *
 ********************************************************************************/
class RecommendationsView extends React.Component {
    static propTypes = {

        /** An array of recommendations to be displayed */
        recommendations: PropTypes.arrayOf(PropTypes.instanceOf(RecommendationBase)),

        /** An array of learning groups that the current user is a member of */
        userLearningGroups: PropTypes.arrayOf(PropTypes.shape({
            learning_group_name: PropTypes.string.isRequired,
            learning_group_prefix: PropTypes.string.isRequired,
            channel_id: PropTypes.string.isRequired,
            channel_slug_name: PropTypes.string.isRequired,
            channel_display_name: PropTypes.string.isRequired,
            members: PropTypes.arrayOf(PropTypes.shape({
                id: PropTypes.string.isRequired,
                username: PropTypes.string.isRequired,
            })),
            has_left_group: PropTypes.bool.isRequired,
        })),

        /** The id of the current user */
        userId: PropTypes.string.isRequired,

        /** Function to update the recommendations */
        updateRecommendations: PropTypes.func.isRequired,
    };

    /* **************************************************************************
     * constructor                                                         */ /**
     *
     * RecommendationsView constructor
     */
    constructor(props) {
        super(props);

        // Make sure the recommendations are fresh and logged when this component is used.
        // We don't bother saving the returned promise, when the recommendations are
        // updated, the props will be updated and we'll re-render.
        this.updateRecommendations();
    }

    /* **************************************************************************
     * render                                                              */ /**
     *
     * Required method of a React component.
     * @see {@link https://reactjs.org/docs/react-component.html#render|React.Component.render}
     */
    render() {
        const recommendations = this.props.recommendations
            .slice(0, MAX_REC_DISPLAY_NUMBER)
            .map((rec) => (
                <Recommendation
                    recommendation={rec}
                    key={rec.recType}
                />
            ));

        return (
            <Container id='recommendations-view'>
                <Header>{'Riff Recommends'}</Header>
                {recommendations}
            </Container>
        );
    }

    /**
     * Update the recommendations and then log the updated recommendations
     */
    async updateRecommendations() {
        const recommendations = await this.props.updateRecommendations();

        // we use the recommendations from the async action rather than the props
        // because that way we can do this with the updated recommendations before
        // the redux state causes the props to be reloaded.
        // These recommendations have been initialized so their isComplete property
        // has been updated.
        this.logRecommendations(recommendations.slice(0, MAX_REC_DISPLAY_NUMBER));
    }

    /**
     * Logs the generated recommendations in riff-server
     */
    logRecommendations(recs) {
        // All recs have finished initializing, which means their isComplete property
        // is up-to-date.
        const logRecs = recs.map((r) => {
            // Recommendations now have a recType which should probably replace the
            // name property being logged now.
            return {
                name: r.description,
                isComplete: r.isComplete,
            };
        });
        const recLog = {
            participantId: this.props.userId,
            recommendations: logRecs,
        };

        try {
            logger.debug('RecommendationsView.logRecommendations: Logging recommendations', {recLog, timestamp: new Date()});
            app.service('recommendationLogs').create(recLog);
        }
        catch (e) {
            // Report and swallow the error (not sure what else to do w/ it)
            logger.error('RecommendationsView.logRecommendations: Creating the log record failed w/ exception', e);
        }
    }
}

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    RecommendationsView,
};
