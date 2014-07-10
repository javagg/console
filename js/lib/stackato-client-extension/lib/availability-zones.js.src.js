/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'cloud-foundry-client/lib/collection'],
    function (Collection) {

        var availability_zones = function (api) {
            this.api = api;
            this.collection = 'availability_zones';
        };

        availability_zones.prototype = Object.create(new Collection());

        return availability_zones;
    }
);