/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'access/access-control',
    'views/lists/table-view',
    'text!views/lists/templates/space-table-view-resource.ejs',
    'text!views/lists/templates/space-table-view-page-container.ejs'],
    function ($, Backbone, _, AccessControl, TableView, TableResourceTemplate, TablePageContainerTemplate) {

        return TableView.extend({

            initialize: function () {

                this.options.collection = sconsole.cf_api.spaces;

                if (!this.options.search_property) {
                    this.options.search_property = 'name';
                }

                this.options.collection_options = this.options.collection_options || {};

                TableView.prototype.initialize.apply(this);
            },

            renderPageContainer: function () {

                var template = _.template(TablePageContainerTemplate, {is_admin: AccessControl.isAdmin()});

                this.$('.page')
                    .append(template);
            },

            makeResourceEl: function (resource) {
                return _.template(TableResourceTemplate, {resource: resource, is_admin: AccessControl.isAdmin()});
            },

            resourceRendered: function (resource, resource_el) {

                AccessControl.isAllowed(
                    resource.metadata.guid,
                    AccessControl.resources.space,
                    AccessControl.actions.delete,
                    function () {
                        $('.btn-delete-space', resource_el).show();
                    });
            }
        });
    }
);
