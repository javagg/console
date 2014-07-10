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
                '': 'welcome'
            },

            viewController: new ViewController('.content'),

            showWelcome: function () {
                this.navigate('', {trigger: false});
                this.welcome();
            },

            welcome: function () {
                this.viewController.changeView('views/welcome/welcome', {});
            }
        });
    }
);
