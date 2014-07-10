/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'views/lists/list-view',
    'text!views/lists/templates/available-services-list-view-resource.ejs',
    'text!views/lists/templates/available-services-list-view-page-container.ejs'],
    function ($, Backbone, _, ListView, ListResourceTemplate, ListPageContainerTemplate) {

        return ListView.extend({

            initialize: function () {

                if (!this.options.collection) {
                    this.options.collection = sconsole.cf_api.services;
                }

                ListView.prototype.initialize.apply(this);
            },

            renderPageContainer: function () {

                var template = _.template(ListPageContainerTemplate, {});

                this.$('.page')
                    .append(template);
            },

            makeResourceEl: function (resource) {
                return  _.template(ListResourceTemplate, {resource: resource});
            }
        });
    }
);
