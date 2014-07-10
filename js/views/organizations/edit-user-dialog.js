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

                headerText: polyglot.t('organization.edit_user'),

                dialogId: "edit-user-dialog",

                render: function () {

                    var that = this;
                    var bodyTemplate = _.template($(OrganizationDialogsTemplate).filter('#edit-user-dialog-body').html().trim(), {user: this.options.user});
                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(OrganizationDialogsTemplate).filter('#edit-user-dialog-footer').html().trim(), {}));

                    $(".btn-edit-user", this.buttonContainer).click(function (event) {
                        that.editUserClicked();
                    });

                },


                editUserClicked: function () {

                    var self = this;
                    this.$('.btn-add-user').button('loading');

                    var current_user = self.options.user;

                    var is_auditor = this.$('#grant_auditor').is(':checked');
                    var is_billing_manager = this.$('#grant_billing_manager').is(':checked');
                    var is_manager = this.$('#grant_manager').is(':checked');

                    var users_url = self.options.org.entity.users_url;
                    var auditors_url = self.options.org.entity.auditors_url;
                    var billing_managers_url = self.options.org.entity.billing_managers_url;
                    var managers_url = self.options.org.entity.managers_url;


                    Async.parallel({
                        auditors: function (done) {
                            if (grant_auditor) {
                                sconsole.cf_api.get(auditors_url, {}, function (err, res) {

                                    var auditors = [];
                                    _.each(res.body.resources, function (auditor) {
                                        auditors.push(auditor.metadata.guid);
                                    });

                                    var updated_auditors;
                                    if (is_auditor) {
                                        updated_auditors = _.union(auditors, current_user.metadata.guid);
                                    }
                                    else {
                                        updated_auditors = _.without(auditors, current_user.metadata.guid);
                                    }

                                    sconsole.cf_api.organizations.update(self.options.org.metadata.guid, {auditor_guids: updated_auditors}, {}, function(err, res){
                                        done(err, res);
                                    })
                                });
                            }
                        },
                        billing_managers: function (done) {
                            if (grant_billing_manager) {
                                sconsole.cf_api.get(billing_managers_url, {}, function (err, res) {
                                    if (err) {
                                        done(err, res);
                                    }

                                    var billing_managers = [];
                                    _.each(res.body.resources, function (billing_manager) {
                                        billing_managers.push(billing_manager.metadata.guid);
                                    });

                                    var updated_billing_managers;
                                    if (is_billing_manager) {
                                        updated_billing_managers = _.union(billing_managers, current_user.metadata.guid);
                                    }
                                    else {
                                        updated_billing_managers = _.without(billing_managers, current_user.metadata.guid);
                                    }


                                    sconsole.cf_api.organizations.update(self.options.org.metadata.guid, {billing_manager_guids: updated_billing_managers}, {}, function(err, res){
                                        if (err) {
                                            self.$('.alert-danger').html(err);
                                        }
                                        done(err, res);
                                    })
                                });
                            }
                        },
                        managers: function (done) {
                            if (grant_manager) {
                                sconsole.cf_api.get(managers_url, {}, function (err, res) {
                                    if (err) {
                                        done(err, res);
                                    }

                                    var managers = [];
                                    _.each(res.body.resources, function (manager) {
                                        managers.push(manager.metadata.guid);
                                    });

                                    var updated_managers;
                                    if (is_manager) {
                                        updated_managers = _.union(managers, current_user.metadata.guid);
                                    }
                                    else {
                                        updated_managers = _.without(managers, current_user.metadata.guid);
                                    }

                                    sconsole.cf_api.organizations.update(self.options.org.metadata.guid, {manager_guids: updated_managers}, {}, function(err, res){
                                        if (err) {
                                            self.$('.alert-danger').html(err);
                                        }
                                        done(err, res);
                                    })
                                });
                            }
                        }
                    }, function (err, results) {
                        self.closeWithResult({updated: true});
                    });
                },

            }
        );
    }
);
