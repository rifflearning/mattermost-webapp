import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import auth from '@feathersjs/authentication-client';
import io from 'socket.io-client';

// access to api

let dataserverPath = process.env.CLIENT_ENV ? process.env.CLIENT_ENV.RIFF_SERVER_PATH : process.env.RIFF_SERVER_PATH;
console.log("path envs:", process.env.CLIENT_ENV, process.env.RIFF_SERVER_PATH);
dataserverPath = dataserverPath ? dataserverPath : '';
dataserverPath += '/socket.io';

let dataserverUrl = process.env.CLIENT_ENV ? process.env.CLIENT_ENV.RIFF_SERVER_URL : process.env.RIFF_SERVER_URL;
console.log("data server path:", dataserverPath)
console.log("data server URL:", dataserverUrl)

export const socket = io(dataserverUrl, {
    'timeout': 20000,
    'path': dataserverPath,
    'transports': [
        'websocket',
        'flashsocket',
        'htmlfile',
        'xhr-polling',
        'jsonp-polling'
    ]
});


export var app = feathers()
    .configure(socketio(socket))
    .configure(auth({jwt: {}, local: {}}));

export const logger = {
    debug: window.client_config && window.client_config.react_app_debug ? console.log.bind(window.console) : () => {},
    info: console.log.bind(window.console),
    warn: console.warn.bind(window.console),
    error: console.error.bind(window.console),
}
