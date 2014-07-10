/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'util/settings',
    'util/activity-indicator',
    'text!views/cluster/templates/cluster.html'],
    function ($, Backbone, _, Polyglot, Settings, Activity, ClusterTemplate) {

        return Backbone.View.extend({

            events: {
                'click .btn-node-settings': "nodeSettingsClicked"
            },

            initialize: function () {
                this.options.activity.close();
                this.render();
                this.getStackatoInfo();
            },

            render: function () {

                var self = this,
                    template = _.template($(ClusterTemplate).filter('#cluster-template').html().trim(), { polyglot: window.polyglot });

                $(template)
                    .appendTo(this.el);
            },

            getStackatoInfo: function () {

                var self = this,
                    activity = new Activity(this.$('.configuration'));

                sconsole.cf_api.getStackatoInfo(
                    function (err, info) {
                        if (err) {return;}
                        self.renderInfo(info);
                        activity.close();
                        self.renderCluster(info);
                    });
            },

            renderCluster: function (stackato_info) {

                this.$('.cluster-nodes').empty();
                // display all nodes
                var i = 0;
                _.each(stackato_info.nodes, function (node, ip) {
                    var template = _.template($(ClusterTemplate).filter('#cluster-node-template').html().trim(), { node_ip: ip, index: i });

                    $(template)
                        .appendTo(this.$('.cluster-nodes'));

                    _.each(node.roles, function (role) {
                        var role_template = _.template($(ClusterTemplate).filter('#node-role-template').html().trim(), { role: role });

                        $(role_template)
                            .appendTo(this.$('.cluster-nodes .node-' + i));
                    });

                    i++;
                });
            },

            nodeSettingsClicked: function (event) {

                var self = this;
                var node_ip = $(event.target).closest('button').data('nodeip');

                // stop checking the cluster roles while this dialog is open
                sconsole.alert_view.stopClusterRoleCheck();

                sconsole.routers.cluster.showNodeSettingsDialog(
                    node_ip,
                    function (result) {
                        if (result && result.updated) {
                            // rerender the cluster
                            self.getStackatoInfo();

                            // wait a bit to restart the cluster role check so that the console isn't flooded with bogus alert
                            window.setTimeout(sconsole.alert_view.startClusterRoleCheck.bind(sconsole.alert_view), 5000);
                        }
                    },
                    this);
            },

            renderInfo: function (stackato_info) {
                // display stackato info
                var info_template = _.template($(ClusterTemplate).filter('#cluster-info-template').html().trim(), { settings: Settings.getSettings(), info: stackato_info });

                $('#stackato_info').empty();
                $(info_template)
                    .appendTo($('#stackato_info'));
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
