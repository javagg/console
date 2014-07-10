/*
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'appsecute-api/lib/utils',
    'access/admin-access',
    'util/settings'],
    function ($, Utils, AdminAccess, Settings) {

        var setPingBackCookie = function () {
            // 24 hour cookie
            var today = new Date(),
                tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
            Utils.setCookie('usage_ping', true, tomorrow);
        };

        return {

            /**
             * Check if a usage ping back has already been sent today, and send one if not
             */
            check: function () {
                var pingback_disabled = Settings.getSetting('disable_pingback') == "true";
                if (!Utils.getCookie('usage_ping') && !pingback_disabled) {
                    this.ping();
                }
            },

            ping: function () {

                sconsole.cf_api.getStackatoInfo(
                    function (err, info) {

                        var uuid = info.stackato.UUID,
                            version = info.vendor_version,
                            is_admin = AdminAccess.isAdmin(),
                            url = "https://ping.activestate.com/?version=" +
                                encodeURIComponent(version) + '&uuid=' + encodeURIComponent(uuid) + '&a=' + is_admin;

                        $('<iframe>', {name: "ping-frame", src: url, style: 'display:none;'})
                            .on('load', function () {
                                setPingBackCookie();
                            })
                            .appendTo('body');

                        setTimeout(function () {
                            setPingBackCookie();
                        }, 1000);
                    });
            }
        }
    }
);