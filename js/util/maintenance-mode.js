/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 *
 * Utils for Stackato Management Console maintenance mode
 */

define([
    'jquery',
    'underscore',
    'access/admin-access',
    'util/settings',
    'text!util/templates/maintenance-mode.ejs'],
    function ($, _, AdminAccess, Settings, MaintenanceModeTemplate) {

        return {

            /**
             * Starts checking for maintenance mode in the background.
             */
            startMaintenanceModeCheck: function () {
                var self = this;

                setInterval(function () {self.check.call(self)}, 10000);
                this.check();
            },

            /**
             * Check if maintenance mode is on or off, and trigger the appropriate function
             */
            check: function () {

                var self = this;

                sconsole.cf_api.getApiInfo({global: false }, function (err, info) {
                    if (err) {return;}

                    if (info.maintenance_mode) {
                        self.on();
                    }
                    else {
                        self.off();
                    }
                });
            },

            on: function () {
                if (!this.banner) {
                    var settings = Settings.getSettings();
                    var message = "";
                    if (AdminAccess.isAdmin()) {
                        message = polyglot.t("layout.banner.maintenance_mode.admin", {product: settings.product_name, link: "#settings/maintenance_mode"});
                    } else {
                        message = polyglot.t("layout.banner.maintenance_mode.user", {product: settings.product_name});
                    }
                    this.banner = $(_.template(MaintenanceModeTemplate, {message: message}));
                    this.banner
                        .appendTo($('#header-container'));
                }
                $(".maintenance_mode_disable")
                    .attr('disabled', 'disabled')
                    .filter('.btn')
                    .addClass('disabled');
            },

            off: function () {
                if (this.banner) {
                    $(this.banner).remove();
                    this.banner = null;
                }
                $(".maintenance_mode_disable")
                    .attr('disabled', null)
                    .filter('.btn')
                    .removeClass('disabled');
                // Special case for .submit elements in .form-check-dirty forms
                // to leave clean forms with disabled submit buttons
                $(".form-check-dirty:not(.dirty) .submit.maintenance_mode_disable")
                    .addClass('disabled');
            }
        }
    }
);
