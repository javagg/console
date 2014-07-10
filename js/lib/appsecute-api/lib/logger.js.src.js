//
// Copyright (c) Appsecute 2013 - ALL RIGHTS RESERVED.
//

/**
 * @description A logger class that can be used to output to the javascript console at
 * various log levels.
 */
define([
    'underscore',
    'appsecute-api/lib/cclass'],
    function (_, CClass) {

        return CClass.create(

            /**
             * @description Creates a new logger.
             * @param {String} identifier The identifier to associate with the log messages output through this instance.
             * This would typically be set to the name of the class that created the logger. This does not have to be unique.
             */
                function (identifier) {


                /**
                 * @description The identifier that will be output alongside all log messages.
                 */
                var _identifier = identifier || "Console";


                /**
                 * @description Generates a message containing the class name, time stamp, debug
                 * level and log message as a string ready to be output to the console.
                 * @param {String} level The desired log level as a string.
                 * @param {String} logMessage The message that is being output to the console.
                 */
                var generateLogMessage = function (level, logMessage) {

                    var now = new Date();

                    if (_.isObject(logMessage)) {
                        try {
                            logMessage = JSON.stringify(logMessage);
                        } catch (e) {
                            /* eat it */
                        }
                    }

                    return  now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + ":" + now.getMilliseconds() + " - " + _identifier + " - " + level + ": " + logMessage;
                };


                /**
                 * @description Determines if a console is available to output to.
                 */
                var isConsoleAvailable = function () {
                    return !(typeof console === "undefined" || typeof console.log === "undefined");
                };


                return {

                    /**
                     * @description Logs a message to the console at error level.
                     * If no console is available or the global log level is lower
                     * than error level logging, then this log message will be suppressed.
                     * @param {String} logMessage The message to log.
                     */
                    error: function (logMessage) {
                        if (isConsoleAvailable()) {

                            var message = generateLogMessage("ERROR", logMessage);

                            if (console.error) {
                                console.error(message);
                            } else {
                                console.log(message);
                            }
                        }
                    },


                    /**
                     * @description Logs a message to the console at warn level.
                     * If no console is available or the global log level is lower
                     * than warn level logging, then this log message will be suppressed.
                     * @param {String} logMessage The message to log.
                     */
                    warn: function (logMessage) {
                        if (isConsoleAvailable()) {

                            var message = generateLogMessage("WARN", logMessage);

                            if (console.warn) {
                                console.warn(message);
                            } else {
                                console.log(message);
                            }
                        }
                    },


                    /**
                     * @description Logs a message to the console at info level.
                     * If no console is available or the global log level is lower
                     * than info level logging, then this log message will be suppressed.
                     * @param {String} logMessage The message to log.
                     */
                    info: function (logMessage) {
                        if (isConsoleAvailable()) {

                            var message = generateLogMessage("INFO", logMessage);

                            if (console.info) {
                                console.info(message);
                            } else {
                                console.log(message);
                            }
                        }
                    },


                    /**
                     * @description Logs a message to the console at debug level.
                     * If no console is available or the global log level is lower
                     * than debug level logging, then this log message will be suppressed.
                     * @param {String} logMessage The message to log.
                     */
                    debug: function (logMessage) {
                        if (isConsoleAvailable()) {

                            var message = generateLogMessage("DEBUG", logMessage);

                            if (console.debug) {
                                console.debug(message);
                            } else {
                                console.log(message);
                            }
                        }
                    }
                };
            }
        );
    }
);