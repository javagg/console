/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'underscore',
    'access/access-constants',
    'access/base-access'],
    function (_, AccessConstants, BaseAccess) {

        var SpaceAccess = function () {};

        SpaceAccess.prototype = Object.create(BaseAccess.prototype);

        SpaceAccess.prototype.create = function (org) {

            // Admin
            if (BaseAccess.prototype.create.apply(this, org)) {
                return true;
            }

            // If user is manager of org that space belongs to
            return _.find(sconsole.user.summary.entity.managed_organizations, function (managed_org) {
                return managed_org.metadata.guid === org.metadata.guid;
            });
        };

        SpaceAccess.prototype.delete_ = function (space) {

            // Admin
            if (BaseAccess.prototype.delete_.apply(this, space)) {
                return true;
            }

            // If user is manager of org that space belongs to
            return _.find(sconsole.user.summary.entity.managed_organizations, function (managed_org) {
                return managed_org.metadata.guid === space.entity.organization_guid;
            });
        };

        SpaceAccess.prototype.update = function (space) {

            // Admin
            if (BaseAccess.prototype.update.apply(this, space)) {
                return true;
            }

            // If user is manager of org that space belongs to
            if (_.find(sconsole.user.summary.entity.managed_organizations, function (managed_org) {
                return managed_org.metadata.guid === space.entity.organization_guid;
            })) {
                return true;
            }

            // If user is manager of space
            return _.find(sconsole.user.summary.entity.managed_spaces, function (managed_space) {
                return managed_space.metadata.guid === space.metadata.guid;
            });
        };

        return SpaceAccess;
    }
);