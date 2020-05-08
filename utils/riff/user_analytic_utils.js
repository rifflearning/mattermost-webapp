// Copyright (c) 2019-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// Riff Learning lint overrides
/* eslint
    header/header: "off",
    "brace-style": [ "error", "stroustrup", { "allowSingleLine": false } ],
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" }, "ObjectExpression": "first" }],
    "react/jsx-max-props-per-line": ["error", { "when": "multiline" }],
    "no-underscore-dangle": ["error", { "allow": [ "_id" ] }],
    "generator-star-spacing": ["error", { "before": false, "after": true, "method": "neither" } ],
*/

import {logger} from 'utils/riff';

/** Enumeration of all possible user interaction types */
const InteractionTypes = [
    'Reaction',
    'Mention',
    'DirectMessage',
    'Reply',
    'Post',
];

/* ******************************************************************************
 * InteractionContext                                                      */ /**
 *
 * An interaction context in which interactions took place (ex. the course
 * context, or a learning group context)
 *
 ********************************************************************************/
class InteractionContext {
    /**
     * InteractionContext class constructor.
     *
     * There is no default ctor which instantiates an InteractionContext
     * w/ default values when none are given.
     *
     * @param {!InteractionContext.Config} config
     *      The settings to configure this InteractionContext
     */
    constructor(config) {
        // instance properties
        this.slugName = config.slugName;
        this.displayName = config.displayName;
        this.type = config.type;
        this.chartNodeData = config.chartNodeData;

        /** count of the posts by the current user in this context */
        this.currentUserPostCount = 0;

        /**
         * map by username of interactions that user had with the current user
         * in this interaction context.
         * @type {Object<UserInContext>}
         */
        this.users = {};
    }

    /**
     * Get total interaction counts by type in this context, which is the sum
     * of all the user interaction counts and the current user's posts in
     * this context.
     *
     * DevNote: This calculates the totals every time it is called. That seems
     *      fine now, it isn't very expensive and it's currently called about
     *      twice per context created in the CourseConnectionsView.
     *
     * @return {InteractionCounts} object whose counts are the sum of all
     * the counts by type in this context.
     */
    getTypeAggregateTotals() {
        const totals = new InteractionCounts();
        totals.setCount('Post', this.currentUserPostCount);

        for (const userInContext of this) {
            totals.addCounts(userInContext.interactionCounts);
        }

        return totals;
    }

    /**
     * Count all the interaction records by incrementing the appropriate
     * UserInContext record (creating one if it doesn't exist) in the
     * users map for interactions w/ other users, and increment
     * this InteractionContext's current user post count for 'Post' interactions.
     *
     * @param {Array} interactions
     *      Array of interaction records in the specified context
     *      to be added to the current counts.
     */
    addInteractions(interactions) {
        // Add each interaction to the appropriate UserInContext instance
        for (const interaction of interactions) {
            const username = interaction.username;

            // If username is null, then this is a context-related interaction (ex. Post)
            if (!username) {
                // The only valid interaction type here is 'Post'
                if (interaction.interaction_type === 'Post') {
                    this.currentUserPostCount++;
                }
                else {
                    logger.error('InteractionContext: current user interaction_type is NOT "Post"', this, interaction);
                }

                continue;
            }

            let userInContext = this.users[username];
            if (!userInContext) {
                // first occurance of this user in this context, create a new UserInContext for them
                userInContext = new UserInContext({username, contextType: this.type});
                this.users[username] = userInContext;
            }

            userInContext.incInteractionCount(interaction.interaction_type);
        }
    }

    /**
     * Ensure that there is a UserInContext record in the users map
     * for the given usernames. Any new records created will have
     * interaction type counts of 0.
     *
     * @param {Array<string>} usernames
     *      Array of usernames that must exist in the users map
     */
    addUsers(usernames) {
        // undefined or null is the same as no usernames to add so just return
        if (!usernames) {
            return;
        }

        for (const username of usernames) {
            if (!(username in this.users)) {
                // username wasn't found, create a new UserInContext for them
                this.users[username] = new UserInContext({username, contextType: this.type});
            }
        }
    }

    /**
     * Make InteractionContext iterable over the defined users
     *
     * DevNote: This is a generator function with the property
     * name that makes instances of the class iterable.
     * see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators}
     */
    *[Symbol.iterator]() {
        for (const userInContext of Object.values(this.users)) {
            yield userInContext;
        }
    }
}

/* ******************************************************************************
 * InteractionContext.Config                                               */ /**
 *
 * The InteractionContext.Config defines the object passed to the constructor that
 * contains options/values used to initialize an instance of a InteractionContext.
 *
 * @typedef {!Object} InteractionContext.Config
 *
 * @property {string} slugName
 *      a name for this context (is the channel slug name or 'course')
 *
 * @property {string} displayName
 *      a display name for this context (is the channel display name or 'The Course')
 *
 * @property {string} type
 *      the type of context (learning group type's prefix or 'course')
 *
 * @property {Object} chartNodeData
 *      containing the node data for the node on the graph for this context
 *
 * @property {Object<UserInContext>} users
 *      containing the users to be displayed in this context (with usernames as keys)
 */

/* ******************************************************************************
 * UserInContext                                                           */ /**
 *
 * Interaction data for a user in a context (ex. in the course context)
 *
 ********************************************************************************/
class UserInContext {
    /**
     * UserInContext class constructor.
     *
     * @param {!UserInContext.Config} config
     *      The settings to configure this UserInContext
     */
    constructor(config) {
        // instance properties

        this.username = config.username;
        this.contextType = config.contextType;
        this.interactionCounts = new InteractionCounts();
    }

    // I'm keeping these methods to provide an abstraction layer instead of
    // having to access the interactionCounts property directly.

    /**
     * Get the interaction count of the specified type of interaction.
     */
    getInteractionCount(type) {
        return this.interactionCounts.getCount(type);
    }

    /**
     * Get the aggregate count of all interactions.
     */
    getInteractionAggregate() {
        return this.interactionCounts.getTotal();
    }

    /**
     * Increment the interaction count of the specified type of interaction.
     */
    incInteractionCount(type) {
        this.interactionCounts.inc(type);
    }

    /**
     * add the count of each type of interaction in the given interaction
     * counts object to the counts for this UserInContext.
     *
     * @param {InteractionCounts} otherInteractionCounts
     *      other counts by interaction type to be added to the counts in
     *      this UserInContext
     */
    addInteractionCounts(otherInteractionCounts) {
        this.interactionCounts.addCounts(otherInteractionCounts);
    }
}

/* ******************************************************************************
 * UserInContext.Config                                                    */ /**
 *
 * The UserInContext.Config defines the object passed to the constructor that
 * contains options/values used to initialize an instance of a UserInContext.
 *
 * @typedef {!Object} UserInContext.Config
 *
 * @property {string} username
 *      username of user
 *
 * @property {string} contextType
 *      context of the interactions with this user ('course' or a learning group
 *      type prefix)
 */

/* ******************************************************************************
 * InteractionCounts                                                       */ /**
 *
 * The InteractionCounts class keeps track of the counts of some set of
 * interactions by type.
 * On creation the count of every type of interaction is 0.
 *
 ********************************************************************************/
class InteractionCounts {
    /**
     * InteractionCounts class constructor.
     */
    constructor() {
        // instance properties

        // initialize the interaction count map to 0 for all interaction types
        /* eslint-disable-next-line brace-style, max-statements-per-line */
        this.interactionMap = InteractionTypes.reduce((map, type) => { map[type] = 0; return map; }, {});
    }

    /**
     * Get the sum of the count of all interaction types.
     *
     * @returns {number} sum of counts of all interaction types
     */
    getTotal() {
        return Object.values(this.interactionMap).reduce((a, b) => a + b);
    }

    /**
     * Get the current count of the given interaction type.
     *
     * @param {string} type - interaction type to get the count of
     *
     * @returns {number} count of interaction type
     */
    getCount(type) {
        return this.interactionMap[type];
    }

    /**
     * Get the current count of the given interaction type.
     *
     * @param {string} type - interaction type to get the count of
     * @param {number} count - new value for the count of the interaction type
     */
    setCount(type, count) {
        this.interactionMap[type] = count;
    }

    /**
     * Increment the count of the specified type of interaction.
     */
    inc(type) {
        this.interactionMap[type]++;
    }

    /**
     * Add the counts of another InteractionCounts object to the counts
     * in this one.
     *
     * @param {InteractionCounts} - the other InteractionsCounts to add
     */
    addCounts(otherInteractionCounts) {
        for (const type of InteractionTypes) {
            this.interactionMap[type] += otherInteractionCounts.interactionMap[type];
        }
    }
}

/* ******************************************************************************
 * getInteractionCountPhrase                                               */ /**
 *
 * get either the singular or plural summary phrase for
 * a given interaction type and count
 *
 * @param {string} type - An InteractionType, or 'aggregate'
 * @param {number} count - the number of interactions of this type
 *
 * @returns {string} a summary phrase for the interaction type and count.
 */
function getInteractionCountPhrase(type, count) {
    /* eslint-disable no-multi-spaces */
    const typePhrases = {
        Reply:          {singular: 'reply',             plural: 'replies'},
        Mention:        {singular: 'mention',           plural: 'mentions'},
        DirectMessage:  {singular: 'direct message',    plural: 'direct messages'},
        Reaction:       {singular: 'reaction',          plural: 'reactions'},
        Post:           {singular: 'post',              plural: 'posts'},
        aggregate:      {singular: 'contact',           plural: 'contacts'},
    };
    /* eslint-enable no-multi-spaces */

    const unknownTypePhrase = {singular: '', plural: ''};
    const typePhrase = typePhrases[type] || unknownTypePhrase;

    return `${count} ${count === 1 ? typePhrase.singular : typePhrase.plural}`;
}

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    InteractionTypes,
    InteractionCounts,
    InteractionContext,
    UserInContext,
    getInteractionCountPhrase,
};
