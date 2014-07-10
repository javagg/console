/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'underscore',
    'access/access-constants'],
    function (_, AccessConstants) {

        var resource_cache = {};

        var getOptions = function (resource_guid, resource_type, action) {

            if (resource_type === AccessConstants.resources.route &&
                action === AccessConstants.actions.update) {
                return {queries: {'inline-relations-depth': 1}};
            }

            return {};
        };

        return {

            getResource: function (resource_guid, resource_type, action, done) {

                var collection = null;
                switch (resource_type) {

                    case AccessConstants.resources.organization:
                        collection = sconsole.cf_api.organizations;
                        break;

                    case AccessConstants.resources.space:
                        collection = sconsole.cf_api.spaces;
                        break;

                    case AccessConstants.resources.application:
                        collection = sconsole.cf_api.apps;
                        break;

                    case AccessConstants.resources.domain:
                        collection = sconsole.cf_api.domains;
                        break;

                    case AccessConstants.resources.route:
                        collection = sconsole.cf_api.routes;
                        break;
                }

                if (collection) {

                    // See if we've already cached the resource
                    if (resource_cache[resource_guid]) {
                        return setTimeout(function () {done(null, resource_cache[resource_guid]);}, 1);
                    }

                    // Otherwise fetch it
                    var options = getOptions(resource_guid, resource_type, action);
                    collection.get(resource_guid, options, function (err, resource) {
                        if (err) {return done(err);}
                        resource_cache[resource_guid] = resource;
                        done(null, resource);
                    });
                } else {
                    setTimeout(function () {done(new Error('Unrecognized resource type: ' + resource_type));}, 1);
                }
            }
        };
    }
);