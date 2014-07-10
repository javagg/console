/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'underscore',
    'access/admin-access'],
    function (_, AdminAccess) {

        var BaseAccess = function () {};

        BaseAccess.prototype = {
            create: function (resource) {
                return AdminAccess.isAdmin();
            },

            update: function (resource) {
                return AdminAccess.isAdmin();
            },

            delete_: function (resource) {
                return AdminAccess.isAdmin();
            }
        };

        return BaseAccess;
    }
);