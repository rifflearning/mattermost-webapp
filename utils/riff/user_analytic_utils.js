// Copyright (c) 2019-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// Riff Learning lint overrides
/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" }, "ObjectExpression": "first" }],
    "react/jsx-max-props-per-line": ["error", { "when": "multiline" }],
    "no-underscore-dangle": ["error", { "allow": [ "_id" ] }],
    "generator-star-spacing": ["error", { "before": false, "after": true, "method": "neither" } ],
*/

/** Enumeration of all possible user interaction types */
const InteractionTypes = [
    'Reaction',
    'Mention',
    'DirectMessage',
    'Reply',
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
        this.name = config.name;
        this.type = config.type;
        this.chartNodeData = config.chartNodeData;

        /**
         * map by username of interactions that user had with the current user
         * in this interaction context.
         * @type {Object<UserInContext>}
         */
        this.users = {};
    }

    /**
     * Count all the interaction records by incrementing the appropriate
     * UserInContext record (creating one if it doesn't exist) in the
     * users map.
     *
     * @param {Array} interactions
     *      Array of interaction records in the specified context
     *      to be added to the current counts.
     */
    addUserInteractions(interactions) {
        // Add each interaction to the appropriate UserInContext instance
        for (const interaction of interactions) {
            const username = interaction.username;
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
 * @property {string} name
 *      a name for this context (is the channel slug name or 'course')
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

        // initialize the interaction map
        /* eslint-disable-next-line brace-style, max-statements-per-line */
        this.interactionMap = InteractionTypes.reduce((map, type) => { map[type] = 0; return map; }, {});
    }

    /**
     * Get the interaction count of the specified type of interaction.
     */
    getInteractionCount(type) {
        return this.interactionMap[type];
    }

    /**
     * Get the aggregate count of all interactions.
     */
    getInteractionAggregate() {
        return Object.values(this.interactionMap).reduce((a, b) => a + b);
    }

    /**
     * Increment the interaction count of the specified type of interaction.
     */
    incInteractionCount(type) {
        this.interactionMap[type]++;
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

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    InteractionTypes,
    InteractionContext,
    UserInContext,
};
