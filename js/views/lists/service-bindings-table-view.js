/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'views/lists/table-view',
    'text!views/lists/templates/service-bindings-table-view-resource.ejs',
    'text!views/lists/templates/service-bindings-table-view-page-container.ejs'],
    function ($, Backbone, _, TableView, TableResourceTemplate, TablePageContainerTemplate) {

        return TableView.extend({

            initialize: function () {

                if (!this.options.collection) {
                    this.options.collection = sconsole.cf_api.service_bindings;
                }

                if (!this.options.collection_options) {
                    this.options.collection_options = {'queries': {'inline-relations-depth': 2}};
                }

                // Don't show search bar.
                this.options.disable_search_bar = true;

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
