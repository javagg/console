/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */



define([
    'jquery',
    'polyglot',
    'jqueryvalidation',
    'util/base-dialog',
    'appsecute-api/lib/logger',
    'access/admin-access',
    'text!views/users/templates/user-dialogs.html'],
    function ($, Polyglot, Validation, BaseDialog, Logger, AdminAccess, UserDialogsTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('user.change_password'),

                dialogId: "change-password-dialog",

                clickOnSubmit: ".change-password-btn",

                render: function () {

                    var that = this;
                    var bodyTemplate = _.template($(UserDialogsTemplate).filter('#change-password-dialog-body').html().trim(), {});
                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(UserDialogsTemplate).filter('#change-password-dialog-footer').html().trim(), {}));

                    // admins don't require the old password to change another user's password, so remove it
                    var current_user_guid = sconsole.user.info.metadata.guid;
                    if (AdminAccess.isAdmin() && current_user_guid != that.options.user_guid) {
                        $('.old-password-group', this.el).remove();
                    }
                    
                    this.applyFormValidation();

                    $(".change-password-btn", this.buttonContainer).click(function (event) {
                        that.changePasswordClicked(event);
                    });
                },

                applyFormValidation: function () {

                    var self = this;

                    var rules = {
                        password: "required",
                        password2: {
                            required: true,
                            equalTo: '#input-password'
                        }
                    }
                    
                    // if user is not an admin, the old password is required
                    if (!AdminAccess.isAdmin()) {
                        rules.old_password = "required";
                    }

                    this.$('.change-password-form').validate({rules: rules});
                },

                changePasswordClicked: function (event) {

                    var self = this;

                    if (!this.$('.change-password-form').valid()) {
                        return;
                    }
                    
                    $(event.target).button('loading');

                    var old_password = this.$('#input-old-password').val();
                    var new_password = this.$('#input-password').val();

                    sconsole.cf_api.users.changePassword( self.options.user_guid, old_password, new_password, function (err, res) {
                        if (err) {
                            $(event.target).button('reset');
                            $('.modal-body')
                                .after($('<div>', { 'class': 'alert alert-danger password-change-error clearfix', 'html': "Error: " + res.error_description }));
                            return;
                        }

                        self.closeWithResult({changed: true});
                    });
                }
            }
        );
    }
);
