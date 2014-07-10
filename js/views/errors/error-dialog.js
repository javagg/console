/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */



define([
    'jquery',
    'util/base-dialog',
    'text!views/errors/templates/error-dialog.ejs'],
    function ($, BaseDialog, ErrorDialogTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('error.error_occurred'),

                dialogId: "error-dialog",

                render: function () {

                    var template = _.template(ErrorDialogTemplate, {});

                    $(template)
                        .appendTo(this.el);

                    if (this.options.error) {
                        this.showError(this.options.error);
                    }
                },

                showError: function (err) {

                    $('<div>', {'class': 'alert alert-danger', html: err.message})
                        .appendTo(this.el)
                }
            }
        );
    }
);