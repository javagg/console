/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'underscore',
    'text!views/support/templates/support.html',
    'text!views/support/templates/eula.html',
    'text!views/welcome/templates/welcome.ejs'],
    function (_, SupportTemplate, EulaTemplate, WelcomeTemplate) {

        /**
         * Settings loaded from the server.
         */
        var settings = {};

        /**
         * Default settings, these will be overridden by settings defined on the server.
         * NOTE: Please note if these are changed they must also be updated in aok.git/public/aok.js
         */
        var setting_defaults = {
            product_name: 'Stackato',
            company_name: 'ActiveState Software',
            vendor_version: '3.2',
            default_locale: 'en',
            product_logo_favicon_url: 'img/stackato_logo_favicon.png',
            product_logo_header_url: 'img/stackato_logo_header.png',
            product_logo_footer_url: 'img/stackato_logo_footer.png',
            background_color: '#ffffff',
            style: '',
            support_template: SupportTemplate,
            eula_template: EulaTemplate,
            welcome_template: WelcomeTemplate,
            external_docs_url: 'http://docs.stackato.com/3.2/',
            use_local_docs: "false"
        };

        return {

            defaults: setting_defaults,

            refreshServerSettings: function (done) {

                sconsole.cf_api.settings.getConsoleBucket({}, function (err, console_settings) {
                    if (err && done) {return done(err);}

                    settings = console_settings;

                    Object.keys(settings).forEach(function (k) {
                        if (settings[k] === null || settings[k].length <= 0) {
                            delete settings[k];
                        }
                    });

                    if (done) {done(null)}
                });
            },

            getSettings: function () {

                var merged_settings = {};

                merged_settings = _.extend(merged_settings, setting_defaults, settings);

                return merged_settings;
            },

            getSetting: function (name) {

                if (settings && !_.isUndefined(settings[name])) {
                    return settings[name];
                } else {
                    return setting_defaults[name];
                }
            }
        }
    }
);