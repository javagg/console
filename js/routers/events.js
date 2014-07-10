/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'backbone',
    'util/view-controller'],
    function (Backbone, ViewController) {

        return Backbone.Router.extend({

            routes: {
                'events/*event_url': 'event'
            },

            viewController: new ViewController('.content'),

            showEvent: function (event_url) {
                this.navigate('events/' + encodeURIComponent(event_url), false);
                this.application(event_url);
            },

            event: function (event_url) {
                this.viewController.changeView('views/events/event', {event_url: decodeURIComponent(event_url)});
            }
        });
    }
);
