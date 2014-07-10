/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'util/pingback'],
    function (Pingback) {

        return {
            run: function (done) {
                Pingback.check();
                done(null);
            }
        }
    }
);