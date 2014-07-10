/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'cloud-foundry-client/lib/collection'],
    function (Collection) {

        var appstores = function (api) {
            this.api = api;
            this.collection = 'stackato/app_stores';
        };

        appstores.prototype = Object.create(new Collection());

        return appstores;
    }
);