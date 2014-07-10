/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'views/lists/table-view',
    'text!views/lists/templates/quota-definition-table-view-resource.ejs',
    'text!views/lists/templates/quota-definition-table-view-page-container.ejs'],
    function ($, Backbone, _, TableView, TableResourceTemplate, TablePageContainerTemplate) {

        return TableView.extend({

            initialize: function () {

                if (!this.options.collection) {
                    this.options.collection = sconsole.cf_api.quota_definitions;
                }

                if (!this.options.search_property) {
                    this.options.search_property = 'name';
                }

                TableView.prototype.initialize.apply(this);
            },

            renderPageContainer: function () {

                var template = _.template(TablePageContainerTemplate, {});

                this.$('.page')
                    .append(template);
            },

            makeResourceEl: function (resource) {
                return  _.template(TableResourceTemplate, {resource: resource});
            }
        });
    }
);
