/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'underscore',
    'access/admin-access',
    'access/access-constants',
    'access/access-cache',
    'access/organization-access',
    'access/space-access',
    'access/application-access',
    'access/domain-access',
    'access/route-access'],
    function (_, AdminAccess, AccessConstants, AccessCache, OrganizationAccess, SpaceAccess, ApplicationAccess, DomainAccess, RouteAccess) {

        var getAccessChecker = function (resource_type) {

            switch (resource_type) {
                case AccessConstants.resources.organization:
                    return new OrganizationAccess();
                    break;

                case AccessConstants.resources.space:
                    return new SpaceAccess();
                    break;

                case AccessConstants.resources.application:
                    return new ApplicationAccess();
                    break;

                case AccessConstants.resources.domain:
                    return new DomainAccess();
                    break;

                case AccessConstants.resources.route:
                    return new RouteAccess();
                    break;
            }
        };

        var getAccessCheckerAction = function (access_checker, action) {

            switch (action) {
                case AccessConstants.actions.create:
                    return access_checker.create;
                    break;

                case AccessConstants.actions.update:
                    return access_checker.update;
                    break;

                case AccessConstants.actions.delete:
                    return access_checker.delete_;
                    break;
            }
        };

        return {

            resources: AccessConstants.resources,

            actions: AccessConstants.actions,

            isAdmin: AdminAccess.isAdmin,

            /**
             * Checks if the current user is allowed to perform an action on a resource. We assume that the 'read' action is
             * implicit as the CC won't let users discover resources they can't read.
             * @param {string} resource_guid The guid of the resource. If the action is 'create' then pass the guid of the parent
             * e.g. to create an app, pass the guid of a space and to create a space, pass the guid of the org.
             * @param {resources} resource_type The type of the resource.
             * @param {actions} action The action to check.
             * @param {function} allowed Called if the user is allowed to perform the action.
             * @param {function} denied Called if the user is not allowed to perform the action.
             */
            isAllowed: function (resource_guid, resource_type, action, allowed, denied) {

                var accessChecker = getAccessChecker(resource_type),
                    accessAction = getAccessCheckerAction(accessChecker, action);

                // If a resource is being created, we need to fetch the parent object to determine access.
                var actual_type = resource_type;
                if (action === AccessConstants.actions.create) {
                    if (resource_type === AccessConstants.resources.application ||
                        resource_type === AccessConstants.resources.route) {
                        actual_type = AccessConstants.resources.space;
                    }

                    if (resource_type === AccessConstants.resources.space ||
                        resource_type === AccessConstants.resources.domain) {
                        actual_type = AccessConstants.resources.organization;
                    }
                }

                AccessCache.getResource(resource_guid, actual_type, action, function (err, resource) {
                    if (err) {return 'Failed to fetch resource: ' + err.message} // what to do here?

                    var is_allowed = accessAction(resource, action);

                    if (is_allowed) {
                        if (_.isFunction(allowed)) {
                            allowed();
                        }
                    } else {
                        if (_.isFunction(denied)) {
                            denied();
                        }
                    }
                });
            }
        }
    }
);
