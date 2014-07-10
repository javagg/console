/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'async',
    'util/gravatar',
    'util/activity-indicator',
    'util/maintenance-mode',
    'util/button-helper',
    'util/role-count',
    'text!views/settings/rabbitmq3/templates/settings.html',
    'text!util/templates/alert.html'],
    function ($, Backbone, _, Polyglot, Async, Gravatar, Activity, MaintenanceMode, ButtonHelper, RoleCount, SettingsTemplate, AlertTemplate) {

        return Backbone.View.extend({

            events: {
                "click #save_rabbitmq_settings": 'saveRabbitMQSettings'
            },

            initialize: function () {
                this.options.activity.close();
                this.render();
                this.getRabbitMQConfig();
                RoleCount.renderNodeCount('rabbit3', '.role-count-container');
            },

            render: function () {

                var template = _.template($(SettingsTemplate).filter('#settings-template').html().trim(), { polyglot: window.polyglot });

                $(template)
                    .appendTo(this.el);

                // Monitor the form for changes, and enable the submit button when the form is dirty
                var that = this;
                this.$('#rabbitmq_settings_form').on("keyup change", ':input', function (event) {
                    that.$(event.target).addClass('dirty');
                    that.$('#rabbitmq_settings_form').addClass("dirty");
                    ButtonHelper.activate(that.$('#save_rabbitmq_settings'));
                });
            },

            renderRabbitMQNodeConfig: function (config) {
                var template = _.template($(SettingsTemplate).filter('#settings-rabbitmq-node-config').html().trim(), {
                    polyglot: window.polyglot,
                    capacity: config.capacity,
                    max_memory: config.max_memory
                });

                $(template)
                    .appendTo(this.$('#rabbitmq_node_settings'));

                this.applyRabbitMQNodeValidation();
            },

            applyRabbitMQNodeValidation: function () {
                this.$('#rabbitmq_settings_form').validate({
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
                        max_memory: {
                            required: true,
                            positiveInt: true
                        }
                    }
                });
            },

            renderRabbitMQGatewayConfig: function (config) {
                var allow_overprovisioning = config.plan_management.plans.free.allow_over_provisioning ? 'checked="checked"' : '';
                var template = _.template($(SettingsTemplate).filter('#settings-rabbitmq-gateway-config').html().trim(), {
                    polyglot: window.polyglot,
                    allow_overprovisioning: allow_overprovisioning
                });

                $(template)
                    .appendTo(this.$('#rabbitmq_gateway_settings'));
            },

            showSystemSettingErrorMessage: function (errorMessage) {
                if (!errorMessage || !errorMessage.description) {
                    return;
                }
                this.$('.settings-error').text(errorMessage.description).closest('.form-group').removeClass('hide');
            },

            hideSystemSettingErrorMessage: function () {
                this.$('.settings-error').text('').closest('.form-group').addClass('hide');
            },

            getRabbitMQConfig: function () {

                var self = this,
                    node_activity = new Activity(this.$('#rabbitmq_node_settings')),
                    gateway_activity = new Activity(this.$('#rabbitmq_gateway_settings'));

                sconsole.cf_api.config.getRabbit3NodeConfig({}, function (err, rabbit_node_config) {
                    node_activity.close();
                    if (!err) {
                        self.renderRabbitMQNodeConfig(rabbit_node_config);
                    }
                });

                sconsole.cf_api.config.getRabbit3GatewayConfig({}, function (err, rabbit_gateway_config) {
                    gateway_activity.close();
                    if (!err) {
                        self.renderRabbitMQGatewayConfig(rabbit_gateway_config);
                    }
                });
            },

            saveRabbitMQSettings: function (event) {
                if (!this.$('#rabbitmq_settings_form').valid()) {
                    return;
                }

                var that = this;
                var submit_button = this.$(event.target);
                ButtonHelper.saving(submit_button);

                var capacity = parseInt(this.$('#capacity').val());
                var max_memory = parseInt(this.$('#max_memory').val());
                var allow_overprovisioning = this.$('#allow_overprovisioning').is(':checked');

                // check which processes need to be restarted
                this.node_dirty = (this.$('#capacity').hasClass('dirty') || this.$('#max_memory').hasClass('dirty'));
                this.gateway_dirty = this.$('#allow_overprovisioning').hasClass('dirty');

                this.hideSystemSettingErrorMessage();

                Async.parallel({
                    capacity: function (done) {
                        sconsole.cf_api.config.updateRabbit3NodeConfigValue('capacity', capacity, {}, done);
                    },
                    max_memory: function (done) {
                        sconsole.cf_api.config.updateRabbit3NodeConfigValue('max_memory', max_memory, {}, done);
                    },
                    overprovisioning: function (done) {
                        sconsole.cf_api.config.updateRabbit3GatewayConfigValue(
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
