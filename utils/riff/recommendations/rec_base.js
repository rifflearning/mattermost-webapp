// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {MAX_REC_DISPLAY_NUMBER} from './rec_constants';
import {getWeekNumber} from './time';

/**
 * internal contains all module internal values used by the exported
 * classes/functions defined in this module. This provides a way to
 * mock these values in unit tests of the exported functions.
 */
const internal = {
    getWeekNumber,
    MAX_REC_DISPLAY_NUMBER,
};

/* ******************************************************************************
 * RecommendationBase                                                      */ /**
 *
 * Abstract base class for all Recommendations.
 * A Recommendation describes some action the user should take because Riff
 * believes it will enhance their performance (e.g. make the meetings they attend
 * more productive, help them do better in a course...) based on information known
 * at the current time (such as if the user has had a riff video meeting, or how
 * many interactions in various channels they've had).
 *
 ********************************************************************************/
class RecommendationBase {
    /* **************************************************************************
     * constructor                                                         */ /**
     *
     * RecommendationBase class constructor.
     *
     * @param {!RecommendationBase.Config} config
     *      The settings to configure this RecommendationBase
     */
    constructor(config) {
        // instance properties

        /** Unique recommendation type identifier
         *  @type {string}
         */
        this.recType = config.recType;

        /** Short descriptive text describing this recommendation
         *  @type {string}
         */
        this.description = config.description;

        /** The week number (1-indexed) when this Recommendation should first be displayed.
         *  @type {number}
         */
        this.startWeek = config.startWeek;

        /** The total number of weeks, including the first one, to display the Recommendation.
         *  @type {number}
         */
        this.numWeeksToDisplay = config.numWeeksToDisplay;

        /** The priority of this recommendation relative to other recommendations with
         *  the same start week. (bigger = higher on page).
         *  @type {number}
         */
        this.priority = config.priority;

        /** The text displayed to the user regarding this Rec. May be a string or a react element
         *  @type {string | ReactElement}
         */
        this.displayText = config.displayText;

        /** Flag whether this instance has been initialized. @see RecommendationBase#initialize
         *  @type {?Promise<bool>}
         */
        this._isInitialized = null;

        /** backing store for isComplete property
         *  @type {bool}
         */
        this._isComplete = false;
    }

    /** readonly isInitialized property
     *  Will be null if initialize has not been called, and will be a Promise
     *  that will be fullfilled w/ the value true once initialization has finished.
     *  @type {?Promise<bool>}
     */
    get isInitialized() {
        return this._isInitialized;
    }

    /** readonly isComplete property
     *  true if the recommendation has been performed by the user, false if they
     *  haven't performed the recommendation (or this recommendation isn't
     *  initialized).
     *  @type {bool}
     */
    get isComplete() {
        return this._isComplete;
    }

    /* **************************************************************************
     * initialize                                                          */ /**
     *
     * Initialize this recommendation instance. Because a recommendation may
     * depend on asynchronous results before it has been initialized, this
     * method returns a promise also accessible via the isInitialized property.
     *
     * This base implementation needs no initialization it should be overridden
     * in derived classes which do require initialization.
     *
     * @param {function(): Object} getState - function which returns the redux state
     *
     * @returns {Promise<bool>} true if this recommendation has been initialized.
     */
    initialize(getState) {
        if (this._isInitialized === null) {
            this._isInitialized = this.doInitialization(getState);
        }

        return this._isInitialized;
    }

    /* **************************************************************************
     * doInitialization                                                    */ /**
     *
     * Does all initialization (possibly asynchronous) of this recommendation
     * instance.
     *
     * This base implementation calls and awaits the protected function checkIsComplete
     * to set the isComplete property. If more things need to be initialized this
     * method should be overridden in the derived class to do it.
     *
     * DevNote: This method exists so that the initialize method can set the
     * _isInitialized instance property to the same promise that it returns.
     * It should only be called by the base class initialize method.
     * @protected
     *
     * @param {function(): Object} getState - function which returns the redux state
     *
     * @returns {Promise<bool>} true if this recommendation has been initialized.
     */
    async doInitialization(getState) {
        await this.checkIsComplete(getState);
        return true;
    }

    /* **************************************************************************
     * checkIsComplete                                                     */ /**
     *
     * Tests if the current user has completed this recommendation, and sets
     * the {@link RecommendationBase#isComplete} property to reflect what is
     * determined.
     * This base implementation always sets the value to false.
     * This method should NOT be called if the recommendation is not
     * displayable see {@link shouldDisplay}.
     * Derived recommendations should override this implementation AND not
     * call it.
     * @protected
     *
     * @param {function(): Object} getState - function which returns the redux state
     *
     * @returns {Promise<bool>} true if the current user has completed this
     *      recommendation, false if they haven't
     */
    async checkIsComplete(/*getState*/) {
        this._isComplete = false;
        return this._isComplete;
    }

    /* **************************************************************************
     * shouldDisplay                                                       */ /**
     *
     * Determine whether the recommendation should be displayed based on
     * whether the display time is within the given range of weeks
     *
     * Does not depend on properties that need to be initialized.
     *
     * Override if there are other constraints on whether the recommendation is
     * displayable.
     */
    shouldDisplay(courseStartTime, displayTime) {
        const currentWeek = internal.getWeekNumber(courseStartTime, displayTime);
        const endWeek = this.startWeek + this.numWeeksToDisplay;
        return this.startWeek <= currentWeek && currentWeek < endWeek;
    }

    /* **************************************************************************
     * displayPriority                                                     */ /**
     *
     * Calculate the relative priority of this recommendation
     * based on the week it should be displayed and the provided
     * priority number
     *
     * Does not depend on properties that need to be initialized.
     */
    displayPriority() {
        return (this.startWeek * internal.MAX_REC_DISPLAY_NUMBER) + this.priority;
    }

    /* **************************************************************************
     * baseConfig (static)                                                 */ /**
     *
     * Copies the values of the standard properties defined on a recommendation
     * class to the returned object. This object can be pass to the
     * RecommendationBase constructor to initialize it.
     *
     * @param {Object} recClass
     *      The recommendation class whose properties should be copied
     *
     * @returns {RecommendationBase.Config}
     */
    static baseConfig(recClass) {
        // Copy the standard recommendation class property values to the
        // config object for this RecommendationBase
        const config = {
            recType:            recClass.recType,
            description:        recClass.description,
            startWeek:          recClass.startWeek,
            numWeeksToDisplay:  recClass.numWeeksToDisplay,
            priority:           recClass.priority,
            displayText:        recClass.displayText,
        };
        return config;
    }
}

/* ******************************************************************************
 * RecommendationBase.Config                                               */ /**
 *
 * The RecommendationBase.Config defines the object passed to the constructor that
 * contains options/values used to initialize an instance of a RecommendationBase.
 *
 * @typedef {!Object} RecommendationBase.Config
 *
 * @property {string} recType
 *      Unique recommendation type identifier.
 *
 * @property {string} description
 *      Short descriptive text describing this recommendation.
 *
 * @property {number} startWeek
 *      The week number (1-indexed) when this recommendation should first be displayed.
 *
 * @property {number} numWeeksToDisplay
 *      The total number of weeks, including the first one, to display the recommendation.
 *
 * @property {number} priority
 *      The priority of this recommendation relative to other recommendations with
 *      the same start week. (bigger = higher on page).
 *
 * @property {string | ReactElement} displayText
 *      The text displayed to the user regarding this recommendation.
 */

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    RecommendationBase,
    internal as _test,
};

