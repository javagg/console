/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'jqueryvalidation',
    'backbone',
    'underscore',
    'polyglot',
    'async',
    'util/gravatar',
    'util/activity-indicator',
    'util/maintenance-mode',
    'util/button-helper',
    'util/role-count',
    'text!views/settings/mysql/templates/settings.html',
    'text!util/templates/alert.html'],
    function ($, Validate, Backbone, _, Polyglot, Async, Gravatar, Activity, MaintenanceMode, ButtonHelper, RoleCount, SettingsTemplate, AlertTemplate) {

        return Backbone.View.extend({

            events: {
                "click #save_mysql_settings": 'saveMySQLSettings'
            },

            initialize: function () {
                this.options.activity.close();
                this.render();
                this.getMySQLConfig();
                RoleCount.renderNodeCount('mysql', '.role-count-container');
            },

            render: function () {
                var template = _.template($(SettingsTemplate).filter('#settings-template').html().trim(), { polyglot: window.polyglot });

                $(template).appendTo(this.el);

                // Monitor the form for changes, and enable the submit button when the form is dirty
                var that = this;
                this.$('#mysql_settings_form').on("keyup change", ':input', function (event) {
                    that.$(event.target).addClass('dirty');
                    that.$('#mysql_settings_form').addClass("dirty");
                    ButtonHelper.activate(that.$('#save_mysql_settings'));
                });
            },

            renderMySQLNodeConfig: function (config) {
                var template = _.template($(SettingsTemplate).filter('#settings-mysql-node-config').html().trim(), {
                    polyglot: window.polyglot,
                    capacity: config.capacity,
                    max_db_size: config.max_db_size
                });

                $(template).appendTo(this.$('#mysql_node_settings'));

                this.applyMySQLNodeValidation();
            },

            applyMySQLNodeValidation: function () {
                this.$('#mysql_settings_form').validate({
                    errorPlacement: function (error, element) {
                        error.appendTo(element.closest('.col-lg-10'));
                    },
                    highlight: function (element, errorClass) {
                        $(element).closest('.form-group').addClass('has-error');
                    },
                    success: function (label, input) {
                        label.closest('.form-group').removeClass('has-error');
                        label.remove();  // no other way to hide it
                    },
                    rules: {
                        capacity: {
                            required: true,
                            positiveInt: true
                        },
                        max_db_size: {
                            required: true,
                            positiveInt: true
                        }
                    }
                });
            },

            renderMySQLGatewayConfig: function (config) {
                var allow_overprovisioning = false;
                if (config.plan_management) {
                    allow_overprovisioning = config.plan_management.plans.free.allow_over_provisioning ? 'checked="checked"' : '';
                }
                var template = _.template($(SettingsTemplate).filter('#settings-mysql-gateway-config').html().trim(), {
                    polyglot: window.polyglot,
                    allow_overprovisioning: allow_overprovisioning
                });

                $(template)
                    .appendTo(this.$('#mysql_gateway_settings'));
            },

            getMySQLConfig: function () {

                var self = this,
                    node_activity = new Activity(this.$('#mysql_node_settings')),
                    gateway_activity = new Activity(this.$('#mysql_gateway_settings'));

                sconsole.cf_api.config.getMySQLNodeConfig({}, function (err, mysql_node_config) {
                    node_activity.close();
                    if (!err) {
                        self.renderMySQLNodeConfig(mysql_node_config);
                    }
                });

                sconsole.cf_api.config.getMySQLGatewayConfig({}, function (err, mysql_gateway_config) {
                    gateway_activity.close();
                    if (!err) {
                        self.renderMySQLGatewayConfig(mysql_gateway_config);
                    }
                });
            },

            showSystemSettingErrorMessage: function (errorMessage) {
                if (!errorMessage || !errorMessage.description) {
                    return;
                }
                this.$('.mysql-settings-error').text(errorMessage.description).closest('.form-group').removeClass('hide');
            },

            hideSystemSettingErrorMessage: function () {
                this.$('.mysql-settings-error').text('').closest('.form-group').addClass('hide');
            },

            saveMySQLSettings: function (event) {
                if (!this.$('#mysql_settings_form').valid()) {
                    return;
                }

                var submit_button = $(event.target).closest('button');
                ButtonHelper.saving(submit_button);
                this.hideSystemSettingErrorMessage();

                var capacity = parseInt(this.$('#capacity').val(), 10);
                var max_db_size = parseInt(this.$('#max_db_size').val(), 10);
                var allow_overprovisioning = this.$('#allow_overprovisioning').is(':checked');

                // check which processes need to be restarted
                this.node_dirty = (this.$('#capacity').hasClass('dirty') || this.$('#max_db_size').hasClass('dirty'));
                this.gateway_dirty = this.$('#allow_overprovisioning').hasClass('dirty');

                var that = this;
                Async.parallel({
                    capacity: function (done) {
                        sconsole.cf_api.config.updateMySQLNodeConfigValue('capacity', capacity, {}, done);
                    },
                    db_size: function (done) {
                        sconsole.cf_api.config.updateMySQLNodeConfigValue('max_db_size', max_db_size, {}, done);
                    },
                    overprovisioning: function (done) {
                        sconsole.cf_api.config.updateMySQLGatewayConfigValue(
                            'plan_management',
                            {
                                plans: {
                                    free: {
                                        allow_over_provisioning: allow_overprovisioning
                                    }
                                }
                            },
                            {},
                            done);
                    }
                }, function (err, results) {
                    if (err) {
                        ButtonHelper.saveFailure(submit_button);
                        that.showSystemSettingErrorMessage(err);
                    }
                    else {
                        ButtonHelper.saveSuccess(submit_button);
                        var dirty_warning;
                        if (that.node_dirty && that.gateway_dirty) {
                            dirty_warning = "#restart_role";
                            // hide any existing process restart alerts, as they'll be covered by the role restart
                            that.$('.restart-process').addClass('hide');
                        }
                        else {
                            if (that.node_dirty) { dirty_warning = "#restart_node" }
                            if (that.gateway_dirty) { dirty_warning = "#restart_gateway"}
                        }
                        that.$(dirty_warning).removeClass('hide');
                    }
                });
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
