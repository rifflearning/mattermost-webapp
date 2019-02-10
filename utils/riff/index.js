// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint header/header: "off", dot-location: ["error", "property"] */

import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import auth from '@feathersjs/authentication-client';
import io from 'socket.io-client';

// access to api

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
/* eslint-disable no-console, no-empty-function */
export const logger = {
    debug: window.client_config && window.client_config.react_app_debug ? console.log.bind(window.console) : () => {},
    info: console.log.bind(window.console),
    warn: console.warn.bind(window.console),
    error: console.error.bind(window.console),
};
/* eslint-enable no-console, no-empty-function */

let dataserverPath = process.env.CLIENT_ENV ? process.env.CLIENT_ENV.RIFF_SERVER_PATH : process.env.RIFF_SERVER_PATH;
logger.debug('path envs:', process.env.CLIENT_ENV, process.env.RIFF_SERVER_PATH);
dataserverPath = dataserverPath || '';
dataserverPath += '/socket.io';

const dataserverUrl = process.env.CLIENT_ENV ? process.env.CLIENT_ENV.RIFF_SERVER_URL : process.env.RIFF_SERVER_URL;
logger.debug('data server path:', dataserverPath);
logger.debug('data server URL:', dataserverUrl);

export const socket = io(dataserverUrl, {
    timeout: 20000,
    path: dataserverPath,
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
