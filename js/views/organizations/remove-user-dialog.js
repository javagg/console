/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */



define([
    'jquery',
    'bootstrap-select',
    'util/base-dialog',
    'async',
    'text!views/organizations/templates/organization-dialogs.html'],
    function ($, BootstrapSelect, BaseDialog, Async, OrganizationDialogsTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('organization.remove_user.remove'),

                dialogId: "remove-user-dialog",

                render: function () {

                    var that = this;
                    var bodyTemplate = _.template($(OrganizationDialogsTemplate).filter('#remove-user-dialog-body').html().trim(), {user: this.options.user});
                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(OrganizationDialogsTemplate).filter('#remove-user-dialog-footer').html().trim(), {}));

                    $(".btn-remove-user", this.buttonContainer).click(function (event) {
                        that.removeUserClicked();
                    });

                },


                removeUserClicked: function () {

                    var self = this;
                    this.$('.btn-remove-user').button('loading');

                    var current_user = self.options.user;

                    var users_url = self.options.org.entity.users_url;
                    var auditors_url = self.options.org.entity.auditors_url;
                    var billing_managers_url = self.options.org.entity.billing_managers_url;
                    var managers_url = self.options.org.entity.managers_url;


                    Async.parallel({
                        users: function (done) {
                            sconsole.cf_api.get(users_url, {}, function (err, res) {

                                var users = [];
                                _.each(res.body.resources, function (user) {
                                    users.push(user.metadata.guid);
                                });

                                var updated_users;
                                updated_users = _.without(users, current_user.metadata.guid);

                                sconsole.cf_api.organizations.update(self.options.org.metadata.guid, {user_guids: updated_users}, {}, function(err, res){
                                    done(err, res);
                                })
                            });
                        },
                        auditors: function (done) {
                            sconsole.cf_api.get(auditors_url, {}, function (err, res) {

                                var auditors = [];
                                _.each(res.body.resources, function (auditor) {
                                    auditors.push(auditor.metadata.guid);
                                });

                                var updated_auditors;
                                updated_auditors = _.without(auditors, current_user.metadata.guid);

                                sconsole.cf_api.organizations.update(self.options.org.metadata.guid, {auditor_guids: updated_auditors}, {}, function(err, res){
                                    done(err, res);
                                })
                            });
                        },
                        billing_managers: function (done) {
                            sconsole.cf_api.get(billing_managers_url, {}, function (err, res) {

                                var billing_managers = [];
                                _.each(res.body.resources, function (billing_manager) {
                                    billing_managers.push(billing_manager.metadata.guid);
                                });

                                var updated_billing_managers;
                                updated_billing_managers = _.without(billing_managers, current_user.metadata.guid);

                                sconsole.cf_api.organizations.update(self.options.org.metadata.guid, {billing_manager_guids: updated_billing_managers}, {}, function(err, res){
                                    done(err, res);
                                });
                            });
                        },
                        managers: function (done) {
                            sconsole.cf_api.get(managers_url, {}, function (err, res) {
                                if (err) {
                                    done(err, res);
                                }

                                var managers = [];
                                _.each(res.body.resources, function (manager) {
                                    managers.push(manager.metadata.guid);
                                });

                                var updated_managers;
                                updated_managers = _.without(managers, current_user.metadata.guid);

                                sconsole.cf_api.organizations.update(self.options.org.metadata.guid, {manager_guids: updated_managers}, {}, function(err, res){
                                    done(err, res);
                                })
                            });
                        }
                    }, function (err, results) {
                        self.closeWithResult({removed: true});
                    });
                },

            }
        );
    }
);
