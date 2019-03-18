// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint header/header: "off", dot-location: ["error", "property"] */

import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import auth from '@feathersjs/authentication-client';
import io from 'socket.io-client';

// access to api

/* eslint-disable no-console, no-empty-function */
// Noop function to use for disabled log levels
const noopFn = () => {};

const infoLog = console.log.bind(window.console);
const warnLog = console.warn.bind(window.console);
const errorLog = console.error.bind(window.console);
/* eslint-enable no-console, no-empty-function */

/**
 * logger is a poor man's cheap logger for client code.
 *
 * It mostly just redirects to using the window console
 * log, EXCEPT it allows debug logging to be enabled or
 * disabled.
 *
 * By using this logger instead of console.log directly
 * we can more easily replace all logging with a fancier
 * logger package w/ more functionality at some later time
 * if desired.
 */
export const logger = {
    debug: infoLog,
    info: infoLog,
    warn: warnLog,
    error: errorLog,

    setLogLevel(level) {
        this.debug = noopFn;
        this.info = noopFn;
        this.warn = noopFn;
        this.error = noopFn;

        /* eslint-disable no-fallthrough */
        switch (level) {
        case 'debug':
            this.debug = infoLog;
        case 'info':
            this.info = infoLog;
        case 'warn':
            this.warn = warnLog;
        case 'error':
            this.error = errorLog;
        }
        /* eslint-enable no-fallthrough */
    },
};

// Default dataserver and signalmaster url and path values which work w/ the reverse proxy
export const config = {
    logLevel: 'debug',
    dataserverUrl: '/',
    dataserverPath: '/api/videodata',
    signalmasterUrl: '/',
    signalmasterPath: '/api/signalmaster',
};

// TODO: get the client log level from some real configuration sent from the server
const configLogLevel = process.env.CLIENT_ENV ? process.env.CLIENT_ENV.RIFF_LOGLEVEL : process.env.RIFF_LOGLEVEL;
config.logLevel = configLogLevel || 'info';
logger.setLogLevel(config.logLevel);

// TODO: get the data server url and path from some real configuration sent from the server
logger.debug('path envs:', process.env.CLIENT_ENV, process.env.RIFF_SERVER_PATH);
const configDataserverUrl = process.env.CLIENT_ENV ? process.env.CLIENT_ENV.RIFF_SERVER_URL : process.env.RIFF_SERVER_URL;
const configDataserverPath = process.env.CLIENT_ENV ? process.env.CLIENT_ENV.RIFF_SERVER_PATH : process.env.RIFF_SERVER_PATH;

const configSignalmasterUrl = process.env.CLIENT_ENV ? process.env.CLIENT_ENV.SIGNALMASTER_URL : process.env.SIGNALMASTER_URL;
const configSignalmasterPath = process.env.CLIENT_ENV ? process.env.CLIENT_ENV.SIGNALMASTER_PATH : process.env.SIGNALMASTER_PATH;

// override the defaults w/ the config values
/* eslint-disable no-negated-condition, no-undefined */
config.dataserverUrl = configDataserverUrl !== undefined ? configDataserverUrl : config.dataserverUrl;
config.dataserverPath = configDataserverPath !== undefined ? configDataserverPath : config.dataserverPath;
config.signalmasterUrl = configSignalmasterUrl !== undefined ? configSignalmasterUrl : config.signalmasterUrl;
config.signalmasterPath = configSignalmasterPath !== undefined ? configSignalmasterPath : config.signalmasterPath;
/* eslint-enable no-negated-condition, no-undefined */

logger.debug('data server socket:', {url: config.dataserverUrl, path: config.dataserverPath + '/socket.io'});

export const socket = io(config.dataserverUrl, {
    timeout: 20000,
    path: config.dataserverPath + '/socket.io',
    transports: [
        'websocket',
        'flashsocket',
        'htmlfile',
        'xhr-polling',
        'jsonp-polling',
    ],
});

export var app = feathers()
    .configure(socketio(socket))
    .configure(auth({jwt: {}, local: {}}));

/**
 * Returns an object whose properties are the values of the specified
 * property of the members of the given array. The value of those
 * properties is an array containing the members of the original
 * array with the property with that value.
 *
 * Replaces one use of the underscore package's groupBy function.
 */
export function groupByPropertyValue(a, p) {
    return a.reduce((grouped, cur) => {
        if (!(p in grouped)) {
            grouped[cur[p]] = [];
        }
        grouped[cur[p]].push(cur);
        return grouped;
    }, {});
}

/**
 * Returns a new object with the same properties as the given
 * object, but whose values are those returned by the given
 * function. The given function takes 2 args, the property
 * value and the property key.
 *
 * Replaces the underscore mapObject function.
 */
export function mapObject(o, f) {
    const newO = {...o};
    for (const [k, v] of Object.entries(newO)) {
        newO[k] = f(v, k);
    }
    return newO;
}

/**
 * Get a comparison functor for the property of an object whose
 * values can be compared using the standard comparison operators.
 *
 * @returns {function(a, b)}
 *      A function that takes 2 object, a and b, and returns
 *      -1 if a[prop] < b[prop], 1 if a[prop] > b[prop], 0 if a[prop] = b[prop]
 */
export function cmpObjectProp(prop) {
    return (a, b) => {
        return a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : 0; // eslint-disable-line no-nested-ternary
    };
}

/**
 * Return a function that reverses the sense of the given comparison
 * functor. So when used with the Array.sort it will turn an ascending
 * sort into a descending sort (and vice-versa).
 */
export function reverseCmp(cmp) {
    return (a, b) => cmp(b, a);
}

/**
 * Returns the time difference in seconds between the given
 * start and end times.
 */
export function getDurationInSeconds(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationSecs = (end.getTime() - start.getTime()) / 1000;
    return durationSecs;
}

/**
 * Give some name to colors we may want to use
 * I lifted names from https://graf1x.com/list-of-colors-with-color-names/ that are
 * similar, but the colors below ARE NOT the official colors for those name!
 * It's just important to have a more easily recognizable name than the color value
 * in order to determine where the same color is used in the code.
 */
export const Colors = {
    brightPlum: '#ab45ab',
    reddishPeach: '#f56b6b',
    turkoise: '#128ead',
    sage: '#7caf5f',
    apricot: '#f2a466',
    eggplant: '#321325',
    darkfern: '#3c493f',
    aquamarine: '#1b998b',
    lightlava: '#bdc3c7',
};

/**
 * List of colors to use for peers in charts and other places it is
 * useful to associate a color to help distinguish a list of "things".
 * Use the 1st color (peerColors[0]) as the self color when that matters.
 *
 * Note: Where possible, using css would be preferable to using these colors
 * so this list also exist and needs to be kept in sync w/ what's in
 * sass/components/_bulma.scss
 */
export const PeerColors = [
    Colors.brightPlum,
    Colors.reddishPeach,
    Colors.turkoise,
    Colors.sage,
    Colors.apricot,
    Colors.eggplant,
    Colors.darkfern,
    Colors.aquamarine,
];

/**
 * Limit the given string to the specifed number of characters.
 * If the string has more characters than the max allowed
 * a new string will be returned which is exactly max characters long
 * consisting of a suffix of an ellipsis character (U+2026) OR the given
 * missing character string, and the 1st characters from the given
 * string to make the returned sting have the max length.
 *
 * @param {string} s - The string whose length should not exceed maxLen
 * @param {number} maxLen - The maximum length of the returned string. default: 100
 * @param {string} missingCharSuffix - The suffix to replace the truncated
 *      end of the returned string with. default: ellipsis character
 *
 * @returns a string with a maximum of maxLen characters
 */
export function textTruncate(s, maxLen = 100, missingCharSuffix = '\u2026') {
    if (s.length <= maxLen) {
        return s;
    }

    return s.slice(0, maxLen - missingCharSuffix.length) + missingCharSuffix;
}
