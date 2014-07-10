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
    'text!views/settings/logyard/templates/settings.html'],
    function ($, Backbone, _, Polyglot, Gravatar, Activity, MaintenanceMode, SettingsTemplate, AlertTemplate) {

        return Backbone.View.extend({

            events: {
            },

            initialize: function () {
                this.options.activity.close();
                this.render();
                this.getLogyardConfig();
            },

            render: function () {
                var template = _.template($(SettingsTemplate).filter('#settings-template').html().trim(), { polyglot: window.polyglot });

                $(template).appendTo(this.el);
            },

            renderLogyardDrains: function (logyard_config) {
                var template = _.template(
                    $(SettingsTemplate).filter('#settings-logyard-drains').html().trim(), {
                        polyglot: window.polyglot,
                        drains: logyard_config.drains
                    });

                $(template).appendTo(this.$('.logyard_drains'));
            },

            renderLogyardRetryLimits: function (logyard_config) {
                var template = _.template(
                    $(SettingsTemplate).filter('#settings-logyard-retry-limits').html().trim(), {
                        polyglot: window.polyglot,
                        limits: logyard_config.retrylimits
                    });

                $(template).appendTo(this.$('.logyard_retry_limits'));
            },

            getLogyardConfig: function () {

                var self = this,
                    drains_activity = new Activity(this.$('.logyard_drains')),
                    retry_limits_activity = new Activity(this.$('.logyard_retry_limits'));

                sconsole.cf_api.config.getConfig(
                    sconsole.cf_api.config.keys.logyard,
                    {},
                    function (err, logyard_config) {
                        drains_activity.close();
                        retry_limits_activity.close();
                        if (!err) {
                            self.renderLogyardDrains(logyard_config);
                            self.renderLogyardRetryLimits(logyard_config);
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
