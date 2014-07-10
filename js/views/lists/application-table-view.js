/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'util/settings',
    'views/lists/table-view',
    'text!views/lists/templates/application-table-view-resource.ejs',
    'text!views/lists/templates/application-table-view-page-container.ejs'],
    function ($, Backbone, _, Settings, TableView, TableResourceTemplate, TablePageContainerTemplate) {

        return TableView.extend({

            initialize: function () {

                if (!this.options.collection) {
                    this.options.collection = sconsole.cf_api.apps;
                }

                this.options.collection_options = this.options.collection_options || {};
                this.options.collection_options.queries = {
                        'inline-relations-depth': 2,
                        'include-relations': 'space,organization'
                };
                this.options.collection_options.order_by_fields = [
                    ['name', 'applications.app_name'],
                    ['state', 'applications.state']
                ];
                this.options.collection_options.filter_by_fields = [
                        {name: 'state',
                            label: 'applications.state',
                            values: [
                                ['STOPPED', 'application.state.stopped'],
                                ['STARTED', 'application.state.started']
                            ]},
                        {name: 'sso_enabled', 
                            label: 'applications.sso',
                            values: [
                                [false, 'applications.sso.public_access'],
                                [true, 'applications.sso.stackato_user_access', null, {product_name: Settings.getSettings().product_name}]
                            ]},
                        {name: 'restart_required', label: 'applications.restart_required'}
                ];

                TableView.prototype.initialize.apply(this);
            },

            renderPageContainer: function () {

                var template = _.template(TablePageContainerTemplate, {});

                this.$('.page')
                    .append(template);
            },

            makeResourceEl: function (resource) {
                return  _.template(TableResourceTemplate, {resource: resource, 'product_name': Settings.getSettings().product_name});
            }
        });
    }
);