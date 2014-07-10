/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'util/activity-indicator',
    'appsecute-api/lib/cclass',
    'appsecute-api/lib/event',
    'appsecute-api/lib/utils'],
    function ($, ActivityIndicator, CClass, Event, Utils) {

        return CClass.create(

            function (container) {

                var view_changing_event_name = 'view_changing';

                /**
                 * The currently displayed view, or null.
                 */
                var current_view = null;

                /**
                 * The state of the view that is currently being loaded.
                 */
                var loading_state = null;

                /**
                 * Constructor.
                 */
                var initialize = function () {
                    $(container).on(view_changing_event_name, _cleanup);
                };

                /**
                 * Closes the current view and empties that container the view controller is attached to.
                 */
                var _cleanup = function () {

                    if (current_view && Utils.isFunction(current_view.close)) {
                        current_view.close();
                    }

                    $(container).empty();
                };

                initialize();

                return {

                    /**
                     * Changes the current view.
                     * @param {String} path The path to the view to change to.
                     * @param {Object} options Options to pass to the view.
                     */
                    changeView: function (path, options) {

                        // Give other view controllers that are bound to this container a chance to cleanup
                        $(container).trigger(view_changing_event_name);

                        options = options || {};
                        options.el = $('<div>').appendTo($(container));
                        options.activity = new ActivityIndicator($('<div>', {'class': 'activity'}).appendTo(options.el));

                        var state = loading_state = Utils.getGuid();

                        // A closure to capture the state
                        (function (state, options) {
                            require([path], function (view) {

                                // Another view has started loading while this one was being downloaded
                                if (loading_state !== state) {
                                    return;
                                }

                                // Don't continue loading the new view if login is required or the user is within the login views.
                                var withinLoginView = path.indexOf('views/login') > -1;
                                if (!window.sconsole.login_required || withinLoginView) {
                                    current_view = new view(options);

                                    // Fixes window scroll in some browsers
                                    $('html, body').animate({ scrollTop: 0 }, 'fast');
                                }
                            });
                        }(state, options));
                    },

                    /**
                     * @description Closes the view controller.
                     */
                    close: function () {
                        _cleanup();
                    }
                }
            }
        );
    }
);