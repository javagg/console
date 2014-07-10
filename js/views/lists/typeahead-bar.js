/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'bootstrap',
    'select',
    'appsecute-api/lib/utils',
    'appsecute-api/lib/logger',
    'text!views/lists/templates/typeahead-bar.ejs'],
    function ($, Backbone, _, Bootstrap, Select, Utils, Logger, TypeAheadBarTemplate) {

        return Backbone.View.extend({

            logger: new Logger('Type Ahead Bar'),

            collection: null,

            search_property: null,

            selected_resource: null,

            parseOptions: function () {

                if (!this.options.collection) {
                    throw 'CF Api collection to search against must be provided.'
                }

                this.collection = this.options.collection;

                if (!this.options.search_property) {
                    throw 'Property to search on must be provided.'
                }

                this.search_property = this.options.search_property;
            },

            initialize: function () {
                this.parseOptions();
                this.render();
                this.initializeTypeAhead();
            },

            render: function () {

                var template = _.template(TypeAheadBarTemplate, {});

                $(this.el)
                    .append(template);
            },

            initializeTypeAhead: function () {

                var self = this,
                    config = {
                        placeholder: this.options.placeholder || '',
                        minimumInputLength: 0,
                        allowClear: true,
                        ajax: {
                            url: sconsole.cf_api.api_endpoint + self.collection.getCollectionUrl(),
                            dataType: 'json',
                            data: function (term, page) {
                                return {
                                    q: self.search_property + ':' + term + '*',
                                    page: page
                                };
                            },
                            results: function (data) {
                                return self.mutatePageForTypeAhead(data);
                            }
                        },
                        dropdownAutoWidth: true,
                        escapeMarkup: function (m) { return _.escape(m); }
                    };

                if (self.options.resource_formatter) {
                    config.formatResult = self.options.resource_formatter;
                }

                this.$('.select').select2(config);
                this.$('.select').on('change', function (event) {
                    self.resourceSelected.call(self, event.added);
                });
            },

            mutatePageForTypeAhead: function (res_body) {

                var self = this,
                    datums = [];

                _.each(res_body.resources, function (resource) {
                    datums.push({
                        id: resource.metadata.guid,
                        text: resource.entity[self.search_property],
                        resource: resource
                    });
                });

                return {results: datums, more: res_body.next_url ? true : false};
            },

            resourceSelected: function (datum) {
                this.selected_resource = datum ? datum.resource : null;
                this.trigger('resource_selected', this.selected_resource);
            },

            getSelectedResource: function () {
                var selected = this.$('.select').select2('data');
                return selected ? selected.resource : null;
            },

            close: function () {
                this.$('.select').select2('destroy');
                this.remove();
                this.unbind();
            }
        });
    }
);