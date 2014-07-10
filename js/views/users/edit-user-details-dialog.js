/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */



define([
    'jquery',
    'polyglot',
    'jqueryvalidation',
    'util/base-dialog',
    'appsecute-api/lib/logger',
    'text!views/users/templates/user-dialogs.html'],
    function ($, Polyglot, Validation, BaseDialog, Logger, UserDialogsTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('user.edit_details'),

                dialogId: "edit-details-dialog",

                clickOnSubmit: ".edit-details-btn",

                render: function () {

                    var that = this;
                    var bodyTemplate = _.template($(UserDialogsTemplate).filter('#edit-details-dialog-body').html().trim(), {user: this.options.user});
                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(UserDialogsTemplate).filter('#edit-details-dialog-footer').html().trim(), {}));

                    this.applyFormValidation();

                    $(".edit-details-btn", this.buttonContainer).click(function (event) {
                        that.saveChangesClicked(event);
                    });
                },

                applyFormValidation: function () {

                    var self = this;

                    // todo validate phone number

                    this.$('.edit-user-details-form').validate({
                        rules: {
                            'email' : {
                                required: true,
                                email: true
                            }
                        }
                    });
                },

                saveChangesClicked: function (event) {

                    var that = this;

                    if (!this.$('.edit-user-details-form').valid()) {
                        return;
                    }

                    $(event.target).button('loading');

                    // Phone numbers not currently supported
                    var given_name = this.$('#edit-user-given-name').val();
                    var family_name = this.$('#edit-user-family-name').val();
                    var email = this.$('#edit-user-email').val();
                    // var phone = this.$('#edit-user-phone').val();

                    var data = {
                        'userName': this.options.user.attributes.userName,
                        'name': { 'givenName': given_name, 'familyName': family_name },
                        'emails': [ { 'value' : email } ]
                    };

                    sconsole.cf_api.users.updateDetails(this.options.user.metadata.guid, data, function(err, res) {
                        if (err) {
                            $(event.target).button('reset');
                            $('.modal-body')
                                .after($('<div>', { 'class': 'alert alert-danger password-change-error clearfix', 'html': "Error: " + res.error_description }));
                            return;
                        }

                        that.closeWithResult({changed: true, attributes: res});
                    });
                }
            }
        );
    }
);
