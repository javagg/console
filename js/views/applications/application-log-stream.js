/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'moment',
    'crypto/md5',
    'util/activity-indicator',
    'appsecute-api/lib/logger',
    'text!views/applications/templates/application-log-entry.ejs',
    'text!views/applications/templates/application-log-stream.ejs'],
    function ($, Backbone, _, Moment, Crypto, Activity, Logger, LineTemplate, LogStreamTemplate) {

        return Backbone.View.extend({

            logger: new Logger('Application Log Stream'),

            polling_interval_ms: 500,

            line_hashes: {},

            initialize: function () {
                this.line_hashes = {};
                this.render();
                this.pollLog();
                this.startPollingTimer();
            },

            render: function () {

                var template = _.template(LogStreamTemplate, {polyglot: window.polyglot });

                $(template)
                    .appendTo(this.el);
            },

            startPollingTimer: function () {

                this.stopPollingTimer();

                var self = this;
                this.polling_timer = setInterval(function () {
                        self.pollLog.call(self);
                    },
                    this.polling_interval_ms);
            },

            stopPollingTimer: function () {
                if (this.polling_timer) {
                    clearInterval(this.polling_timer);
                }
            },

            pollLog: function () {

                var self = this;
                sconsole.cf_api.apps.getLogTail(
                    this.options.application_guid,
                    400,
                    {global: false},
                    function (err, res) {
                        if (err) {
                            return self.logger.error(err);
                        }

                        self.renderLogLines(res.body.lines);
                    });
            },

            renderLogLines: function (lines) {

                var self = this;
                _.each(lines, function (line) {

                    // We need to filter out duplicates due to limitations of stackato_logs api
                    var line_hash = Crypto.MD5(line.text + ':' + line.timestamp);

                    if (!self.line_hashes[line_hash]) {
                        self.renderLogLine.call(self, line);
                        self.line_hashes[line_hash] = true;
                    }
                });
            },

            renderLogLine: function (line) {

                line.timestamp_pretty = Moment.unix(line.timestamp).toISOString();

                var template = _.template(LineTemplate, {line: line});

                $(template)
                    .prependTo(this.$('.log-stream'));
            },

            close: function () {
                this.stopPollingTimer();
                this.remove();
                this.unbind();
            }
        });
    }
);