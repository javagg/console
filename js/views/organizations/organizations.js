/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'appsecute-api/lib/logger',
    'access/access-control',
    'views/lists/organization-table-view',
    'text!views/organizations/templates/organizations.ejs',
    'text!views/organizations/templates/organization-dialogs.html'],
    function ($, Backbone, _, Polyglot, Logger, AccessControl, OrganizationTableView, OrganizationTemplate, OrganizationDialogsTemplate) {

        return Backbone.View.extend({

            events: {
                "click button.create-organization": "createOrganizationClicked"
            },

            logger: new Logger('Organizations'),

            initialize: function () {
                this.options.activity.close();
                this.render();
                this.renderOrganizationTable();
            },

            render: function () {

                var template = _.template(OrganizationTemplate, {});

                $(template)
                    .appendTo(this.el);

                if (AccessControl.isAdmin()) {
                    this.$('.create-organization').show();
                }
                else {
                    this.$('.create-organization').remove();
                }
            },

            renderOrganizationTable: function () {

                this.organization_table = new OrganizationTableView({
                    el: $('<div>').appendTo(this.$('.organizations-table')),
                    resource_clicked: this.organizationClicked,
                    click_handlers: {deleteOrganizationClicked: this.deleteOrganizationClicked},
                    context: this
                });
            },

            organizationClicked: function (organization, click_event) {
                sconsole.routers.organizations.showOrganization(organization.metadata.guid);
            },
            
            createOrganizationClicked: function () {
                sconsole.routers.organizations.showCreateOrganizationDialog(
                    function (result) {
                        if (result && result.created) {
                            sconsole.routers.organizations.showOrganization(result.organization.metadata.guid);
                        }
                    }, this);
            },

            deleteOrganizationClicked: function (organization, click_event) {

                sconsole.routers.organizations.showDeleteOrganizationDialog(
                    organization,
                    function (result) {
                        if (result && result.deleted) {
                            this.organization_table.close();
                            this.renderOrganizationTable();
                        }
                    },
                    this);
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
