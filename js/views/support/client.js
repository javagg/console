/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'util/settings',
    'text!views/support/templates/client.html'],
    function ($, Backbone, _, Polyglot, Settings, ClientTemplate) {

        return Backbone.View.extend({

            events: {
            },

            initialize: function () {
                this.options.activity.close();
                this.client_version = '3.0.6';      //TODO: move this somewhere more sensible, maybe?
                this.render();
            },

            render: function () {

                var template = _.template($(ClientTemplate).filter('#client-template').html().trim(), {
                    settings: Settings.getSettings(),
                    client_version: this.client_version,
                    host: sconsole.cf_api.api_endpoint });

                $(template)
                    .appendTo(this.el);

                this.renderSuggestedDownload();
            },

            renderSuggestedDownload: function () {
                var OSName = "";
                var OSDisplay = "";
                if (navigator.platform.indexOf("Win") != -1) {
                    OSName = "win";
                    OSDisplay = "client.platforms.windows";
                }
                if (navigator.platform.indexOf("Mac") != -1) {
                    OSName = "mac";
                    OSDisplay = "client.platforms.mac";
                }
                if (navigator.platform.indexOf("Linux i686") != -1) {
                    OSName = "linux32";
                    OSDisplay = "client.platforms.linux";
                }
                if (navigator.platform.indexOf("Linux x86_64") != -1) {
                    OSName = "linux64";
                    OSDisplay = "client.platforms.linux64";
                }

                if (OSName) {
                    var url = $('#' + OSName).attr('href');
                    $('#' + OSName).parent().remove();

                    var template = _.template($(ClientTemplate).filter('#suggested-download-template').html().trim(), { 'client_version': this.client_version, 'OSName': OSName, 'OSDisplay': OSDisplay, 'url': url });

                    $(template)
                        .appendTo($('#suggested_download'));
                } else {
                    // no recommended download for your platform
                    // TODO: show message here
                }

            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
