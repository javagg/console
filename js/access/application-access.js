/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'underscore',
    'access/access-constants',
    'access/base-access'],
    function (_, AccessConstants, BaseAccess) {

        var AppAccess = function () {};

        AppAccess.prototype = Object.create(BaseAccess.prototype);

        AppAccess.prototype.create = function (space) {

            // Admin
            if (BaseAccess.prototype.create.apply(this, space)) {
                return true;
            }

            // If user is developer in space app belongs to
            return _.find(sconsole.user.summary.entity.spaces, function (developed_space) {
                return developed_space.metadata.guid === space.metadata.guid;
            });
        };

        AppAccess.prototype.update = function (app) {

            // Admin
            if (BaseAccess.prototype.update.call(this, app)) {
                return true;
            }

            // If user is developer in space app belongs to
            return _.find(sconsole.user.summary.entity.spaces, function (developed_space) {
                return developed_space.metadata.guid === app.entity.space_guid;
            });
        };

        AppAccess.prototype.delete_ = AppAccess.prototype.update;

        return AppAccess;
    }
);