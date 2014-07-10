/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */



define([
    'jquery',
    'util/base-dialog',
    'text!views/applications/templates/application-dialogs.html'],
    function ($, BaseDialog, ApplicationDialogsTemplate) {

        return BaseDialog.extend({

                headerText: "",

                dialogId: "change-application-state-dialog",

                render: function () {

                    var that = this,
                        button_text = (that.options.action === "stop" ? polyglot.t('application.stop') : polyglot.t('application.restart')),
                        loading_text = (that.options.action === "stop" ? polyglot.t('application.stopping') : polyglot.t('application.restarting')),
                        button_class = (that.options.action === "stop" ? "btn-stop" : "btn-restart");

                    var body_template = _.template($(ApplicationDialogsTemplate).filter('#change-application-state-dialog-body').html().trim(), {action: that.options.action}),
                        footer_template = _.template($(ApplicationDialogsTemplate).filter('#change-application-state-dialog-footer').html().trim(), {button_text: button_text, loading_text: loading_text, button_class: button_class});

                    this.el.html(body_template);
                    this.buttonContainer.prepend(footer_template);

                    $(".btn-stop", this.buttonContainer).click(function (event) {
                        that.stopClicked.call(self);
                    });

                    $(".btn-restart", this.buttonContainer).click(function (event) {
                        that.restartClicked.call(self);
                    });
                },

                postRender: function () {
                    $('#change-application-state-dialog .modal-title').html((this.options.action === "stop" ? polyglot.t('application.stop') : polyglot.t('application.restart')) + ' ' + polyglot.t('application.application'));
                },

                stopClicked: function () {

                    var self = this;
                    $('.btn-stop', self.buttonContainer).button('loading');

                    sconsole.cf_api.apps.update(self.options.application_guid, {state: 'STOPPED'}, {}, function (err) {
                        if (err) {
                            $('.btn-stop', self.buttonContainer).button('reset');
                            return;
                        }

                        self.closeWithResult({stopped: true});
                    });
                },

                restartClicked: function () {

                    var self = this;
                    $('.btn-restart', self.buttonContainer).button('loading');

                    sconsole.cf_api.apps.update(self.options.application_guid, {state: 'STOPPED'}, {}, function (err) {
                        if (err) {
                            $('.btn-restart', self.buttonContainer).button('reset');
                            return;
                        }

                        setTimeout(function () {
                                sconsole.cf_api.apps.update(self.options.application_guid, {state: 'STARTED'}, {}, function (err) {
                                    if (err) {
                                        $('.btn-restart', self.buttonContainer).button('reset');
                                        return;
                                    }

                                    self.closeWithResult({restarted: true});
                                });
                            },
                            1000);
                    });
                }
            }
        );
    }
);