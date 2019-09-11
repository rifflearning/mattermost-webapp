// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// Riff Learning lint overrides
/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" }, "ObjectExpression": "first" }],
    "react/jsx-max-props-per-line": ["error", { "when": "multiline" }],
    "no-underscore-dangle": ["error", { "allow": [ "_id" ] }],
*/

import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import auth from '@feathersjs/authentication-client';
import io from 'socket.io-client';

import {logger} from './logger';
import {
    cmpObjectProp,
    countByPropertyValue,
    groupByPropertyValue,
    mapObject,
    reverseCmp,
} from './collection_utils';
import {
    Colors,
    PeerColors,
    getColorForLearningGroup,
    getColorForOther,
    getColorForSelf,
    getCountOtherColors,
    networkGraphNodeColors,
    rgbaColor,
} from './colors';
import {
    WebRtcNick,
    calculateBitrate,
    isScreenShareSourceAvailable,
    readablePeers,
} from './webrtc_utils';

// Default dataserver and signalmaster url and path values which work w/ the reverse proxy
const config = {
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

const socket = io(config.dataserverUrl, {
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

const app = feathers()
    .configure(socketio(socket))
    .configure(auth({jwt: {}, local: {}}));

/**
 * Returns the time difference in seconds between the given
 * start and end times.
 */
function getDurationInSeconds(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationSecs = (end.getTime() - start.getTime()) / 1000;
    return durationSecs;
}

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
function textTruncate(s, maxLen = 100, missingCharSuffix = '\u2026') {
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
function addA11yBrowserAlert(text, priority = 'polite') {
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

const LoadMeetingErrorTypes = {
    NO_PARTICIPANT: 'no participant found',
    NO_USEFUL_MEETINGS: 'no useful meetings found',
    NO_MEETINGS_WITH_OTHERS: 'no meetings with other participants found',
};

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    config,
    socket,
    app,
    getDurationInSeconds,
    textTruncate,
    addA11yBrowserAlert,
    logger,
    cmpObjectProp,
    countByPropertyValue,
    groupByPropertyValue,
    mapObject,
    reverseCmp,
    Colors,
    PeerColors,
    getColorForLearningGroup,
    getColorForOther,
    getColorForSelf,
    getCountOtherColors,
    networkGraphNodeColors,
    rgbaColor,
    WebRtcNick,
    calculateBitrate,
    isScreenShareSourceAvailable,
    readablePeers,
    LoadMeetingErrorTypes,
};
