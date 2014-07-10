/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'underscore',
    'access/access-constants',
    'access/base-access'],
    function (_, AccessConstants, BaseAccess) {

        var OrgAccess = function () {};

        OrgAccess.prototype = Object.create(BaseAccess.prototype);

        OrgAccess.prototype.update = function (org) {

            // Admin
            if (BaseAccess.prototype.update.apply(this, org)) {
                return true;
            }

            // If user is manager of org
            return _.find(sconsole.user.summary.entity.managed_organizations, function (managed_org) {
                return org.metadata.guid === managed_org.metadata.guid;
            });
        };

        return OrgAccess;
    }
);