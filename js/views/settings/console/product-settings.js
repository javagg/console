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
    'jqueryvalidation',
    'text!views/settings/console/templates/product-settings.ejs'],
    function ($, Backbone, _, Polyglot, Logger, Settings, Validate, ProductSettingsTemplate) {

        return Backbone.View.extend({

            events: {
                'click .btn-save': 'saveClicked',
                'click .btn-cancel': 'cancelClicked',
                'click .btn-reset-product-name': 'resetProductNameClicked',
                'click .btn-reset-company-name': 'resetCompanyNameClicked',
                'click .btn-reset-version': 'resetVendorVersionClicked',
                'click .btn-reset-locale': 'resetLocaleClicked',
                'click .btn-reset-docs-url': 'resetDocsClicked',
                'input input': 'inputChanged',
                'click #checkboxUseLocalDocs': 'useLocalDocsClicked',
                'click #checkboxDisablePingback': 'disablePingbackClicked'
            },

            logger: new Logger('Product Settings'),

            initialize: function () {
                this.render();
            },

            render: function () {

                var template = _.template(ProductSettingsTemplate, {settings: Settings.getSettings() });

                $(template)
                    .appendTo(this.el);

                this.applyValidation();

                this.$('.btn-reset').tooltip({title: polyglot.t('settings.console.load_default')});
            },

            applyValidation: function () {
                $('#product-settings-form', self.el).validate({
                    errorPlacement: function (error, element) {
                        error.insertAfter(element.parent());
                    },
                    rules: {
                        inputDocsUrl: {
                            required: true,
                            url: true
                        }
                    }
                });
            },

            resetProductNameClicked: function () {
                this.$('#inputProductName').val(Settings.defaults.product_name);
                this.inputChanged();
            },

            resetCompanyNameClicked: function () {
                this.$('#inputCompanyName').val(Settings.defaults.company_name);
                this.inputChanged();
            },

            resetVendorVersionClicked: function () {
                this.$('#inputVendorVersion').val(Settings.defaults.vendor_version);
                this.inputChanged();
            },

            resetLocaleClicked: function () {
                this.$('#inputDefaultLocale').val(Settings.defaults.default_locale);
                this.inputChanged();
            },

            resetDocsClicked: function () {
                this.$('#inputDocsUrl').val(Settings.defaults.external_docs_url);
                this.$("#checkboxUseLocalDocs").prop("checked", Settings.defaults.use_local_docs === "true");
                this.updateExternalDocsUrlState();
                this.inputChanged();
            },

            updateExternalDocsUrlState: function () {
                if (this.$('#checkboxUseLocalDocs').is(":checked")) {
                    this.$('#inputDocsUrl').attr('disabled', 'disabled');
                } else {
                    this.$('#inputDocsUrl').removeAttr('disabled');
                }
            },

            useLocalDocsClicked: function () {
                this.updateExternalDocsUrlState();
                this.inputChanged();
            },

            disablePingbackClicked: function () {
                this.inputChanged();
            },

            inputChanged: function () {
                this.$('.btn').removeAttr('disabled');
            },

            saveClicked: function () {
                if (!this.$('#product-settings-form').valid()) {
                    return;
                }

                this.$('.btn-save').button('loading');

                var self = this,
                    product_settings = {
                        product_name: this.$('#inputProductName').val(),
                        company_name: this.$('#inputCompanyName').val(),
                        vendor_version: this.$('#inputVendorVersion').val(),
                        default_locale: this.$('#inputDefaultLocale').val(),
                        external_docs_url: this.$('#inputDocsUrl').val(),
                        use_local_docs: this.$('#checkboxUseLocalDocs').is(":checked") ? "true" : "false",
                        disable_pingback: this.$('#checkboxDisablePingback').is(":checked") ? "true" : "false"
                    };

                sconsole.cf_api.settings.updateConsoleSettings(product_settings, {}, function (err) {
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
                this.remove();
                this.unbind();
            }
        });
    }
);