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
                'usage': 'usage',
                'usage/:sub_view': 'usage'
            },

            viewController: new ViewController('.content'),

            usage: function (sub_view) {
                sub_view = sub_view ? decodeURIComponent(sub_view) : null;
                this.viewController.changeView('views/usage/usage', {sub_view: sub_view});
            },

            showUsageSubView: function (sub_view) {
                this.navigate('usage/' + sub_view, {trigger: true});
            },
        });
    }
);
