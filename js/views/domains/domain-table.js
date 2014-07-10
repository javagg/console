/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'views/lists/domain-list',
    'text!views/domains/templates/domain-table-resource.ejs',
    'text!views/domains/templates/domain-table-container.ejs'],
    function ($, Backbone, _, DomainList, TableResourceTemplate, TablePageContainerTemplate) {

        return DomainList.extend({

            initialize: function () {

                this.options.collection = sconsole.cf_api.domains;
                this.options.collection_options = this.options.collection_options || {};
                this.options.collection_options.queries = {'inline-relations-depth': 1, 'include-relations': 'owning_organization'};

                DomainList.prototype.initialize.apply(this);
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