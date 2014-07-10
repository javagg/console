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
                'admin/services': 'adminServices',
                'services/:service_id': 'service'
            },

            viewController: new ViewController('.content'),

            adminServices: function () {
                this.services();
            },

            services: function () {
                this.viewController.changeView('views/services/services', {});
            },

            showService: function (service_instance_guid) {
                this.navigate('services/' + encodeURIComponent(service_instance_guid), {trigger: true});
            },

            service: function (service_instance_guid) {
                this.viewController.changeView('views/services/service', {service_instance_guid: decodeURIComponent(service_instance_guid)});
            },

            showDeleteServiceDialog: function (service, closed, context) {
                DialogHelper.showDialog("views/services/delete-service-dialog", {service: service}, closed, context);
            },
        });
    }
);
