/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'views/lists/application-table-view',
    'text!views/applications/templates/applications.html'],
    function ($, Backbone, _, Polyglot, TableView, ApplicationsTemplate) {

        return Backbone.View.extend({

            events: {
                'click #app_store_btn': 'appStoreBtnClicked'
            },

            initialize: function () {
                this.options.activity.close();
                this.render();
            },

            render: function () {

                var template = _.template($(ApplicationsTemplate).filter('#applications-template').html().trim(), {});

                $(template)
                    .appendTo(this.el);

                this.app_table = new TableView({
                    el: this.$('.apps-table'),
                    resource_clicked: this.applicationClicked,
                    context: this
                });
            },

            applicationClicked: function (application, click_event) {
                sconsole.routers.application.showApplication(application.metadata.guid);
            },

            appStoreBtnClicked: function (event) {
                event.preventDefault();
                sconsole.routers.store.showStore();
            },

            close: function () {

                if (this.app_table) {
                    this.app_table.close();
                }

                this.remove();
                this.unbind();
            }
        });
    }
);
