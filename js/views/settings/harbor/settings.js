/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'util/gravatar',
    'util/activity-indicator',
    'util/maintenance-mode',
    'util/button-helper',
    'util/role-count',
    'text!views/settings/harbor/templates/settings.html',
    'text!util/templates/alert.html'],
    function ($, Backbone, _, Polyglot, Gravatar, Activity, MaintenanceMode, ButtonHelper, RoleCount, SettingsTemplate, AlertTemplate) {

        return Backbone.View.extend({

            events: {
                "click #save_harbor_settings": 'saveHarborSettings'
            },

            initialize: function () {
                this.options.activity.close();
                this.render();
                this.getHarborConfig();
                RoleCount.renderNodeCount('harbor', '.role-count-container');
            },

            render: function () {

                var template = _.template($(SettingsTemplate).filter('#settings-template').html().trim(), { polyglot: window.polyglot });

                $(template)
                    .appendTo(this.el);
            },

            renderHarborConfig: function (harbor_config) {
                var template = _.template(
                    $(SettingsTemplate).filter('#settings-harbor-config').html().trim(), {
                        polyglot: window.polyglot,
                        port_range_minimum: harbor_config.port_range.min,
                        port_range_maximum: harbor_config.port_range.max
                    });

                $(template)
                    .appendTo(this.$('.harbor_config'));

                // Monitor the form for changes, and enable the submit button when the form is dirty
                var that = this;
                this.$('#harbor_settings_form :input').bind("keyup change", function (event) {
                    that.$('#harbor_settings_form').addClass("dirty");
                    ButtonHelper.activate(that.$('#save_harbor_settings'));
                });

                this.applyHarborConfigValidation();
            },

            applyHarborConfigValidation: function () {
                this.$('#harbor_settings_form').validate({
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
                        port_range_minimum: {
                            required: true,
                            positiveInt: true
                        },
                        port_range_maximum: {
                            required: true,
                            positiveInt: true
                        }
                    }
                });
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

            getHarborConfig: function () {

                var self = this,
                    harbor_config_activity = new Activity(this.$('.harbor_config'));

                sconsole.cf_api.config.getHarborNodeConfig({}, function (err, harbor_node_config) {
                    harbor_config_activity.close();
                    if (!err) {
                        self.renderHarborConfig(harbor_node_config);
                    }
                });
            },

            saveHarborSettings: function (event) {
                if (!this.$('#harbor_settings_form').valid()) {
                    return;
                }

                var submit_button = this.$(event.target);
                ButtonHelper.saving(submit_button);

                this.hideSystemSettingErrorMessage();

                var that = this,
                    min = parseInt($('#port_range_minimum').val()),
                    max = parseInt($('#port_range_maximum').val());

                sconsole.cf_api.config.updateHarborNodeConfigValue(
                    'port_range',
                    {min: min, max: max},
                    {},
                    function (err) {
                        if (err) {
                            ButtonHelper.saveFailure(submit_button);
                            that.showSystemSettingErrorMessage(err.message);
                        } else {
                            ButtonHelper.saveSuccess(submit_button);
                            that.$('#restart_node').removeClass('hide');
                        }
                    }
                );
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
