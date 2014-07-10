/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */



define([
    'jquery',
    'util/base-dialog',
    'text!views/stream/templates/stream.html'],
    function ($, BaseDialog, StreamTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('stream.delete_content'),

                dialogId: "delete-stream-content-dialog",

                render: function () {

                    var that = this;
                    var bodyTemplate = _.template($(StreamTemplate).filter('#delete-stream-content-dialog-body').html().trim(), {});
                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(StreamTemplate).filter('#delete-stream-content-dialog-footer').html().trim(), {}));

                    $(".btn-delete", this.buttonContainer).click(function (event) {
                        that.deleteClicked();
                    });
                },

                deleteClicked: function () {
                    this.closeWithResult({
                            delete: true
                        }
                    );
                }
            }
        );
    }
);