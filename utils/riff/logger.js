/* ******************************************************************************
 * logger.js                                                                    *
 * *************************************************************************/ /**
 *
 * @fileoverview A very rudimentary logger
 *
 * logger is a poor man's cheap logger for client code.
 *
 * It provides debug, info, warn and error logging to the console, with the
 * ability to set the log level such that only log messages of a certain
 * level will be logged.
 *
 * Created on       April 15, 2019
 * @author          Michael Jay Lippert
 *
 * @copyright (c) 2019-present Riff Learning Inc.,
 *            MIT License (see https://opensource.org/licenses/MIT)
 *
 * ******************************************************************************/

// Riff Learning lint overrides
/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" }, "ObjectExpression": "first" }],
    "react/jsx-max-props-per-line": ["error", { "when": "multiline" }],
    "no-underscore-dangle": ["error", { "allow": [ "_id" ] }],
*/

/* eslint-disable no-console, no-empty-function */
// Noop function to use for disabled log levels
const noopFn = () => {};

const infoLog = console.log.bind(window.console);
const warnLog = console.warn.bind(window.console);
const errorLog = console.error.bind(window.console);
/* eslint-enable no-console, no-empty-function */

/** The current log level */
let curLogLevel = 'debug';

/**
 * logger is a poor man's cheap logger for client code.
 *
 * It mostly just redirects to using the window console
 * log, EXCEPT it allows setting a log level which will
 * disable all logging of a lower level (debug is lowest,
 * error is highest).
 *
 * By using this logger instead of console.log directly
 * we can more easily replace all logging with a fancier
 * logger package w/ more functionality at some later time
 * if desired.
 */
const logger = {
    debug: infoLog,
    info: infoLog,
    warn: warnLog,
    error: errorLog,

    setLogLevel(level) {
        curLogLevel = level;
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

    getLogLevel() {
        return curLogLevel;
    },
};

logger.setLogLevel(curLogLevel);

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    logger,
};
