/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'views/lists/route-list',
    'text!views/lists/templates/route-table-resource.ejs',
    'text!views/lists/templates/route-table-container.ejs'],
    function ($, Backbone, _, RouteList, TableResourceTemplate, TablePageContainerTemplate) {

        return RouteList.extend({

            initialize: function () {

                if (!this.options.collection) {
                    this.options.collection = sconsole.cf_api.routes;
                }
                this.options.collection_options = this.options.collection_options || {};
                this.options.collection_options.queries = {'inline-relations-depth': 1};

                RouteList.prototype.initialize.apply(this);
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