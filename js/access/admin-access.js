/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([],
    function () {

        return {

            /**
             * Returns true if the user is an admin.
             */
            isAdmin: function () {
                return sconsole.user &&
                    sconsole.user.token &&
                    sconsole.user.token.payload.scope.indexOf('cloud_controller.admin') !== -1;
            }
        }
    }
);