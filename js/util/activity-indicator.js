//
// Copyright (c) Appsecute 2013 - ALL RIGHTS RESERVED.
//

/**
 * @description An activity indicator that can be used to visually indicate that
 * an async request is in progress.
 */

define([
    'jquery',
    'appsecute-api/lib/cclass'],
    function ($, CClass) {

        return CClass.create(

            /**
             * @description Creates a new activity indicator.
             * @param {Object} parentElement An existing DOM element to draw the activity
             * indicator within.
             * @param {Object} options A hash of options to change the default behaviour of
             * the activity indicator.
             * @param {string} options.activityIndicatorClass The class to apply to the activity indicator.
             * Default is "activity-indicator".
             * @param {Boolean} options.hidden Set to true if the activity indicator should initially be
             * hidden. Default is false.
             */
                function (parentElement, options) {

                var _activityIndicator = null;
                var _wrapper = null;

                var initialize = function () {

                    options = options || {};

                    _wrapper = new $('<div>', {'class':options.activityIndicatorWrapperClass || "activity-indicator-wrapper"});
                    _activityIndicator = $('<div>', {'class':options.activityIndicatorClass || "activity-indicator"}).appendTo(_wrapper);

                    _activityIndicator.hide();

                    $(parentElement).append(_wrapper);

                    if(!options.hidden) {
                        showWithDelay(options.delay);
                    }
                };


                var showWithDelay = function () {

                    if(options.delay  <= 0) {
                        _activityIndicator.show();
                        return;
                    }

                    setTimeout(
                        function () {
                            if (_activityIndicator) {
                                _activityIndicator.show();
                            }
                        },
                        options.delay || 500
                    );
                };

                initialize();

                return {

                    /**
                     * @description Shows the activity indicator.
                     */
                    show:function () {
                        if (_activityIndicator) {
                            _activityIndicator.show();
                        }
                    },


                    /**
                     * @description Hides the activity indicator.
                     */
                    hide:function () {
                        if (_activityIndicator) {
                            _activityIndicator.hide();
                        }
                    },


                    /**
                     * @description Closes and removes the activity indicator from the DOM.
                     */
                    close:function () {
                        if (_activityIndicator) {
                            _wrapper.remove();
                            _wrapper = null;
                            _activityIndicator = null;
                        }
                    },


                    closeAndRemoveParentElement:function () {
                        this.close();
                        parentElement.remove();
                    }
                }
            }
        );
    }
);