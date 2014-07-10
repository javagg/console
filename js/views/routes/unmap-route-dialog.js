/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'bootstrap-select',
    'util/base-dialog',
    'text!views/routes/templates/unmap-route-dialog.html'],
    function ($, BootstrapSelect, BaseDialog, UnmapRouteDialogTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('routes.unmap'),

                dialogId: "unmap-route-dialog",

                render: function () {

                    var self = this,
                        bodyTemplate = _.template($(UnmapRouteDialogTemplate).filter('#unmap-route-dialog-body').html().trim(), {route: this.options.route});

                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(UnmapRouteDialogTemplate).filter('#unmap-route-dialog-footer').html().trim(), {}));

                    $(".btn-unmap-route", this.buttonContainer).click(function (event) {
                        event.preventDefault();
                        self.unmapRouteClicked();
                    });
                },

                unmapRouteClicked: function () {

                    var self = this,
                        route_guid = this.options.route.metadata.guid;

                    this.$('.error').hide();
                    $('.btn-unmap-route', this.buttonContainer).button('loading');

                    sconsole.cf_api.apps.routes(this.options.application_guid).delete_(route_guid, {queries: {recursive: true}}, function (err) {
                        if (err) {
                            self.$('.error').html(err.message).show();
                            $('.btn-unmap-route', self.buttonContainer).button('reset');
                            return;
                        }

                        self.closeWithResult({unmapped: true});
                    });
                }
            }
        );
    }
);
