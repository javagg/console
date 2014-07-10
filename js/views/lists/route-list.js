/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'access/access-control',
    'views/lists/list-view',
    'text!views/lists/templates/route-resource.ejs'],
    function ($, Backbone, _, AccessControl, ListView, RouteResourceTemplate) {

        return ListView.extend({

            initialize: function () {

                if (!this.options.search_property) {
                    this.options.search_property = 'host';
                }

                this.options.collection_options = {queries: {'inline-relations-depth': 1}};

                ListView.prototype.initialize.apply(this);
            },

            makeResourceEl: function (resource) {
                return  _.template(RouteResourceTemplate, {resource: resource});
            },

            resourceRendered: function (resource, resource_el) {

                AccessControl.isAllowed(
                    resource.metadata.guid,
                    AccessControl.resources.route,
                    AccessControl.actions.update,
                    function () {
                        $('.btn-unmap-route', resource_el).show();
                    }
                );
            }
        });
    }
);