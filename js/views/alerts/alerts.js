/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'growl',
    'appsecute-api/lib/logger',
    'text!views/alerts/templates/alert.ejs',
    'text!views/alerts/templates/alerts.ejs'],
    function ($, Backbone, _, Growl, Logger, AlertTemplate, AlertsTemplate) {

        return Backbone.View.extend({

            events: {
                'click .alert': 'alertClicked'
            },

            logger: new Logger('Alerts'),

            polling_interval_ms: 5000,

            alert_severity: {
                info: 1,
                warn: 2,
                error: 3
            },

            alerts: {},

            initialize: function () {
                this.render();
                this.checkClusterRoles();
            },

            render: function () {

                var template = _.template(AlertsTemplate, { });

                $(template)
                    .prependTo(this.el);
            },

            stopClusterRoleCheck: function () {
                if (this.cluster_role_check_interval) {
                    clearInterval(this.cluster_role_check_interval);
                }
            },

            startClusterRoleCheck: function () {

                this.stopClusterRoleCheck();

                var self = this;
                this.cluster_role_check_interval = setInterval(function () {
                        self.checkClusterRoles.call(self);
                    },
                    this.polling_interval_ms);
            },

            checkClusterRoles: function () {

                this.stopClusterRoleCheck();

                var self = this;
                sconsole.cf_api.cluster.getStatus({global: false}, function (err, status) {
                    if (err) {
                        self.logger.error('Cluster role check failed: ' + err.message);
                    } else {
                        self.processClusterRoles(status);
                        self.processClusterIssues(status);
                    }
                    self.startClusterRoleCheck();
                });
            },

            processClusterRoles: function (status) {

                var missing_roles = [];
                _.each(status.roles_stats, function (role, role_name) {
                    if (role.required && role.node_ids.length === 0) {
                        missing_roles.push(role_name);
                    }
                });

                if (missing_roles.length > 0) {
                    this.raiseAlert(
                        'missing_roles',
                        'Cluster Degraded!',
                        "This cluster and the admin console will not function correctly while the following roles are " +
                            "missing: " + missing_roles.join(", ") + ".",
                        this.alert_severity.error,
                        function (e) {
                            e.preventDefault();
                            sconsole.routers.cluster.showCluster();
                        });
                } else {
                    this.clearAlert('missing_roles');
                }
            },

            processClusterIssues: function (status) {

                var self = this,
                    current_process_alerts = [];

                _.each(status.process_issues, function (issue) {

                    var alert_id = "process:" + issue.process_name + ":" + issue.state + ":" + issue.node_id;

                    current_process_alerts.push(alert_id);

                    self.raiseAlert.call(
                        self,
                        alert_id,
                        'Node Degraded!',
                        'The ' + issue.process_name + ' process on node ' + issue.node_id + ' is in a degraded state: ' + issue.state + '.',
                        self.alert_severity.warn,
                        function (e) {
                            e.preventDefault();
                            sconsole.routers.cluster.showCluster();
                        }
                    );
                });

                _.each(Object.keys(this.alerts), function (alert_id) {
                    if (alert_id.indexOf('process:') !== -1) {
                        if (current_process_alerts.indexOf(alert_id) === -1) {
                            self.clearAlert.call(self, alert_id);
                        }
                    }
                });
            },

            raiseAlert: function (id, name, content, severity, click) {

                if (!this.alerts[id]) {

                    var alert = {
                        id: id,
                        name: name,
                        content: content,
                        severity: severity,
                        click: click};

                    this.alerts[id] = alert;
                    this.renderAlert(alert);
                    this.growlAlert(alert);
                    this.updateAlertCount();
                }
            },

            updateAlertCount: function () {

                var alert_count = Object.keys(this.alerts).length;

                this.$('.badge').html(polyglot.t('layout.header.alert_label', {smart_count: alert_count}));

                if (alert_count === 0) {
                    this.$('.badge').removeClass('badge-danger').addClass('badge-success');
                    this.$('.caret').addClass('hidden');
                    this.$('.dropdown-toggle').addClass('disabled');
                    this.$('.alerts').addClass('hidden');
                } else {
                    this.$('.badge').addClass('badge-danger').removeClass('badge-success');
                    this.$('.caret').removeClass('hidden');
                    this.$('.dropdown-toggle').removeClass('disabled');
                    this.$('.alerts').removeClass('hidden');
                }
            },

            clearAlert: function (id) {

                if (this.alerts[id]) {

                    var alert = this.alerts[id];

                    $(alert.el).remove();

                    delete this.alerts[id];

                    this.updateAlertCount();
                }
            },

            renderAlert: function (alert) {

                var template = _.template(AlertTemplate, {alert: alert });

                this.alerts[alert.id].el = $(template)
                    .appendTo('.alerts', this.el);
            },

            growlAlert: function (alert) {

                switch (alert.severity) {
                    case this.alert_severity.info:
                        $.growl.notice({title: alert.name, message: alert.content});
                        break;

                    case this.alert_severity.warn:
                        $.growl.warning({title: alert.name, message: alert.content});
                        break;

                    case this.alert_severity.error:
                        $.growl.error({title: alert.name, message: alert.content});
                        break;
                }
            },

            alertClicked: function (e) {

                var alert_id = $(e.currentTarget).data('alert-id'),
                    alert = this.alerts[alert_id];

                if (alert) {
                    alert.click(e);
                }
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);