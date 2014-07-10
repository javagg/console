/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'backbone',
    'util/view-controller'],
    function (Backbone, ViewController) {

        return Backbone.Router.extend({

            routes: {
                'eventlog': 'eventlog'
            },

            viewController: new ViewController('.content'),

            eventlog: function () {
                this.viewController.changeView('views/eventlog/eventlog');
            }
        });
    }
);
