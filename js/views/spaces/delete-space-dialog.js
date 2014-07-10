/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */



define([
    'jquery',
    'util/base-dialog',
    'text!views/spaces/templates/space-dialogs.html'],
    function ($, BaseDialog, SpaceDialogsTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('space.delete_space'),

                dialogId: "delete-space-dialog",

                render: function () {

                    var that = this;
                    var bodyTemplate = _.template($(SpaceDialogsTemplate).filter('#delete-space-dialog-body').html().trim(), {});
                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(SpaceDialogsTemplate).filter('#delete-space-dialog-footer').html().trim(), {}));

                    $(".btn-delete", this.buttonContainer).click(function (event) {
                        that.deleteClicked();
                    });
                },

                deleteClicked: function () {

                    var self = this;
                    this.$('.btn-delete').button('loading');

                    sconsole.cf_api.spaces.delete_(this.options.space_guid, {queries: {recursive: true}}, function (err, done) {

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