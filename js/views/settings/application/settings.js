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
    'util/settings',
    'text!views/settings/application/templates/settings.html',
    'text!util/templates/alert.html'],
    function ($, Backbone, _, Polyglot, Gravatar, Activity, MaintenanceMode, Settings, SettingsTemplate, AlertTemplate) {

        return Backbone.View.extend({

            events: {
                "click .delete_reserved_uri": 'deleteReservedURI',
                "click #add_reserved_uri": 'addReservedURI'
            },

            initialize: function () {
                this.options.activity.close();
                this.render();
                this.getCloudControllerConfig();
            },

            render: function () {

                var template = _.template($(SettingsTemplate).filter('#settings-template').html().trim(), { polyglot: window.polyglot });

                $(template)
                    .appendTo(this.el);
            },

            renderReservedURIsConfig: function (cc_config) {

                var cc_maintenance_mode = cc_config.maintenance_mode ? 'checked="checked"' : '';
                var template = _.template(
                    $(SettingsTemplate).filter('#settings-reserved-uris-config').html().trim(), {
                        polyglot: window.polyglot,
                        reserved_uris: cc_config.app_uris.reserved_list
                    });

                this.$('.reserved_uris').empty();

                $(template)
                    .appendTo(this.$('.reserved_uris'));
            },

            getCloudControllerConfig: function () {

                var self = this,
                    reserved_uris_activity = new Activity(this.$('.allowed_repos'));

                sconsole.cf_api.config.getCloudControllerConfig({}, function (err, cc_config) {
                    reserved_uris_activity.close();
                    if (err) {return;}
                    self.renderReservedURIsConfig(cc_config);
                });
            },

            deleteReservedURI: function (event) {

                // get the data-url value from the button
                var self = this,
                    uri_to_delete = $(event.target).data('uri');

                // get the list of URLs fresh from the server to reduce chance of overwriting values
                sconsole.cf_api.config.getCloudControllerConfig({}, function (err, cc_config) {
                    if (err) {return;}

                    // remove the deleted uri from the list
                    var app_uris = cc_config.app_uris;
                    app_uris.reserved_list = _.reject(app_uris.reserved_list, function (uri) { return uri == uri_to_delete });

                    sconsole.cf_api.config.updateCloudControllerConfigValue(
                        'app_uris',
                        app_uris,
                        {},
                        function (err) {
                            if (err) {return;}
                            self.renderReservedURIsConfig({app_uris: app_uris});
                        }
                    );
                });
            },

            addReservedURI: function (event) {

                // get the data-uri value from the button
                var self = this,
                    uri_to_add = $('#new_reserved_uri').val();

                // get the list of URLs fresh from the server to reduce chance of overwriting values
                if (uri_to_add) {

                    sconsole.cf_api.config.getCloudControllerConfig({}, function (err, cc_config) {
                        if (err) {return;}

                        var app_uris = cc_config.app_uris;

                        // if the store hasn't already been added, add it
                        if (!_.find(app_uris.reserved_list, function (uri) { return uri == uri_to_add })) {
                            app_uris.reserved_list.push(uri_to_add);

                            sconsole.cf_api.config.updateCloudControllerConfigValue(
                                'app_uris',
                                app_uris,
                                {},
                                function (err) {
                                    if (err) {return;}
                                    self.renderReservedURIsConfig({app_uris: app_uris});
                                }
                            );
                        }
                    });
                }
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
