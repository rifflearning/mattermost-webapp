// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4plugins_forceDirected from '@amcharts/amcharts4/plugins/forceDirected'; // eslint-disable-line camelcase

import {InteractionContext, UserInContext} from 'utils/riff/user_analytic_utils';

import {
    cmpObjectProp,
    getColorForLearningGroup,
    logger,
    networkGraphNodeColors as nodeColors,
} from 'utils/riff';

import ChartCard from '../ChartCard';

const addTestUsersToPlg = 0;// Testing --- remove later
const addTestUsersToCapstone = 0;// Testing --- remove later
const addTestUsersToCourse = 0;// Testing --- remove later

// Store all constants to be used throughout the graph
// Keep all magic numbers in one place for ease of future alteration
const graphConfigurationValues = {
    outerCircleStrokeWidth: 3, // Width in pixels of the secondary cirle around nodes with children
    minNodeRadius: 6, // Minimum pixel radius for nodes
    graphCenterStrength: 0.2, // Determines the strength of attraction of nodes to the center of the graph
    maxGraphCenterStrength: 2, // Maximum graphCenterStrength
    manyBodyStrength: -30, // Determines the strength of attaction between each node (negative pushes away and positive attracts)
    maxManyBodyStrength: -10, // Maximum manyBodyStrength
    nodeLinkWidth: 2, // Pixel width of links
    nodeLinkOpacity: 1, // Default opacity of links
    youNode: {
        nodeLabel: { // Configuration for the label on the 'You' node
            fontSize: '14',
            fontWeight: 'bold',
            fill: nodeColors.you.fontColor,
        },
        nodeWidth: 2, // The relative width of the 'You' node
    },
    userNodes: {
        uncontactedNodeOpacity: 0.3, // Opacity of nodes for group members which you had no contact with
        uncontactedLinkOpacity: 0, // Opacity of node links for group members which you had no contact with
        nodeWidth: 1, // The relative width of user nodes
        linkDistance: 1, // The relative distance between user nodes and their parent
        minWeightingFactor: 0.3, // The minimum factor by which the quantity of nodes will reduce values
    },
    interactionContextNodes: {
        nodeWidth: 2.2, // The relative width of secondary nodes
        linkDistance: 2, // The relative distance between secondary nodes and their parent
        minWeightingFactor: 0.3, // The minimum factor by which the quantity of nodes will reduce values
    },
};

/* ******************************************************************************
 * CourseConnectionsView                                                   */ /**
 *
 * React component to render a network graph to visualise this user's interactions
 * in the selected Mattermost team (course).
 *
 ********************************************************************************/
class CourseConnectionsView extends React.Component {
    static propTypes = {

        /** An array of user interactions in the current MM team that the current user was involved in */
        userInteractions: PropTypes.array,

        /** An array of learning groups that the current user is a member of */
        userLearningGroups: PropTypes.array,

        /** An array of all potential learning group types in this MM team (course) */
        learningGroupTypes: PropTypes.array,

        /** A boolean denoting whether or not the user interactions request has completed successfully */
        isUserInteractionsLoaded: PropTypes.bool.isRequired,

        /** An object containing details about the current user */
        currentUser: PropTypes.object.isRequired,

        /** The id of the currently selected MM team */
        currentTeamId: PropTypes.string.isRequired,

        /** Used to fetch user interactions data for the current user and selected MM team */
        fetchUserInteractions: PropTypes.func,
    };

    /**
     * Description of this chart that is presented to the user via the ChartCard info button
     * @type {string}
     */
    static chartInfo =
        'This metric shows how many times you\'ve connected with members of your group(s) ' +
        'and other people in the course. Connections are a total of your posts, direct ' +
        'messages, mentions, replies, and reactions in Riff.\n' +
        '\n' +
        'Learners who engage with their peers are more likely to complete the course, ' +
        'and have higher grades.';

    constructor(props) {
        super(props);

        this.chart = null;
        this.series = null;
        this.sortedLearningGroupTypes = [];

        // amchart adapter handler function needs to be bound to this
        this.getChartNodeColor = this.getChartNodeColor.bind(this);
    }

    componentDidMount() {
        // Create the chart (attach to the div now mounted in the DOM, and do initial configuration)
        this.configureGraph();

        // Fetch user interactions data for the current user in the current MM team
        this.props.fetchUserInteractions(this.props.currentUser.id, this.props.currentTeamId);
    }

    componentDidUpdate() {
        if (this.props.isUserInteractionsLoaded) {
            // There may be no learning group types if the team is not for an LMS course
            if (this.props.learningGroupTypes) {
                // The sorting is done on the server in a later version
                // TODO: Remove once the newer version of the mm-server is in use
                this.sortedLearningGroupTypes = [...this.props.learningGroupTypes].sort(cmpObjectProp('prefix'));
            }
            else {
                this.sortedLearningGroupTypes = [];
            }

            logger.debug('CourseConnectionsView.didUpdate: drawing graph', this.props, this.sortedLearningGroupTypes);

            // Re-render the graph (this updates the DOM tree at the element w/ id='network-graph-div')
            this.drawGraph();
        }
    }

    componentWillUnmount() {
        if (this.chart) {
            this.chart.dispose();
            this.chart = null;
            logger.debug('CourseConnectionsView.willUnmount: disposed of chart');
        }
    }

    render() {
        const networkGraph = <div id='network-graph-div' style={{width: '100%', height: '100%'}}/>;

        return (
            <CourseConnectionWrapper>
                <ChartCard
                    title={'Course Interactions'}
                    chartDiv={networkGraph}
                    chartInfo={CourseConnectionsView.chartInfo}
                    chartTable={false}
                    chartCardId={'cc-network-graph'}
                    isNetworkGraphCard={true}
                />
            </CourseConnectionWrapper>

        );
    }

    /**
     * Initializes all the initial configurations for the graph and
     * places it in the DOM
     *
     * updates this.chart and this.series
     *
     * @returns {Object} containing a reference to the graph for adding nodes, etc
     */
    configureGraph() {
        // Hide am-charts logo (paid version)
        am4core.options.commercialLicense = true;

        // Create chart and place it inside the html element with id network-graph-div
        const chart = am4core.create('network-graph-div', am4plugins_forceDirected.ForceDirectedTree);
        this.chart = chart;

        // Create network graph (force directed chart)
        const series = chart.series.push(new am4plugins_forceDirected.ForceDirectedSeries());
        this.series = series;

        series.minRadius = graphConfigurationValues.minNodeRadius; // Minimum pixel radius for nodes
        series.centerStrength = graphConfigurationValues.graphCenterStrength; // Determines the strength of attraction of nodes to the center of the graph
        series.manyBodyStrength = graphConfigurationValues.manyBodyStrength; // Determines the strength of attaction between each node (negative pushes away and positive attracts)

        // Set up data fields
        // These datafields are used in each node's configuration
        series.dataFields.children = 'children'; // An array to store children of each node
        series.dataFields.value = 'nodeWidth'; // Determines the size of each node
        series.dataFields.name = 'nodeLabel'; // Determines the label on each node
        series.dataFields.fixed = 'fixed'; // Boolean determining whether a node's position should be fixed

        // Configure tooltips
        series.tooltip.getFillFromObject = false; // Don't use the color of the node as the background of the corresponding tooltip
        series.tooltip.configField = 'configTooltip'; // Use the configTooltip property in each node's configuration to the configure tooltips

        // Configure Nodes
        const nodeTemplate = series.nodes.template;
        nodeTemplate.configField = 'config'; // A configuration object for each node
        nodeTemplate.label.text = '{name}'; // Link to name property in node's configuration
        nodeTemplate.propertyFields.x = 'x'; // The 'x' position of a node, if position is fixed
        nodeTemplate.propertyFields.y = 'y'; // The 'y' position of a node, if position is fixed

        // Configure node links
        const linkTemplate = series.links.template;
        linkTemplate.strokeWidth = graphConfigurationValues.nodeLinkWidth; // Pixel width of links
        linkTemplate.strokeOpacity = graphConfigurationValues.nodeLinkOpacity; // Default opacity of links
        linkTemplate.configField = 'configLink'; // Use the configLink property in each node's configuration to the configure that node's links to its children
        linkTemplate.adapter.add('stroke', this.getChartNodeColor); // set the link color based on the node context type

        // Add the base 'you' node to the graph
        series.data = [this.getYouNode()];

        return series;
    }

    /**
     * Draw the graph w/ the latest interaction data
     */
    drawGraph() {
        const {userInteractions, userLearningGroups} = this.props;
        const learningGroupTypes = this.sortedLearningGroupTypes;

        // this will summarize the current user's overall context interactions for the 'you' node
        const currentUserOverallContext = new UserInContext({
            username: this.props.currentUser.username,
            contextType: 'you',
        });

        // Get a reference to the 'You' node
        const youNode = this.series.data[0];

        // Update the label on the 'You' node w/ the user interaction count
        youNode.nodeLabel = this.getNodeLabel({
            label: 'You',
            interactionCount: userInteractions ? userInteractions.length : 0,
        });

        // Remove any child nodes from the 'You' node (we'll add back any child nodes that
        // should still exist based on the current userInteractions)
        youNode.children = [];

        // If there are no user interactions for the current user, then return
        // Only the 'You' node will be shown
        if (!userInteractions) {
            return false;
        }

        // Now get the course interaction context and any learning group contexts
        // and add their chart node data as child nodes of the top level 'you' node.

        const courseContext = this.getCourseContext();

        // If the user has interactions in the course context then
        // add its node as a child of the 'you' node, otherwise we don't want to see it.
        if (courseContext) {
            youNode.children.push(courseContext.chartNodeData);
            currentUserOverallContext.addInteractionCounts(courseContext.getTypeAggregateTotals());
        }

        // This is a sanity check (assert) error log message
        // If the user is a member of a learning group, then there MUST be learning group types
        // otherwise something is amiss.
        if (userLearningGroups && userLearningGroups.length > 0 && !(learningGroupTypes && learningGroupTypes.length > 0)) {
            logger.error('NetworkGraphview.drawGraph: logic error: user is in a learning group but there are no learning group types!', this.props);
        }

        // If this user is a member of learning groups then create interaction contexts for
        // all of them.
        let learningGroupContexts = null;
        if (userLearningGroups && userLearningGroups.length > 0) {
            learningGroupContexts = this.getLearningGroupContexts();

            // Add all the learningGroupContext's nodes as children of the 'you' node
            for (const lgContext of Object.values(learningGroupContexts)) {
                youNode.children.push(lgContext.chartNodeData);
                currentUserOverallContext.addInteractionCounts(lgContext.getTypeAggregateTotals());
            }
        }

        // update the tooltip for the You node
        youNode.config.tooltipHTML = this.getUserTooltip(currentUserOverallContext);

        logger.debug('NetworkGraphview.drawGraph: interaction contexts', courseContext, learningGroupContexts);

        // get the user node count, and use it to weight the graph's manyBodyStrength
        const userNodeCount = this.getUserNodeCount(youNode.children);
        this.series.manyBodyStrength = this.getManyBodyStrength(userNodeCount);

        // use the number of secondary nodes to weight the graph's center strength
        this.series.centerStrength = this.getCenterStrength(youNode.children.length);

        // get a weighting factor for all secondary nodes, and apply to their node widths and parent link lengths
        const weightingFactor = this.getWeightingFactor(userNodeCount, graphConfigurationValues.interactionContextNodes.minWeightingFactor);
        youNode.children.forEach((secondaryNode) => {
            secondaryNode.nodeWidth = graphConfigurationValues.interactionContextNodes.nodeWidth * weightingFactor;
            secondaryNode.configLink = {
                ...secondaryNode.configLink,
                distance: graphConfigurationValues.interactionContextNodes.linkDistance * weightingFactor,
            };
        });

        // Force the chart to reload the data we just updated
        this.series.invalidateData();

        logger.debug('NetworkGraphview.drawGraph: you node', youNode);

        return false;
    }

    /**
     * Get the centerStrength property for the graph,
     * weighted by the total number of secondary nodes
     *
     * centerStrength: the relative strength with which all nodes are pulled
     *                 towards center of the chart.
     *
     * @param {number} nodeCount - the amount of secondary nodes on the graph
     *
     * @returns {number} the centerStrength value to be applied to the graph
     */
    getCenterStrength(nodeCount) {
        const maxCenterStrength = graphConfigurationValues.maxGraphCenterStrength;
        let centerStrength = graphConfigurationValues.graphCenterStrength + ((nodeCount - 1) * 0.3);
        centerStrength = centerStrength > maxCenterStrength ? maxCenterStrength : centerStrength;

        logger.debug('CourseConnectionsView.getCenterStrength:', centerStrength);
        return centerStrength;
    }

    /**
     * Get the manyBodyStrength property for the graph,
     * weighted by the total number of user nodes
     *
     * manyBodyStrength: the relative strength with which each node attracts
     *                   (positive value) or pushes away (negative value) other nodes.
     *
     * @param {number} userNodeCount - the amount of user nodes on the graph
     *
     * @returns {number} the manyBodyStrength value to be applied to the graph
     */
    getManyBodyStrength(userNodeCount) {
        const maxManyBodyStrength = graphConfigurationValues.maxManyBodyStrength;
        let manyBodyStrength = graphConfigurationValues.manyBodyStrength + (userNodeCount / 7);
        manyBodyStrength = manyBodyStrength > maxManyBodyStrength ? maxManyBodyStrength : manyBodyStrength;

        logger.debug('CourseConnectionsView.getManyBodyStrength:', manyBodyStrength);
        return manyBodyStrength;
    }

    /**
     * Counts the total number of user nodes in all interaction contexts
     *
     * @param {array} interactionContexts - containing interaction context objects
     *
     * @returns {number} the total number of user nodes
     */
    getUserNodeCount(interactionContexts) {
        let userNodeCount = 0;

        interactionContexts.forEach((interactionContext) => {
            userNodeCount += interactionContext.children.length;
        });

        return userNodeCount;
    }

    /**
     * Create a node configuration and generate an InteractionContext object for the course
     * Loop over all interactions that occurred in the course context and group them into
     * UserInContext objects for each user, counting the interaction types respectively
     *
     * @returns {?InteractionContext} containing the chart node data for the course node or
     *      null if there are no interactions and the node should not be displayed.
     */
    getCourseContext() {
        const contextType = 'course';
        const contextSlugName = 'course';
        const contextDisplayName = 'The Course';

        // Get user's interactions in the course context
        const courseInteractions = this.props.userInteractions.filter((interaction) => {
            return interaction.context === contextType;
        });

        if (courseInteractions.length === 0) {
            return null;
        }

        const interactionCount = courseInteractions.length;

        const nodeConfig = {
            nodeLabel: this.getNodeLabel({
                label: contextType,
                interactionCount,
            }),
            color: this.getNodeColor({nodeContext: contextType}),
            nodeWidth: graphConfigurationValues.interactionContextNodes.nodeWidth,
            configLink: {
                distance: graphConfigurationValues.interactionContextNodes.linkDistance,
            },
            nodeInfo: {
                contextType,
            },
        };

        const courseContext = new InteractionContext({
            slugName: contextSlugName,
            displayName: contextDisplayName,
            type: contextType,
            chartNodeData: this.prepareNode(nodeConfig),
        });

        // Add each interaction to the appropriate user's interaction type count
        // or if it's a post to the current user post count for the course context
        courseContext.addInteractions(courseInteractions);

        // Get a weighting factor for the course's user nodes
        const weightingFactor = this.getWeightingFactor(Object.keys(courseContext.users).length + addTestUsersToCourse, graphConfigurationValues.userNodes.minWeightingFactor);

        // Add a node for every user in the course interaction context
        for (const userInContext of courseContext) {
            courseContext.chartNodeData.children.push(this.prepareUserNode(userInContext, weightingFactor));
        }

        // Testing --- remove later
        for (let i = 0; i < addTestUsersToCourse; i++) {
            const username = Math.random().toString(36).slice(-5);
            courseContext.chartNodeData.children.push(this.prepareUserNode(new UserInContext({username, contextType: 'course'}), weightingFactor));
        }

        // Add a tooltip for the course node
        courseContext.chartNodeData.config.tooltipHTML = this.getContextTooltip(courseContext);

        return courseContext;
    }

    /**
     * Create an InteractionContext for the given learningGroup
     */
    getLearningGroupContext(learningGroup) {
        const contextType = learningGroup.learning_group_prefix;
        const contextSlugName = learningGroup.channel_slug_name;
        const contextDisplayName = learningGroup.channel_display_name;

        // Get user's interactions in this learning group's context
        const lgInteractions = this.props.userInteractions.filter((interaction) => {
            return interaction.channel_slug_name === contextSlugName;
        });

        const interactionCount = lgInteractions.length;

        // Create node configuration object for this learning group's node
        const nodeConfig = {
            nodeLabel: this.getNodeLabel({
                label: contextType,
                interactionCount,
            }),
            color: this.getNodeColor({nodeContext: contextType}),
            nodeWidth: graphConfigurationValues.interactionContextNodes.nodeWidth,
            nodeInfo: {
                contextType,
                contextSlugName,
            },
            configLink: {
                distance: graphConfigurationValues.interactionContextNodes.linkDistance,
            },
        };

        const lgInteractionContext = new InteractionContext({
            slugName: contextSlugName,
            displayName: contextDisplayName,
            type: contextType,
            chartNodeData: this.prepareNode(nodeConfig),
        });

        // Ensure that a UserInContext record exists for all members of this learning group
        // (we want a record even if there are no interactions w/ the user so we can display
        // a node w/ 0 interactions in the graph)
        if (learningGroup.members) {
            lgInteractionContext.addUsers(learningGroup.members.map((m) => m.username), contextType === 'plg' ? addTestUsersToPlg : addTestUsersToCapstone);
        }

        // Add each interaction to the appropriate user's interaction type count
        // or if it's a post to the current user post count for the learning group context
        lgInteractionContext.addInteractions(lgInteractions);

        // Get a weighting factor for this interaction context's user nodes
        const weightingFactor = this.getWeightingFactor(Object.keys(lgInteractionContext.users).length + (contextType === 'plg' ? addTestUsersToPlg : addTestUsersToCapstone), graphConfigurationValues.userNodes.minWeightingFactor);

        // Add a node for every user in this learning group context
        for (const userInContext of lgInteractionContext) {
            lgInteractionContext.chartNodeData.children.push(this.prepareUserNode(userInContext, weightingFactor));
        }

        // Add a tooltip for this interaction context's node
        lgInteractionContext.chartNodeData.config.tooltipHTML = this.getContextTooltip(lgInteractionContext);

        return lgInteractionContext;
    }

    /**
     * Generate and return an interaction context object for each learning group
     *     1. Loop over all learning groups and generate a node config and InteractionContext for each learning group
     *     3. Loop over all interactions that occurred in each learning group and group them into
     *        UserInContext objects for each user, counting the interaction types respectively
     *     4. Loop over members of this group, and if you haven't already added a UserInContext object
     *        for a user, which indicates you haven't interacted with them in this context, add a UserInContext for them
     *
     * @returns {Object<InteractionContext>} containing an InteractionContext object for each
     *      learning group and its users, keys are channel slug names
     */
    getLearningGroupContexts() {
        const learningGroupContexts = {};

        for (const learningGroup of this.props.userLearningGroups) {
            const lgInteractionContext = this.getLearningGroupContext(learningGroup);

            // Add the interaction context to the map of learning group contexts indexed by channel name
            learningGroupContexts[learningGroup.channel_slug_name] = lgInteractionContext;
        }

        return learningGroupContexts;
    }

    /**
     * Get a factor by which node widths and link lengths will be decreased
     * based on the number of users
     * Max factor is 1, and the minimum factor is passed as a parameter
     *
     * @param {number} numUsers - the amount of relevant user nodes
     * @param {number} minFactor - the minimum factor to return
     *
     * @returns {number} the weighting factor
     */
    getWeightingFactor(numUsers, minFactor) {
        let weightingFactor = 1 - (numUsers / 30);
        weightingFactor = weightingFactor < minFactor ? minFactor : weightingFactor;

        logger.debug('CourseConnectionsView.getWeightingFactor:', weightingFactor);
        return weightingFactor;
    }

    /**
     * Prepares the 'You' node
     *
     * @returns {Object} containing a node configuration for the 'You' node
     */
    getYouNode() {
        return {
            nodeLabel: this.getNodeLabel({label: 'You', interactionCount: 0}),
            nodeWidth: graphConfigurationValues.youNode.nodeWidth,
            config: {
                outerCircle: {
                    stroke: nodeColors.you.backgroundColor,
                    strokeWidth: graphConfigurationValues.outerCircleStrokeWidth,
                },
                circle: {
                    fill: nodeColors.you.backgroundColor,
                    stroke: nodeColors.you.backgroundColor,
                },
                label: graphConfigurationValues.youNode.nodeLabel,
            },
            children: [],
            nodeInfo: {
                contextType: 'you',
            },
            configTooltip: {
                background: {
                    fill: nodeColors.you.backgroundColor,
                },
                label: {
                    fontSize: graphConfigurationValues.youNode.nodeLabel.fontSize,
                    fill: nodeColors.you.fontColor,
                },
            },
            fixed: true,
            x: am4core.percent(50),
            y: am4core.percent(50),
        };
    }

    /**
     * Prepares the tooltip for an interaction context's node
     *
     * @param {InteractionContext} context - containing interaction counts for this context
     *
     * @returns {string} containing html for the context node tooltip
     */
    getContextTooltip(context) {
        /* eslint-disable no-multi-spaces */
        const interactionCounts = context.getTypeAggregateTotals();
        const counts = [
            {label: 'Reactions', value: interactionCounts.getCount('Reaction')},
            {label: 'Replies',   value: interactionCounts.getCount('Reply')},
            {label: 'Mentions',  value: interactionCounts.getCount('Mention')},
            {label: 'Posts',     value: interactionCounts.getCount('Post')},
        ];

        if (context.type === 'course') {
            counts.push({label: 'Direct Messages', value: interactionCounts.getCount('DirectMessage')});
        }

        return  CourseConnectionsView.getTooltip(context.displayName, counts);
        /* eslint-enable no-multi-spaces */
    }

    /**
     * Prepares the tooltip for a user's node
     *
     * @param {UserInContext} user - containing interaction counts for a user's node
     *
     * @returns {string} containing html for the user node tooltip
     */
    getUserTooltip(user) {
        /* eslint-disable no-multi-spaces */
        const counts = [
            {label: 'Reactions', value: user.getInteractionCount('Reaction')},
            {label: 'Replies',   value: user.getInteractionCount('Reply')},
            {label: 'Mentions',  value: user.getInteractionCount('Mention')},
        ];

        if (user.contextType === 'you') {
            counts.push({label: 'Posts', value: user.getInteractionCount('Post')});
        }

        if (['course', 'you'].includes(user.contextType)) {
            counts.push({label: 'Direct Messages', value: user.getInteractionCount('DirectMessage')});
        }

        return CourseConnectionsView.getTooltip(`@${user.username}`, counts);
        /* eslint-enable no-multi-spaces */
    }

    /**
     * Get the html for a tooltip w/ a name followed by a set of labeled
     * interaction counts.
     *
     * @param {string} name
     * @param {Array<{label: string, value: number}> counts
     *
     * @returns {string} tooltip html
     */
    static getTooltip(name, counts) {
        const getCountDiv = (count) => {
            return `<div>${count.label}: ${count.value}</div>`;
        };

        const nameDiv = `<div style='font-weight:bold;'>${name}</div>`;

        const html =
            '<div style=\'text-align: center;\'>' +
                `${nameDiv}${counts.map(getCountDiv).join('')}` +
            '</div>';

        return html;
    }

    /**
     * Create the data object for a user node in the chart.
     */
    prepareUserNode(userInContext, weightingFactor) {
        // Configuration for this user's node
        const contextType = userInContext.contextType;
        const interactionCount = userInContext.getInteractionAggregate();
        let fillOpacity;
        let strokeOpacity;
        if (contextType !== 'course' && interactionCount === 0) {
            strokeOpacity = graphConfigurationValues.userNodes.uncontactedLinkOpacity;
            fillOpacity = graphConfigurationValues.userNodes.uncontactedNodeOpacity;
        }

        const userNodeConfig = {
            nodeLabel: this.getNodeLabel({interactionCount}),
            color: this.getNodeColor({nodeContext: contextType}),
            nodeWidth: graphConfigurationValues.userNodes.nodeWidth * weightingFactor,
            config: {
                tooltipHTML: this.getUserTooltip(userInContext),
            },
            configLink: {
                strokeOpacity,
                distance: graphConfigurationValues.userNodes.linkDistance * weightingFactor,
            },
            configCircle: {
                fillOpacity,
            },
            nodeInfo: {
                contextType,
            },
        };

        return this.prepareNode(userNodeConfig);
    }

    /**
     * Prepares the configuration object for a node
     *
     * @param {string} nodeLabel - text to be displayed on the node
     * @param {Object} color - containing backgroundColor and fontColor properties for this node
     * @param {number} nodeWidth - the relative width of this node
     * @param {Object} config - containing node configuration settings specific to this node
     * @param {Object} configLink - containing link configuration settings specific to this node
     * @param {Object} configCircle - containing circle configuration settings specific to this node (ex. opacity)
     * @param {Object} nodeInfo - containing information used to identify this node
     *
     * @returns {Object} containing the node configuration
     */
    prepareNode({nodeLabel, color, nodeWidth, config, configLink, configCircle, nodeInfo}) {
        const node = {
            nodeInfo,
            nodeLabel,
            nodeWidth,
            config: {
                ...config,
                label: {
                    valign: 'auto',
                    fontSize: '12',
                    fontWeight: 'bold',
                    fill: color.fontColor,
                    truncate: true,
                },
                outerCircle: {
                    stroke: color.backgroundColor,
                    strokeWidth: graphConfigurationValues.outerCircleStrokeWidth,
                },
                circle: {
                    ...configCircle,
                    fill: color.backgroundColor,
                    stroke: color.backgroundColor,
                },
            },
            configLink: {
                ...configLink,
                fill: color.backgroundColor,
                stroke: color.backgroundColor,
            },
            configTooltip: {
                background: {
                    fill: color.backgroundColor,
                },
                label: {
                    fontSize: '14',
                    fill: color.fontColor,
                },
            },
            children: [],
        };

        return node;
    }

    /**
     * Prepares the label for a node
     *
     * @param {string} label - some text to show on the node
     * @param {number} interactionCount - the aggregate interaction count for this node
     *
     * @returns {string} label for a node
     */
    getNodeLabel({label, interactionCount}) {
        return `${label ? `${label} \n ` : ''}${interactionCount}`;
    }

    /**
     * Get the color to be used for a node, node link, or node label
     *
     * @param {string} nodeContext
     *      the interaction context in which to fetch a color for
     *
     * @param {string | undefined} colorUsage
     *      indicating the specific usage for this color request (enum('backgroundColor','fontColor'))
     *
     * @returns {{backgroundColor: string, fontColor: string} | string} a color object
     *      with properties backgroundColor, and fontColor, or the value of one of those properties
     */
    getNodeColor({nodeContext, colorUsage}) {
        let nodeColor;

        /* eslint-disable indent, no-negated-condition */
        switch (nodeContext) {
            case 'you':
                nodeColor = nodeColors.you;
                break;

            case 'course':
                nodeColor = nodeColors.course;
                break;

            default: {
                let indexOfLearningGroup = this.sortedLearningGroupTypes.findIndex((t) => t.prefix === nodeContext);
                indexOfLearningGroup = indexOfLearningGroup !== -1 ? indexOfLearningGroup : 0;
                nodeColor = getColorForLearningGroup(indexOfLearningGroup);
                break;
            }
        }
        /* eslint-enable indent, no-negated-condition */

        if (colorUsage) {
            return nodeColor[colorUsage];
        }

        return nodeColor;
    }

    /**
     * amchart adapter function to return the color for a node.
     * (will need to have 'this' bound to be passed as an adapter handler)
     *
     * Setting up the 'stroke' adapter with this handler  'stroke' adapterSets the colors for the node links
     * Unfortunately this seems to be the only way to set the colors for
     * node links.
     * Uses the nodeInfo.contextType property of the data bound to the node
     * to determine the color to return.
     */
    getChartNodeColor(stroke, node) {
        // Node isn't setup yet, return
        if (!node.dataItem.dataContext) {
            return false;
        }

        const nodeInfo = node.dataItem.dataContext.nodeInfo;

        const colorConfig = {
            nodeContext: nodeInfo.contextType,
            colorUsage: 'backgroundColor',
        };

        return am4core.color(this.getNodeColor(colorConfig));
    }
}

const CourseConnectionWrapper = styled.div.attrs({
    id: 'course-connections-wrapper',
})`
    width: 55%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;

    @media(max-width: 1020px) {
      position: relative;
      height: 70vh;
      width: 100%;
      margin-bottom: 2rem;
    }
`;

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    CourseConnectionsView,
};
