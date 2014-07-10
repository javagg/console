/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'polyglot',
    'jqueryvalidation',
    'bootstrap-select',
    'util/base-dialog',
    'appsecute-api/lib/logger',
    'views/lists/typeahead-bar',
    'text!views/users/templates/users.html'],
    function ($, Polyglot, Validation, BootstrapSelect, BaseDialog, Logger, TypeAheadBar, UsersTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('users.create_user'),

                dialogId: "create-user-dialog",

                clickOnSubmit: ".create-user",

                render: function () {

                    var that = this,
                        bodyTemplate = _.template($(UsersTemplate).filter('#create-user-dialog-body').html().trim(), {});

                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(UsersTemplate).filter('#create-user-dialog-footer').html().trim(), {}));

                    this.org_type_ahead = new TypeAheadBar({
                        el: this.$('.org-select'),
                        collection: sconsole.cf_api.organizations,
                        search_property: 'name',
                        placeholder: 'Organization'});

                    this.applyFormValidation();

                    $(".create-user", this.buttonContainer).click(function (event) {
                        that.createUserClicked(event);
                    });
                },

                applyFormValidation: function () {

                    this.$('.create-user-form').validate({
                        rules: {
                            username: {
                                required: true
                            },
                            email: {
                                required: true,
                                email: true
                            },
                            password: "required",
                            password2: {
                                required: true,
                                equalTo: '#input-password'
                            }
                        }
                    });
                },

                showError: function (err) {
                    $('.create-user', this.buttonContainer).button('reset');
                    this.$('.error').html(err.message).show();
                },

                createUserClicked: function (event) {

                    var self = this;
                    if (!this.$('.create-user-form').valid()) {
                        return;
                    }

                    this.$('.error').hide();

                    var user_data = {},
                        selected_org = this.org_type_ahead.getSelectedResource();

                    $(event.target).button('loading');

                    user_data['username'] = this.$('#input-username').val();
                    user_data['password'] = this.$('#input-password').val();
                    user_data['family_name'] = this.$('#input-family-name').val();
                    user_data['given_name'] = this.$('#input-given-name').val();
                    user_data['phone'] = this.$('#input-phone').val();
                    user_data['admin'] = this.$('#input-make-admin').is(':checked');
                    user_data['email'] = this.$('#input-email').val();

                    sconsole.cf_api.users.createNewUser(user_data, function (err, res) {
                        if (err) {
                            return self.showError(err);
                        }

                        if (!selected_org) {
                            return self.closeWithResult({created: true, id: res.metadata.guid});
                        }

                        sconsole.cf_api.users.update(res.metadata.guid, { organization_guids: [selected_org.metadata.guid] }, {}, function (err, res) {
                            if (err) {
                                return self.showError(err);
                            }

                            self.closeWithResult({created: true, id: res.metadata.guid});
                        });
                    });
                }
            }
        );
    }
);
