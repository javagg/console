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
    'text!views/settings/stager/templates/settings.html',
    'text!util/templates/alert.html'],
    function ($, Backbone, _, Polyglot, Gravatar, Activity, MaintenanceMode, SettingsTemplate, AlertTemplate) {

        return Backbone.View.extend({

            events: {
                "click #save_stager_settings": 'saveStagerSettings'
            },

            initialize: function () {
                this.options.activity.close();
                this.render();
                this.getStagerConfig();
            },

            render: function () {

                var template = _.template($(SettingsTemplate).filter('#settings-template').html().trim(), { polyglot: window.polyglot });

                $(template)
                    .appendTo(this.el);
            },

            renderStagerConfig: function (stager_config) {
                var template = _.template(
                    $(SettingsTemplate).filter('#settings-stager-config').html().trim(), {
                        polyglot: window.polyglot,
                        max_staging_duration: stager_config.max_staging_duration
                    });

                $(template)
                    .appendTo(this.$('.stager_config'));

                // Monitor the form for changes, and enable the submit button when the form is dirty
                var that = this;
                this.$('#stager_settings_form :input').bind("keyup change", function (event) {
                    that.$('#stager_settings_form').addClass("dirty");
                    that.$('#save_stager_settings').removeClass("disabled").addClass("btn-primary");
                });
            },

            getStagerConfig: function () {

                var self = this,
                    stager_config_activity = new Activity(this.$('.stager_config'));

                sconsole.cf_api.config.getStagerConfig({}, function (err, stager_config) {
                    stager_config_activity.close();
                    if (!err) {
                        self.renderStagerConfig(stager_config);
                    }
                });
            },

            saveStagerSettings: function (event) {

                var submit_button = this.$(event.target);
                submit_button.html(window.polyglot.t('saving_changes'));

                var max_staging_duration = parseInt($('#max_staging_duration').val());

                sconsole.cf_api.config.updateStagerConfigValue('max_staging_duration', max_staging_duration, {}, function (err) {
                    if (err) {return;}

                    // once the request has completed, change button text and status
                    submit_button.html(window.polyglot.t('changes_saved'));
                    setTimeout(function () {
                        submit_button.html(window.polyglot.t('save_changes'));
                        submit_button.addClass('disabled').removeClass('btn-primary');
                    }, 1000);
                });
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
