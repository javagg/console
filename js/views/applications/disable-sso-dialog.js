/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */



define([
    'jquery',
    'util/base-dialog',
    'text!views/applications/templates/application-dialogs.html'],
    function ($, BaseDialog, ApplicationDialogsTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('application.sso.disable_prompt.header'),

                dialogId: "disable-sso-dialog",

                render: function () {
                    var that = this;
                    var bodyTemplate = _.template($(ApplicationDialogsTemplate).filter('#disable-sso-dialog-body').html().trim(), this.options);
                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(ApplicationDialogsTemplate).filter('#disable-sso-dialog-footer').html().trim(), {}));

                    $(".btn-disable", this.buttonContainer).click(function (event) {
                        that.closeWithResult(true);
                    });
                },
            }
        );
    }
);