/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'underscore',
    'access/access-constants',
    'access/base-access'],
    function (_, AccessConstants, BaseAccess) {

        var DomainAccess = function () {};

        DomainAccess.prototype = Object.create(BaseAccess.prototype);

        DomainAccess.prototype.create = function (org) {

            // Admin
            if (BaseAccess.prototype.create.apply(this, org)) {
                return true;
            }

            // If user is manager of org that domain belongs to
            return _.find(sconsole.user.summary.entity.managed_organizations, function (managed_org) {
                return managed_org.metadata.guid === org.metadata.guid;
            });
        };

        DomainAccess.prototype.update = function (domain) {

            // Admin
            if (BaseAccess.prototype.update.apply(this, domain)) {
                return true;
            }

            // If user is manager of org domain belongs to
            return _.find(sconsole.user.summary.entity.managed_organizations, function (managed_org) {
                return managed_org.metadata.guid === domain.entity.owning_organization_guid;
            });
        };

        DomainAccess.prototype.delete_ = DomainAccess.prototype.update;

        return DomainAccess;
    }
);