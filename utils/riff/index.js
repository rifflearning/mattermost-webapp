import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import auth from '@feathersjs/authentication-client';
import io from 'socket.io-client';

// access to api

//let dataserverPath = window.client_config.dataServer.path || '';
let dataserverPath = '/socket.io';

console.log("riff server URL:", process.env.CLIENT_ENV.RIFF_SERVER_URL);
console.log("env:", process.env);

export const socket = io(process.env.CLIENT_ENV.RIFF_SERVER_URL, {
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
