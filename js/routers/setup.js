/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'backbone',
    'util/dialog-helper',
    'util/view-controller'],
    function (Backbone, DialogHelper, ViewController) {

        return Backbone.Router.extend({

            routes: {
                'setup': 'setup'
            },

            viewController: new ViewController('.content'),

            setup: function () {
                this.viewController.changeView('views/setup/setup', {});
            }
        });
    }
);
