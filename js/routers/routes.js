/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'backbone',
    'util/dialog-helper',
    'util/view-controller'],
    function (Backbone, DialogHelper, ViewController) {

        return Backbone.Router.extend({

            routes: {
            },

            showMapRouteDialog: function (application, closed, context) {
                DialogHelper.showDialog("views/routes/map-route-dialog", {application: application}, closed, context);
            },

            showUnmapRouteDialog: function (application_guid, route, closed, context) {
                DialogHelper.showDialog("views/routes/unmap-route-dialog", {application_guid: application_guid, route: route}, closed, context);
            }
        });
    }
);