/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    './extensions/apps-extension',
    './extensions/users-extension',
    './extensions/api-extension'],
    function (Apps, Users, Api) {

        return  {

            /**
             * Extends the base cloud foundry client with Stackato specific api calls.
             */
            extendCloudFoundryClient: function () {
                Api.extend();
                Apps.extend();
                Users.extend();
            }
        }
    }
);