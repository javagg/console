/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'views/lists/table-view',
    'text!views/lists/templates/service-table-view-resource.ejs',
    'text!views/lists/templates/service-table-view-page-container.ejs'],
    function ($, Backbone, _, TableView, TableResourceTemplate, TablePageContainerTemplate) {

        return TableView.extend({

            initialize: function () {

                if (!this.options.collection) {
                    this.options.collection = sconsole.cf_api.service_instances;
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
