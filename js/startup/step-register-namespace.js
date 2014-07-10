/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([],
    function () {

        return {
            run: function (done) {
                window.sconsole = window.sconsole || this;
                window.sconsole.routers = window.sconsole.routers || {};
                done(null);
            }
        }
    }
);