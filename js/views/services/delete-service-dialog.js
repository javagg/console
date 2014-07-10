/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */



define([
    'jquery',
    'util/base-dialog',
    'text!views/services/templates/service-dialogs.html'],
    function ($, BaseDialog, ServiceDialogsTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('service_instances.delete_service'),

                dialogId: "delete-service-dialog",

                render: function () {

                    var that = this;
                    var bodyTemplate = _.template($(ServiceDialogsTemplate).filter('#delete-service-dialog-body').html().trim(), {});
                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(ServiceDialogsTemplate).filter('#delete-service-dialog-footer').html().trim(), {}));

                    $(".btn-delete", this.buttonContainer).click(function (event) {
                        that.deleteClicked();
                    });
                },

                deleteClicked: function () {

                    var that = this;
                    this.$('.btn-delete').button('loading');
                    sconsole.cf_api.service_instances.delete_(this.options.service.metadata.guid, {queries: {recursive: true}}, function (err) {
                        if (err) {
                            that.$('.alert-danger').html(JSON.stringify(err));
                            that.$('.btn-delete').remove();
                            return;
                        }

                        that.closeWithResult({deleted: true});
                    });
                }
            }
        );
    }
);