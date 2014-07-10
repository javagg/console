/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'appsecute-api/lib/utils',
    'util/gravatar',
    'util/activity-indicator',
    'util/random-id',
    'util/settings',
    'text!views/support/stackato_report/templates/stackato_report.html'],
    function ($, Backbone, _, Polyglot, Utils, Gravatar, Activity, RandomID, Settings, SupportTemplate) {

        return Backbone.View.extend({

            events: {
                "click .btn-download-report": "downloadReportClicked"
            },

            initialize: function () {
                this.options.activity.close();
                this.render();
            },

            render: function () {
                var template = _.template($(SupportTemplate).filter('#support-template').html().trim(), { polyglot: window.polyglot, settings: Settings.getSettings() });

                $(template)
                    .appendTo(this.el);
            },

            downloadReportClicked: function (event) {

                var secret = RandomID.make_random_id(12),
                    download_button = $(event.target),
                    report_url = sconsole.cf_api.api_endpoint + "/v2/stackato/report/file/" + secret;

                sconsole.cf_api.cluster.generateClusterReport(secret, {}, function (err) {
                    if (err) {return;}

                    $(download_button).addClass('hidden');
                    $('#download-report-link').attr('href', report_url).removeClass('hidden');
                    setTimeout(function () {
                        // expire the report link after 60 seconds
                        $(download_button).removeClass('hidden');
                        $('#download-report-link').attr('href', "").addClass('hidden');
                    }, 60000);
                });
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
