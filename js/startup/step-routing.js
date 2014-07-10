/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'backbone'],
    function (Backbone) {

        return {
            run: function (done) {
                if (!Backbone.history.start()) {
                    sconsole.routers.welcome.showWelcome();
                }
                done(null);
            }
        }
    }
);