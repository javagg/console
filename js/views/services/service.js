/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'async',
    'moment',
    'datatables',
    'datatables-bootstrap',
    'appsecute-api/lib/logger',
    'access/admin-access',
    'util/settings',
    'util/activity-indicator',
    'text!util/templates/alert.html',
    'views/lists/service-bindings-table-view',
    'text!views/services/templates/service.html'],
    function ($, Backbone, _, Polyglot, Async, Moment, DataTables, DataTablesBootstrap, Logger, AdminAccess, Settings, Activity, AlertTemplate, ServiceBindingsTableView, ServiceTemplate) {

        return Backbone.View.extend({

            logger: new Logger('Service'),

            events: {
                'click .btn-delete-service': 'deleteServiceClicked'
            },

            initialize: function () {
                this.options.activity.close();
                this.getService();
            },

            getService: function () {
                
                var self = this;
                sconsole.cf_api.service_instances.get(self.options.service_instance_guid, {
                    queries: {
                        'inline-relations-depth': 2, 
                        'include-relations': 'credentials,service,service_bindings,service_plan,space,organization'}
                }, function (err, service) {
                    if (err) {return self.logger.error(err);}
                    self.options.activity.close();
                    service.metadata.created_at_pretty = Moment(service.metadata.created_at).fromNow();
                    service.metadata.updated_at_pretty = service.metadata.updated_at ? Moment(service.metadata.updated_at).fromNow() : polyglot.t('n/a');
                    self.service = service;
                    self.render();
                });
            },

            render: function () {

                var template = _.template($(ServiceTemplate).filter('#service-template').html().trim(), {
                    service: this.service
                });

                $(template)
                    .appendTo(this.el);

                // only show the delete button if this service is not bound to any applications
                if (!this.service.entity.service_bindings.length) {
                    var delete_button_template = _.template($(ServiceTemplate).filter('#delete-service-template').html().trim(), {});

                    $(delete_button_template)
                        .appendTo($('.service-buttons'));
                }
                this.renderBindingsTable();
            },

            renderBindingsTable: function () {
                new ServiceBindingsTableView({
                    collection_options:{queries:{'inline-relations-depth': 2}, filter: {name: 'service_instance_guid', value: this.options.service_instance_guid} },
                    el: $('<div>').appendTo(this.$('.application_bindings')),
                    resource_clicked: this.bindingClicked,
                    context: this
                });
            },

            bindingClicked: function (binding, click_event) {
                sconsole.routers.application.showApplication(binding.entity.app.metadata.guid);
            },

            organizationClicked: function(event) {

                var organization_data = $(event.currentTarget).closest('.organization').data('organization');

                if (organization_data) {
                    sconsole.routers.organizations.showOrganization(organization_data.metadata.guid);
                }
            },

            deleteServiceClicked: function () {

                var space_guid = this.service.entity.space.metadata.guid;

                sconsole.routers.services.showDeleteServiceDialog(
                    this.service,
                    function (result) {
                        if (result && result.deleted) {
                            sconsole.routers.spaces.showSpace(space_guid);
                        }
                    },
                    this);
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
