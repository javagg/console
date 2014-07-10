/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'appsecute-api/lib/logger',
    'util/settings',
    'bootstrap-color-picker',
    'text!views/settings/console/templates/theme-settings.ejs'],
    function ($, Backbone, _, Polyglot, Logger, Settings, BootstrapColorPicker, ThemeSettingsTemplate) {

        return Backbone.View.extend({

            events: {
                'click .btn-save': 'saveClicked',
                'click .btn-cancel': 'cancelClicked',
                'click .btn-reset-product-logo-favicon': 'resetProductLogoFavIconClicked',
                'click .btn-reset-product-logo-header': 'resetProductLogoHeaderClicked',
                'click .btn-reset-product-logo-footer': 'resetProductLogoFooterClicked',
                'click .btn-reset-background-color': 'resetBackgroundClicked',
                'input input': 'inputChanged'
            },

            logger: new Logger('Theme Settings'),

            initialize: function () {
                this.render();
            },

            render: function () {

                var that = this,
                    template = _.template(ThemeSettingsTemplate, {settings: Settings.getSettings()});

                $(template)
                    .appendTo(this.el);

                this.destroyColorPickers();
                this.background_color_picker = this.$('#inputBackgroundColor').colorpicker();
                this.background_color_picker.on('changeColor', function (ev) {
                    that.inputChanged();
                });

                this.$('.btn-reset').tooltip({title: polyglot.t('settings.console.load_default')});
            },

            inputChanged: function () {
                this.$('.btn').removeAttr('disabled');
            },

            destroyColorPickers: function () {
                if (this.background_color_picker) {
                    this.background_color_picker.colorpicker('destroy');
                }
            },

            resetBackgroundClicked: function () {
                this.background_color_picker.colorpicker('setValue', Settings.defaults.background_color);
            },

            resetProductLogoFavIconClicked: function () {
                this.$('#inputProductLogoFavIconUrl').val(Settings.defaults.product_logo_favicon_url);
                this.inputChanged();
            },

            resetProductLogoHeaderClicked: function () {
                this.$('#inputProductLogoHeaderUrl').val(Settings.defaults.product_logo_header_url);
                this.inputChanged();
            },

            resetProductLogoFooterClicked: function () {
                this.$('#inputProductLogoFooterUrl').val(Settings.defaults.product_logo_footer_url);
                this.inputChanged();
            },

            saveClicked: function () {

                this.$('.btn-save').button('loading');

                var self = this,
                    theme_settings = {
                        background_color: this.$('#inputBackgroundColor').val(),
                        product_logo_favicon_url: this.$('#inputProductLogoFavIconUrl').val(),
                        product_logo_header_url: this.$('#inputProductLogoHeaderUrl').val(),
                        product_logo_footer_url: this.$('#inputProductLogoFooterUrl').val()
                    };

                sconsole.cf_api.settings.updateConsoleSettings(theme_settings, {}, function (err) {
                    if (err) {
                        self.logger.error(res.body);
                        self.$('.btn-save').button('reset');
                        self.cancelClicked();
                    } else {
                        window.location.reload();
                    }
                });
            },

            cancelClicked: function () {
                $(this.el).empty();
                this.render();
            },

            close: function () {
                this.destroyColorPickers();
                this.remove();
                this.unbind();
            }
        });
    }
);