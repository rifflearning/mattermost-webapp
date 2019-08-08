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
        if (!(cur[p] in grouped)) {
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
    lightroyal: '#8a6a94',
    brightred: '#f44336',
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

/**
 * Temporarily adds a div to the DOM
 * (for one second)
 *
 * Contents of div will be read by screen reader
 * When passing a priority, the options are:
 *    1. 'assertive' - will interupt the current speech
 *    2. 'polite'(default) - will be read when current speech completes
 *    *Note: these are standards, but exact functionality can vary between screen readers
 */
export function addA11yBrowserAlert(text, priority = 'polite') {
    const newAlert = document.createElement('div');
    const id = 'speak-' + Date.now();

    newAlert.setAttribute('id', id);
    newAlert.setAttribute('role', 'alert');
    newAlert.classList.add('a11y-browser-alert');
    newAlert.setAttribute('aria-live', priority);
    newAlert.setAttribute('aria-atomic', 'true');

    document.body.appendChild(newAlert);

    window.setTimeout(() => {
        document.getElementById(id).innerHTML = text;
    }, 100);

    window.setTimeout(() => {
        document.body.removeChild(document.getElementById(id));
    }, 1000);
}

/**
 * Convert a peer array into a readable string listing those peers
 * using their nicknames.
 * Useful for a11y aria labels.
 *
 * examples:
 * 0 peers: 'Nobody else is here.'
 * 1 peer : 'Gerald is in the room.'
 * 2 peers: 'Aretha and Patty are in the room.'
 * 3 peers: 'Gerald, Tony and Markus are in the room.'
 * 4 peers: 'Liz, Gerald, Rebecca and Markus are in the room.'
 */
export function readablePeers(peers) {
    // No peers is easy
    if (peers.length === 0) {
        return 'Nobody else is here.';
    }

    const readableSuffix = 'in the room.';
    const peerNames = peers.map((p) => p.nick.split('|')[1]);

    // 1 peer is easy
    if (peerNames.length === 1) {
        return `${peerNames[0]} is ${readableSuffix}`;
    }

    // comma separate all names except the last one which is separated by 'and'
    const readablePeerList = [peerNames.slice(0, -1).join(', '), peerNames.slice(-1)].join(' and ');

    // multiple peers
    return `${readablePeerList} are ${readableSuffix}`;
}


/** The minimum acceptable bitrate for a single stream */
const MIN_BITRATE = 300; // kbps

/** The maximum allowable total bandwidth consumed by all streams
 *  given that our requirements state a minimum bandwidth
 *  of 3 megabits per second, we come in just a bit below that
 */
const MAX_BANDWIDTH = 2700; // kbps

/**
 * Returns the appropriate bitrate (kbps) for the video streams
 * based on the number of other peers in the meeting
 * (e.g. if 2 total people are in a meeting, peerCount is 1)
 */
export function calculateBitrate(peerCount) {
    // if we have four or more peers,
    // we just want to use the lowest possible bitrate
    // to avoid any cpu limitations
    if (peerCount >= 4) {
        return MIN_BITRATE;
    }

    return MAX_BANDWIDTH / peerCount;
}
