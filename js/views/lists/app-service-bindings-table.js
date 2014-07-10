/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'views/lists/service-binding-list',
    'text!views/lists/templates/app-service-bindings-table-resource.ejs',
    'text!views/lists/templates/app-service-bindings-table-container.ejs'],
    function ($, Backbone, _, ServiceBindingList, TableResourceTemplate, TablePageContainerTemplate) {

        return ServiceBindingList.extend({

            initialize: function () {

                if (!this.options.collection) {
                    this.options.collection = sconsole.cf_api.service_bindings;
                }
                this.options.collection_options = this.options.collection_options || {};
                this.options.collection_options.queries = {'inline-relations-depth': 1};

                ServiceBindingList.prototype.initialize.apply(this);
            },

            renderPageContainer: function () {

                var template = _.template(TablePageContainerTemplate, {});

                this.$('.page')
                    .append(template);
            },

            makeResourceEl: function (resource) {

                if (!resource.entity.owning_organization_guid) {
                    resource.entity.owning_organization = {entity: {name: 'Shared Domain'}};
                }

                return  _.template(TableResourceTemplate, {resource: resource});
            }
        });
    }
);