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
                'admin/domains':'adminDomains'
            },

            viewController: new ViewController('.content'),

            adminDomains: function () {
                this.viewController.changeView('views/domains/domain-admin', {});
            },

            showCreateDomainDialog: function (organization_guid, closed, context) {
                DialogHelper.showDialog("views/domains/create-domain-dialog", {organization_guid: organization_guid}, closed, context);
            },

            showUpdateDomainDialog: function (domain, closed, context) {
                DialogHelper.showDialog("views/domains/update-domain-dialog", {domain: domain}, closed, context);
            },

            showDeleteDomainDialog: function (domain, closed, context) {
                DialogHelper.showDialog("views/domains/delete-domain-dialog", {domain: domain}, closed, context);
            }
        });
    }
);