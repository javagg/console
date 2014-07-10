/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'access/access-control',
    'views/lists/table-view',
    'text!views/lists/templates/organization-table-view-resource.ejs',
    'text!views/lists/templates/organization-table-view-page-container.ejs'],
    function ($, Backbone, _, AccessControl, TableView, TableResourceTemplate, TablePageContainerTemplate) {

        return TableView.extend({

            initialize: function () {

                if (!this.options.collection) {
                    this.options.collection = sconsole.cf_api.organizations;
                }

                TableView.prototype.initialize.apply(this);
            },

            renderPageContainer: function () {

                var template = _.template(TablePageContainerTemplate, {is_admin: AccessControl.isAdmin()});

                this.$('.page')
                    .append(template);
            },

            makeResourceEl: function (resource) {
                return  _.template(TableResourceTemplate, {resource: resource, is_admin: AccessControl.isAdmin()});
            },

            resourceRendered: function (resource, resource_el) {

                if (!this.options.click_handlers || !this.options.click_handlers.deleteOrganizationClicked) {return;}

                AccessControl.isAllowed(
                    resource.metadata.guid,
                    AccessControl.resources.organization,
                    AccessControl.actions.delete,
                    function () {
                        $('.btn-delete-org', resource_el).show();
                    }
                );
            }
        });
    }
);
