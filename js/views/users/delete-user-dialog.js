/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */



define([
    'jquery',
    'polyglot',
    'jqueryvalidation',
    'util/base-dialog',
    'text!views/users/templates/users.html'],
    function ($, Polyglot, Validation, BaseDialog, UsersTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('users.delete'),

                dialogId: "delete-user-dialog",

                render: function () {
                    var that = this;
                    var bodyTemplate = _.template($(UsersTemplate).filter('#delete-user-dialog-body').html().trim(), {user_name: this.options.user_name});
                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(UsersTemplate).filter('#delete-user-dialog-footer').html().trim(), {}));

                    $(".delete-user", this.buttonContainer).click(function (event) {
                        that.deleteUserClicked();
                    });
                },

                deleteUserClicked: function () {

                    this.$('.delete-user').button('loading');

                    var self = this;
                    sconsole.cf_api.users.deleteUser(this.options.user_guid, function (err, done) {

                        if (err) {
                            self.$('.alert-danger').html(err);
                            self.$('.btn-delete').remove();
                            return;
                        }

                        self.closeWithResult({deleted: true});
                    });
                }
            }
        );
    }
);
