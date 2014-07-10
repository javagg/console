/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'views/lists/list-view',
    'text!views/lists/templates/table-view-resource.ejs',
    'text!views/lists/templates/table-view-page-container.ejs'],
    function ($, Backbone, _, ListView, TableResourceTemplate, TablePageContainerTemplate) {

        return ListView.extend({

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