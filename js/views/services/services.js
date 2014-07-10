/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'views/lists/service-table-view',
    'views/lists/available-services-list-view',
    'text!views/services/templates/services.html'],
    function ($, Backbone, _, Polyglot, ServiceTableView, AvailableServicesListView, ServicesTemplate) {

        return Backbone.View.extend({

            initialize: function () {
                this.options.activity.close();
                this.render();
                this.renderServicesTable();
                this.renderAvailableServicesList();
            },

            render: function () {

                var template = _.template($(ServicesTemplate).filter('#services-template').html().trim(), { polyglot: window.polyglot });

                $(template)
                    .appendTo(this.el);
            },

            renderServicesTable: function () {
                var that = this;

                new ServiceTableView({
                    collection_options:{queries:{'inline-relations-depth': 2}},
                    el: $('<div>').appendTo(this.$('.services-table')),
                    resource_clicked: that.serviceClicked,
                    context: this
                });
            },

            renderAvailableServicesList: function() {
                new AvailableServicesListView({
                    collection_options: {queries:{'q': 'active:true'}},
                    el: $('<div>').appendTo(this.$('.available-services-list')),
                    context: this,
                    disable_search_bar: true
                });
            },

            serviceClicked: function(service, e) {
                e.preventDefault();
                sconsole.routers.services.showService(service.metadata.guid);
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
