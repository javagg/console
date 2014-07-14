//
// Copyright (c) Appsecute 2013 - ALL RIGHTS RESERVED.
//

/**
 * @description A class that encapsulates event subscription and notifications.
 */
define([
    'underscore',
    'appsecute-api/lib/cclass',
    'appsecute-api/lib/logger',
    'appsecute-api/lib/utils'],
    function (_, CClass, Logger, Utils) {

        return CClass.create(

            /**
             * @description Creates a new  vent.
             * @param {String} eventName The name of the event.
             * @param {Object} sender The source of the event.
             * @return {Object} A new event.
             */
                function (eventName, sender) {

                var _sender = sender,
                    _eventName = eventName,
                    _listeners = [],
                    _logger = new Logger("Event");


                return {

                    /**
                     * Destroys the event and unregisters all event handlers.
                     */
                    destroy: function () {
                        _listeners = [];
                    },

                    /**
                     * @descriptions Subscribe a listener to this event.
                     * When the event is triggered the listener will be notified.
                     * @param {Function} listener A function that will be called when this event
                     * is triggered.
                     * @param {object} context The context to set as "this" when the event listener
                     * is called.
                     */
                    subscribe: function (listener, context) {
                        if (Utils.isFunction(listener)) {
                            _listeners.push({listener: listener, context: context});
                        }
                    },

                    /**
                     * @description Unsubscribes a previously subscribed event listener.
                     * @param {Function} listener The event listener to unsubscribe.
                     */
                    unsubscribe: function (listener) {
                        _listeners = _.reject(_listeners, function (existing_listener) {
                            return existing_listener.listener === listener;
                        });
                    },

                    /**
                     * @description Triggers this event causing all subscribed listeners to be notified.
                     * @param {Object} eventDetails Information about the event to pass to listeners.
                     */
                    trigger: function (eventDetails) {
                        var i;
                        for (i = 0; i < _listeners.length; i++) {
                            try {
                                if (_listeners[i].context) {
                                    _listeners[i].listener.apply(_listeners[i].context, [eventDetails, _eventName, _sender]);
                                } else {
                                    _listeners[i].listener(eventDetails, _eventName, _sender);
                                }
                            } catch (e) {
                                _logger.error("Caught exception attempting to notify event listener of '" +
                                    _eventName + "' event.\r\nException was: " + e);
                            }
                        }
                    }
                };
            }
        );
    }
);