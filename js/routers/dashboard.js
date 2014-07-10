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
                'dashboard': 'dashboard',
                'dashboard/:subview': 'dashboard'
            },

            viewController: new ViewController('.content'),

            dashboard: function (sub_view) {
                sub_view = sub_view ? decodeURIComponent(sub_view) : null;
                this.viewController.changeView('views/dashboard/dashboard', {sub_view: sub_view});
            }
        });
    }
);