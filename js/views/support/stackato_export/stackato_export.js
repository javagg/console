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
    'text!views/support/stackato_export/templates/stackato_export.html'],
    function ($, Backbone, _, Polyglot, Gravatar, Activity, MaintenanceMode, Settings, SupportTemplate) {

        return Backbone.View.extend({

            events: {
                "click #generate_stackato_export": 'generateReport'
            },

            initialize: function () {
                this.options.activity.close();
                this.render();
                this.renderExportStatus();
            },

            render: function () {
                var report_url = '/stackato/report?hostname=' + location.hostname;
                var template = _.template($(SupportTemplate).filter('#support-template').html().trim(), { polyglot: window.polyglot, report_url: report_url, settings: Settings.getSettings() });

                $(template)
                    .appendTo(this.el);
            },

            renderExportStatus: function () {

                var export_status_el = $('.stackato_export_status');
                $(export_status_el).empty();

                sconsole.cf_api.getApiInfo(function (err, info) {
                    if (err) {return;}

                    if (info.maintenance_mode) {
                        // if we're in maintenance mode, then show the available export (if available) and the generate export button
                        this.getExportInfo();
                    }
                    else {
                        // otherwise show the "maintenance mode required" notice

                        var generate_export_template = _.template($(SupportTemplate).filter('#not_in_maintenance_mode').html().trim(), { polyglot: window.polyglot, settings: Settings.getSettings() });

                        $(generate_export_template)
                            .appendTo(export_status_el);
                    }
                });
            },

            getExportInfo: function () {

                var self = this;
                sconsole.cf_api.export.getInfo({}, function (err, export_info) {
                    if (export_info.export_in_progress) {
                        self.renderExportInProgress();
                        // if there's an export in progress, check for changes periodically.
                        setTimeout(self.renderExportStatus, 1000);
                    }
                    else {
                        self.renderExportButtons(export_info.export_available);
                    }
                });
            },

            renderExportButtons: function (export_available) {
                var export_status_el = $('.stackato_export_status');

                $(export_status_el).empty();

                if (export_available) {
                    var timestamp = new Date(export_available);
                    var export_available_template = _.template($(SupportTemplate).filter('#download_export').html().trim(), { polyglot: window.polyglot, export_timestamp: timestamp.toLocaleString() });

                    $(export_available_template)
                        .appendTo(export_status_el);
                }

                var generate_export_template = _.template($(SupportTemplate).filter('#create_export').html().trim(), { polyglot: window.polyglot });

                $(generate_export_template)
                    .appendTo(export_status_el);
            },

            renderExportInProgress: function () {
                var export_status_el = $('.stackato_export_status');

                // if there's an export being generated, show message
                var template = _.template($(SupportTemplate).filter('#export_in_progress').html().trim(), { polyglot: window.polyglot });

                $(export_status_el).empty();

                $(template)
                    .appendTo(export_status_el);
            },

            generateReport: function () {
                // show export in progress message
                this.renderExportInProgress();
                var that = this;

                // poll for export status until available
                var intervalId = setInterval(function () {
                    // use regular ajax here so that it's not cancelled when the page starts the download
                    $.ajax({ url: "/stackato/export_info", success: function (data) {
                        if (!data.export_in_progress && data.export_available) {
                            clearInterval(intervalId);
                            that.renderExportButtons(data.export_available);
                        }
                    }, dataType: "json"});
                }, 1000);
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
