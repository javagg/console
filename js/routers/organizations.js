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
                'organizations/:organization_guid': 'organization',
                'organizations/:organization_guid/:sub_view': 'organization',
                'organizations': 'organizations',
                'admin/organizations': 'adminOrganizations'
            },

            viewController: new ViewController('.content'),

            showOrganizations: function () {
                this.navigate('organizations', false);
                this.organizations();
            },

            adminOrganizations: function () {
                this.organizations();
            },

            organizations: function () {
                this.viewController.changeView('views/organizations/organizations', {});
            },

            organization: function (organization_guid, sub_view) {
                sub_view = sub_view ? decodeURIComponent(sub_view) : null;
                this.viewController.changeView('views/organizations/organization', {organization_guid: organization_guid, sub_view: sub_view});
            },

            showOrganization: function (org_guid) {
                this.showOrganizationSubView(org_guid, 'spaces');
            },

            showOrganizationSubView: function (org_guid, sub_view) {
                this.navigate('organizations/' + encodeURIComponent(org_guid) + '/' + sub_view, {trigger: true});
            },

            showCreateOrganizationDialog: function (closed, context) {
                DialogHelper.showDialog("views/organizations/create-organization-dialog", null, closed, context);
            },

            showSetAsDefaultDialog: function (organization_data, closed, context) {
                DialogHelper.showDialog("views/organizations/set-as-default-dialog", {organization_data: organization_data}, closed, context);
            },

            showUnsetAsDefaultDialog: function (organization_data, closed, context) {
                DialogHelper.showDialog("views/organizations/unset-as-default-dialog", {organization_data: organization_data}, closed, context);
            },

            showCreateSpaceDialog: function (org_guid, closed, context) {
                DialogHelper.showDialog("views/organizations/create-space-dialog", {org_guid: org_guid}, closed, context);
            },

            showAddUserDialog: function (org, closed, context) {
                DialogHelper.showDialog("views/organizations/add-user-dialog", {org: org}, closed, context);
            },

            showEditUserDialog: function (user, org, closed, context) {
                DialogHelper.showDialog("views/organizations/edit-user-dialog", {user: user, org: org}, closed, context);
            },

            showRemoveUserDialog: function (user, org, closed, context) {
                DialogHelper.showDialog("views/organizations/remove-user-dialog", {user: user, org: org}, closed, context);
            },

            showEditQuotaDialog: function (org, closed, context) {
                DialogHelper.showDialog("views/organizations/edit-quota-dialog", {org: org}, closed, context);
            },

            showDeleteOrganizationDialog: function (organization_data, closed, context) {
                DialogHelper.showDialog("views/organizations/delete-organization-dialog", {organization_data: organization_data}, closed, context);
            }
        });
    }
);
