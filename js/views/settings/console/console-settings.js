/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'appsecute-api/lib/logger',
    'ace',
    'views/settings/console/product-settings',
    'views/settings/console/style-settings',
    'views/settings/console/support-template-settings',
    'views/settings/console/eula-template-settings',
    'views/settings/console/welcome-template-settings',
    'views/settings/console/theme-settings',
    'text!views/settings/console/templates/console-settings.ejs'],
    function ($, Backbone, _, Polyglot, Logger, Ace, ProductSettingsView, StyleSettingsView, SupportTemplateSettingsView, EulaTemplateSettingsView, WelcomeTemplateSettingsView, ThemeSettingsView, ConsoleSettingsTemplate) {

        return Backbone.View.extend({

            events: {
                'click .product-settings': 'productSettingsClicked',
                'click .theme-settings': 'themeSettingsClicked',
                'click .style-settings': 'styleSettingsClicked',
                'click .support-settings': 'supportSettingsClicked',
                'click .welcome-settings': 'welcomeSettingsClicked',
                'click .eula-settings': 'eulaSettingsClicked',
                'click .btn-load-defaults': 'loadDefaultsClicked'
            },

            logger: new Logger('Console Settings'),

            initialize: function () {

                this.options.activity.close();

                // Allow for special cases where someone has entered custom CSS/Images etc. that break the console
                // by entering a special url (see settings router) admins can reset a setting back to default
                if (this.options.reset_setting_name) {
                    this.resetSetting();
                    return;
                }

                this.render();

                switch (this.options.sub_view) {
                    case 'product':
                        this.renderSubView(ProductSettingsView, '.product-settings');
                        break;

                    case 'theme':
                        this.renderSubView(ThemeSettingsView, '.theme-settings');
                        break;

                    case 'style':
                        this.renderSubView(StyleSettingsView, '.style-settings');
                        break;

                    case 'support':
                        this.renderSubView(SupportTemplateSettingsView, '.support-settings');
                        break;

                    case 'eula':
                        this.renderSubView(EulaTemplateSettingsView, '.eula-settings');
                        break;

                    case 'welcome':
                        this.renderSubView(WelcomeTemplateSettingsView, '.welcome-settings');
                        break;

                    default:
                        this.renderSubView(ProductSettingsView, '.product-settings');
                        break;
                }
            },

            resetSetting: function () {

                var reset = {};
                reset[this.options.reset_setting_name] = "";

                this.api.put(
                    sconsole.api_endpoint + '/srest/settings/namespace/console',
                    reset,
                    {
                        context: this,
                        success: function (req, res) {
                            sconsole.routers.settings.navigate('settings/console/product', {trigger: false});
                            window.location.reload();
                        },
                        error: function (req, res) {
                            this.logger.error(res.body);
                        }
                    }
                );
            },

            render: function () {

                var template = _.template(ConsoleSettingsTemplate, { });

                $(template)
                    .appendTo(this.el);

            },

            renderSubView: function (view, menu_selector) {

                if (this.sub_view) {
                    this.sub_view.close();
                }

                sconsole.routers.settings.navigate('settings/console/' + this.options.sub_view, {trigger: false});

                $('.setting-menu li').removeClass('active');
                $(menu_selector).parent('li').addClass('active');

                this.sub_view = new view({el: $('<div>').appendTo(this.$('.settings-container'))});
            },


            productSettingsClicked: function () {
                this.options.sub_view = 'product';
                this.renderSubView(ProductSettingsView, '.product-settings');
                return false;
            },

            themeSettingsClicked: function () {
                this.options.sub_view = 'theme';
                this.renderSubView(ThemeSettingsView, '.theme-settings');
                return false;
            },

            styleSettingsClicked: function () {
                this.options.sub_view = 'style';
                this.renderSubView(StyleSettingsView, '.style-settings');
                return false;
            },

            supportSettingsClicked: function () {
                this.options.sub_view = 'support';
                this.renderSubView(SupportTemplateSettingsView, '.support-settings');
                return false;
            },

            eulaSettingsClicked: function () {
                this.options.sub_view = 'eula';
                this.renderSubView(EulaTemplateSettingsView, '.eula-settings');
                return false;
            },

            welcomeSettingsClicked: function () {
                this.options.sub_view = 'welcome';
                this.renderSubView(WelcomeTemplateSettingsView, '.welcome-settings');
                return false;
            },

            loadDefaultsClicked: function () {
                sconsole.routers.settings.showLoadDefaultConsoleSettingsDialog();
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);