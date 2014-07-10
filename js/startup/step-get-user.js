/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'util/current-user'],
    function (CurrentUser) {

        return {
            run: function (done) {

                CurrentUser.getCurrentUser(function (err, user) {
                    if (err) {return done(err);}
                    sconsole.user = user;
                    done(null);
                });
            }
        }
    }
);
