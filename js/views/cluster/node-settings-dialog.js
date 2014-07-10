/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */



define([
    'underscore',
    'jquery',
    'polyglot',
    'jqueryvalidation',
    'util/base-dialog',
    'util/activity-indicator',
    'async',
    'util/settings',
    'text!views/cluster/templates/cluster.html'],
    function (_, $, Polyglot, Validation, BaseDialog, Activity, Async, Settings, ClusterTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('cluster.node_settings'),

                dialogId: "node-settings-dialog",

                render: function () {
                    var settings = Settings.getSettings();
                    var docs_url = settings.use_local_docs == "true" ? "/docs/" : settings.external_docs_url;
                    var node_ip = this.options.node_ip,
                        bodyTemplate = _.template($(ClusterTemplate).filter('#node-settings-dialog-body').html().trim(), { 
                            node_ip: node_ip, 
                            docs_url: docs_url, 
                            product_name: settings.product_name
                        });

                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(ClusterTemplate).filter('#node-settings-dialog-footer').html().trim(), {}));

                    this.getRoles();
                },

                getRoles: function () {

                    var that = this,
                        activity = new Activity(this.$('.activity'));

                    Async.parallel(
                        {
                            status: function (done) {
                                sconsole.cf_api.cluster.getStatus({}, done);
                            },
                            info: function (done) {
                                sconsole.cf_api.getStackatoInfo(done);
                            }
                        },
                        function (err, results) {
                            if (err) {return;}

                            var status = results.status,
                                info = results.info,
                                available_roles = _.keys(status.roles_stats),
                                active_roles = info.nodes[that.options.node_ip].roles,
                                role_map = {};

                            _.each(available_roles, function (role) {
                                role_map[role] = _.contains(active_roles, role);
                            });

                            activity.close();
                            that.renderRoles(role_map);
                        }
                    );
                },

                renderRoles: function (roles_status) {

                    var that = this,
                        template = $(ClusterTemplate).filter('#node-settings-dialog-role-input').html().trim();

                    _.each(roles_status, function (status, role) {

                        var statusTemplate = _.template(template, { node_ip: that.options.node_ip, role: role, status: status });

                        $(statusTemplate)
                            .appendTo($('.form-controls', that.el));
                    });

                    $("#input-base").attr('disabled', true).parent().addClass('text-muted');
                    $("#input-primary").attr('disabled', true).parent().addClass('text-muted');
                    $("#input-controller").attr('disabled', true).parent().addClass('text-muted');
                    $("#input-load_balancer").attr('disabled', true).parent().addClass('text-muted');

                    $(".save-settings", this.buttonContainer).removeAttr('disabled');
                    $(".save-settings", this.buttonContainer).click(function (event) {
                        that.saveSettingsClicked();
                    });
                },

                saveSettingsClicked: function () {

                    var self = this;
                    $('.save-settings', this.buttonContainer).button('loading');

                    var role_inputs = $('.node-settings-form .control-node-setting input');

                    // filter out unselected roles
                    role_inputs = _.filter(role_inputs, function (role_input) {
                        return $(role_input).is(':checked');
                    });
                    var roles = _.map(role_inputs, function (role_input) {
                        return $(role_input).attr('name');
                    });

                    sconsole.cf_api.config.updateNodeConfig(
                        this.options.node_ip,
                        roles,
                        {global: false},
                        function (err, res) {
                            if (err) {
                                if (res && res.description) {
                                    self.$('.alert-danger').html(res.description).show();
                                } else {
                                    self.$('.alert-danger').hide();
                                }
                                $('.save-settings', self.buttonContainer).button('reset');
                            } else {
                               self.closeWithResult({updated: true});
                            }
                        }
                    );
                }
            }
        );
    }
);
