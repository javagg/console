/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'async',
    'appsecute-api/lib/logger',
    'util/settings',
    'jqueryvalidation',
    'util/button-helper',
    'text!views/settings/dea/templates/general-dea-settings.ejs'],
    function ($, Backbone, _, Polyglot, Async, Logger, Settings, Validate, ButtonHelper, GeneralSettingsTemplate) {

        return Backbone.View.extend({

            events: {
                "click #save_dea_settings": 'saveDEASettings'
            },

            logger: new Logger('General DEA Settings'),

            initialize: function () {
                this.getDEAConfig();
            },

            renderDEAConfig: function (dea_config) {
                var template = _.template(GeneralSettingsTemplate, {
                        memory_max_percent: dea_config.resources.memory_max_percent,
                        max_staging_duration: dea_config.staging.max_staging_duration
                    });

                $(template)
                    .appendTo(this.el);

                // Monitor the form for changes, and enable the submit button when the form is dirty
                var that = this;
                this.$('#dea_settings_form :input').bind("keyup change", function (event) {
                    that.$('#dea_settings_form').addClass("dirty");
                    ButtonHelper.activate(that.$('#save_dea_settings'));
                });

                this.applyDEASettingsValidation();
            },

            applyDEASettingsValidation: function () {
                this.$('#dea_settings_form').validate({
                    errorPlacement: function (error, element) {
                        error.prependTo(element.closest('.col-lg-8'));
                    },
                    highlight: function (element, errorClass) {
                        $(element).closest('.form-group').addClass('has-error');
                    },
                    success: function (label, input) {
                        label.closest('.form-group').removeClass('has-error');
                        label.remove();  // no other way to hide it
                    },
                    rules: {
                        memory_max_percent: {
                            required: true,
                            positiveInt: true
                        }
                    }
                });
            },

            getDEAConfig: function () {
                var self = this;

                sconsole.cf_api.config.getDeaConfig({}, function (err, dea_config) {

                    if (!err) {
                        self.renderDEAConfig(dea_config);
                    }
                });
            },

            showDEASettingErrorMessage: function (errorMessage) {
                if (!errorMessage || !errorMessage.description) {
                    return;
                }
                this.$('.dea-settings-error').text(errorMessage.description).closest('.form-group').removeClass('hide');
            },

            hideDEASettingErrorMessage: function () {
                this.$('.dea-settings-error').text('').closest('.form-group').addClass('hide');
            },

            saveDEASettings: function (event) {
                if (!this.$('#dea_settings_form').valid()) {
                    return;
                }

                var that = this;
                var submit_button = this.$(event.target);
                ButtonHelper.saving(submit_button);
                var memory_max_percent = parseInt($('#memory_max_percent').val(), 10);
                var max_staging_duration = parseInt($('#max_staging_duration').val());

                this.hideDEASettingErrorMessage();

                Async.parallel({
                    memory: function (done) {
                        sconsole.cf_api.config.updateDeaConfigValue(
                            'resources',
                            {memory_max_percent: memory_max_percent},
                            {},
                            done
                        );
                    },
                    duration: function (done) {
                        sconsole.cf_api.config.updateDeaConfigValue(
                            'staging',
                            {max_staging_duration: max_staging_duration},
                            {},
                            done
                        );
                    },
                    runtime: function (done) {
                        sconsole.cf_api.config.updateCloudControllerConfigValue(
                            'staging',
                            {max_staging_runtime: max_staging_duration},
                            {},
                            done
                        );
                    }
                }, function (err, results) {
                    if (err) {
                        ButtonHelper.saveFailure(submit_button);
                        that.showDEASettingErrorMessage(err);
                    }
                    else {
                        ButtonHelper.saveSuccess(submit_button);
                        that.$('#restart_role').removeClass('hide');
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
