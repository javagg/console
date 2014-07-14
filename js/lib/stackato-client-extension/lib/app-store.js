/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'cloud-foundry-client/lib/collection'],
    function (Collection) {

        // Yes, this really is different from stackato/app_stores
        var appstore = function (api) {
            this.api = api;
            this.collection = 'appstore';
        };

        appstore.prototype = Object.create(new Collection());

        return appstore;
    }
);