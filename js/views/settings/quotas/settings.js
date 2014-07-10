/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'views/lists/quota-definition-table-view',
    'text!views/settings/quotas/templates/settings.html'],
    function ($, Backbone, _, QuotaDefinitionTableView, QuotaTemplate) {

        return Backbone.View.extend({

            initialize: function () {
                this.options.activity.close();
                this.render();
                this.renderQuotaDefinitionsTable();
            },

            render: function () {

                var template = _.template($(QuotaTemplate).filter('#settings-template').html().trim(), { polyglot: window.polyglot });

                $(template)
                    .appendTo(this.el);
            },

            renderQuotaDefinitionsTable: function () {

                this.quota_definitions_table = new QuotaDefinitionTableView({
                    el: $('<div>').appendTo(this.$('.quota-definitions-table')),
                    click_handlers: {
                        editQuotaClicked: this.editQuotaClicked
                    },
                    collection_options: {
                        'order_by_fields': [['name', 'settings.quotas.edit_quota.quota_name'],
                                            ['memory_limit', 'settings.quotas.memory_limit'],
                                            ['total_services', 'settings.quotas.total_services']],
                        'filter_by_fields': [{'name': 'allow_sudo',
                                              'label': 'settings.quotas.allow_sudo'}]
                    },
                    context: this
                });
            },

            editQuotaClicked: function (quota, event) {

                sconsole.routers.settings.showEditQuotaSettingsDialog(
                    quota,
                    function (result) {
                        if (result && result.updated) {
                            this.quota_definitions_table.renderResource(result.quota);
                        }
                    },
                    this);
            },

            close: function () {
                this.quota_definitions_table.close();
                this.remove();
                this.unbind();
            }
        });
    }
);