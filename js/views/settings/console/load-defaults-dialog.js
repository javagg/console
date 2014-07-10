/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */



define([
    'jquery',
    'util/base-dialog',
    'text!views/settings/console/templates/load-defaults-dialog.html'],
    function ($, BaseDialog, StreamTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('settings.console.load_defaults'),

                dialogId: "load-defaults-dialog",

                render: function () {

                    var that = this;
                    var bodyTemplate = _.template($(StreamTemplate).filter('#load-defaults-dialog-body').html().trim(), {});
                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(StreamTemplate).filter('#load-defaults-dialog-footer').html().trim(), {}));

                    $(".btn-load-defaults", this.buttonContainer).click(function (event) {
                        that.loadDefaultsClicked();
                    });
                },

                loadDefaultsClicked: function () {

                    $(".btn-load-defaults", this.buttonContainer).button('loading');

                    sconsole.cf_api.settings.deleteConsoleBucket({}, function (err) {
                        if (err) {return $('.btn-load-defaults').button('reset');}
                        sconsole.routers.settings.navigate('settings/console/product', {trigger: false});
                        window.location.reload();
                    });
                }
            }
        );
    }
);