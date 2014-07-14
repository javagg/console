/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'cloud-foundry-client/lib/collection'],
    function (Collection) {

        var zones = function (api) {
            this.api = api;
            this.collection = 'zones';
        };

        zones.prototype = Object.create(new Collection());

        return zones;
    }
);