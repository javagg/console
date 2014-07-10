/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'underscore',
    'access/access-constants',
    'access/base-access'],
    function (_, AccessConstants, BaseAccess) {

        var RouteAccess = function () {};

        RouteAccess.prototype = Object.create(BaseAccess.prototype);

        RouteAccess.prototype.create = function (space) {

            // Admin
            if (BaseAccess.prototype.create.call(this, space)) {
                return true;
            }

            // If user is manager of org that owns the space
            if (_.find(sconsole.user.summary.entity.managed_organizations, function (managed_org) {
                return managed_org.metadata.guid === space.entity.organization_guid;
            })) {
                return true;
            }

            // If user is manager in space
            if (_.find(sconsole.user.summary.entity.managed_spaces, function (managed_space) {
                return managed_space.metadata.guid === space.metadata.guid;
            })) {
                return true;
            }

            // Finally, if user is developer in space
            return _.find(sconsole.user.summary.entity.spaces, function (developed_space) {
                return developed_space.metadata.guid === space.metadata.guid;
            });
        };

        RouteAccess.prototype.update = function (route) {

            // Admin
            if (BaseAccess.prototype.update.call(this, route)) {
                return true;
            }

            // If user is manager of org that owns the space
            if (_.find(sconsole.user.summary.entity.managed_organizations, function (managed_org) {
                return managed_org.metadata.guid === route.entity.space.entity.organization_guid;
            })) {
                return true;
            }

            // If user is manager in space
            if (_.find(sconsole.user.summary.entity.managed_spaces, function (managed_space) {
                return managed_space.metadata.guid === route.entity.space_guid;
            })) {
                return true;
            }

            // Finally, if user is developer in space
            return _.find(sconsole.user.summary.entity.spaces, function (developed_space) {
                return developed_space.metadata.guid === route.entity.space_guid;
            });
        };

        RouteAccess.prototype.delete_ = RouteAccess.prototype.update;

        return RouteAccess;
    }
);