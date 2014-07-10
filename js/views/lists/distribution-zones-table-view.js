/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'jquery-ltruncate',
    'views/lists/table-view',
    'text!views/lists/templates/distribution-zones-table-view-resource.ejs',
    'text!views/lists/templates/distribution-zones-table-view-page-container.ejs'],
    function ($, Backbone, _, Polyglot, LTruncate, TableView, TableResourceTemplate, TablePageContainerTemplate) {

        return TableView.extend({

            initialize: function () {

                if (!this.options.collection) {
                    this.options.collection = sconsole.cf_api.zones;
                }

                TableView.prototype.initialize.apply(this);
            },

            renderPageContainer: function () {
                var template = _.template(TablePageContainerTemplate, {});

                this.$('.page').append(template);
            },

            makeResourceEl: function (resource) {
                return  _.template(TableResourceTemplate, {resource: resource});
            },

            resourceRendered: function (resource, resource_el) {
                // truncate the list if there are more than 3 DEAs in the distribution zone
                $('ul', resource_el).lTruncate({
                    length: 3,
                    showClass: 'more',
                    showText: polyglot.t('more'),
                    hideClass: 'less',
                    hideText: polyglot.t('less'),
                    showCountHiddenItems: true,
                    startStatus: 'hidden'
                });
            }
        });
    }
);