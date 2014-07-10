/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */



define([
    'jquery',
    'bootstrap-select',
    'util/base-dialog',
    'async',
    'views/lists/typeahead-bar',
    'views/lists/add-user-table-view',
    'text!views/organizations/templates/organization-dialogs.html'],
    function ($, BootstrapSelect, BaseDialog, Async, TypeAheadBar, UserTableView, OrganizationDialogsTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('space.add_user'),

                dialogId: "add-user-dialog",

                render: function () {

                    var self = this,
                        bodyTemplate = _.template($(OrganizationDialogsTemplate).filter('#add-user-dialog-body').html().trim(), {});

                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(OrganizationDialogsTemplate).filter('#add-user-dialog-footer').html().trim(), {}));

                    $(".btn-add-user", this.buttonContainer).click(function (event) {
                        self.addUserClicked();
                    });

                    this.$('form').on('submit', function (event) {
                        $(".btn-add-user", self.buttonContainer).click();
                        return false;
                    });

                    this.user_type_ahead = new TypeAheadBar({
                        el: this.$('.user-select'),
                        collection: sconsole.cf_api.users,
                        search_property: 'username',
                        placeholder: 'User'});

                    this.user_type_ahead.on('resource_selected', function (resource) {
                        if (resource) {
                            self.$('.user-select').removeClass('has-error');
                        }
                    });
                },

                addUserClicked: function () {

                    var self = this,
                        new_user = this.user_type_ahead.getSelectedResource();

                    if (!new_user) {return this.$('.user-select').addClass('has-error');}

                    $('.btn-add-user', this.buttonContainer).button('loading');

                    var grant_auditor = this.$('#grant_auditor').is(':checked'),
                        grant_billing_manager = this.$('#grant_billing_manager').is(':checked'),
                        grant_manager = this.$('#grant_manager').is(':checked'),
                        users_url = self.options.org.entity.users_url,
                        auditors_url = self.options.org.entity.auditors_url,
                        billing_managers_url = self.options.org.entity.billing_managers_url,
                        managers_url = self.options.org.entity.managers_url;

                    Async.parallel({
                        users: function (done) {
                            sconsole.cf_api.get(users_url, {}, function (err, res) {
                                var users = [];
                                _.each(res.body.resources, function (user) {
                                    users.push(user.metadata.guid);
                                });

                                users = _.union(users, new_user.metadata.guid);

                                sconsole.cf_api.organizations.update(self.options.org.metadata.guid, {user_guids: users}, {}, function (err, res) {
                                    done(err, res);
                                })
                            });
                        },
                        auditors: function (done) {
                            if (grant_auditor) {
                                sconsole.cf_api.get(auditors_url, {}, function (err, res) {
                                    var auditors = [];
                                    _.each(res.body.resources, function (auditor) {
                                        auditors.push(auditor.metadata.guid);
                                    });

                                    var updated_auditors = _.union(auditors, new_user.metadata.guid);

                                    sconsole.cf_api.organizations.update(self.options.org.metadata.guid, {auditor_guids: updated_auditors}, {}, function (err, res) {
                                        done(err, res);
                                    })
                                });
                            }
                            else {
                                done(null, null);
                            }
                        },
                        billing_managers: function (done) {
                            if (grant_billing_manager) {
                                sconsole.cf_api.get(billing_managers_url, {}, function (err, res) {
                                    var billing_managers = [];
                                    _.each(res.body.resources, function (billing_manager) {
                                        billing_managers.push(billing_manager.metadata.guid);
                                    });

                                    var updated_billing_managers = _.union(billing_managers, new_user.metadata.guid);

                                    sconsole.cf_api.organizations.update(self.options.org.metadata.guid, {billing_manager_guids: updated_billing_managers}, {}, function (err, res) {
                                        done(err, res);
                                    })
                                });
                            }
                            else {
                                done(null, null);
                            }
                        },
                        managers: function (done) {
                            if (grant_manager) {
                                sconsole.cf_api.get(managers_url, {}, function (err, res) {
                                    var managers = [];
                                    _.each(res.body.resources, function (manager) {
                                        managers.push(manager.metadata.guid);
                                    });

                                    var updated_managers = _.union(managers, new_user.metadata.guid);

                                    sconsole.cf_api.organizations.update(self.options.org.metadata.guid, {manager_guids: updated_managers}, {}, function (err, res) {
                                        done(err, res);
                                    })
                                });
                            }
                            else {
                                done(null, null);
                            }
                        }
                    }, function (err, results) {
                        self.closeWithResult({added: true});
                    });
                }
            }
        );
    }
);
