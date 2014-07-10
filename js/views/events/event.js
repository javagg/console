/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'async',
    'util/activity-indicator',
    'views/stream/stream',
    'text!views/events/templates/event.html'],
    function ($, Backbone, _, Polyglot, Async, Activity, StreamView, EventTemplate) {

        return Backbone.View.extend({

            events: {
            },


            initialize: function () {
                this.render();
            },

            render: function (application) {

            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);