/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'appsecute-api/lib/utils',
    'appsecute-api/lib/logger',
    'util/activity-indicator',
    'text!views/lists/templates/search-bar.ejs'],
    function ($, Backbone, _, Polyglot, Utils, Logger, Activity, SearchBarTemplate) {

        return Backbone.View.extend({

            logger: new Logger('Search Bar'),

            events: {
                'click .btn-search': "searchClicked",
                'click .clear-search': "clearSearchClicked",
                'keyup .search-input': "searchInputKeyUp",
                'click .order-by a': "orderByChanged",
                'click .sort-order a': "sortOrderChanged",
                'click .filter-by a': "filterChanged",
                'click .search-filter-clear': "filterCleared"
            },

            collection: null,

            search_property: null,

            previous_search_value: '',

            sayt_delay_ms: 300,

            sayt_timer: null,

            sayt_enabled: true,

            order_by_fields: [],

            parseOptions: function () {

                if (!this.options.collection) {
                    throw 'CF Api collection to search against must be provided.'
                }

                this.collection = this.options.collection;

                if (!this.options.search_property) {
                    throw 'Property to search on must be provided.'
                }

                this.search_property = this.options.search_property;

                if (this.options.disable_sayt) {
                    this.sayt_enabled = false;
                }

                this.options.search_options = this.options.search_options || {};
                this.options.queries = this.options.search_options.queries || {};
                var order_by_fields = this.options.search_options.order_by_fields;
                this.order_by_fields = Array.isArray(order_by_fields) ? [].concat(order_by_fields) : [];
                var filter_by_fields = this.options.search_options.filter_by_fields;
                this.filter_by_fields = Array.isArray(filter_by_fields) ? [].concat(filter_by_fields) : [];
            },

            initialize: function () {

                this.parseOptions();
                this.render();
            },

            render: function () {

                var template = _.template($(SearchBarTemplate).filter('#search-bar').html().trim(), {});

                $(this.el)
                    .append(template);

                if (this.filter_by_fields.length > 0) {
                    this.renderFilters();
                }

                this.renderSortOrder();

                if (this.order_by_fields.length > 0) {
                    this.renderOrderBy();
                }

                if (this.order_by_fields.length + this.filter_by_fields.length < 1) {
                    $(this.el)
                        .find('.filter-container')
                        .hide();
                }
            },

            renderOrderBy: function () {
                var template = _.template($(SearchBarTemplate).filter('#order-by').html().trim(), {'order_by_fields': this.order_by_fields, 'polyglot': polyglot});

                $(this.el)
                    .find('.filter-container .sort-order-btn-group .section-header')
                    .after(template);
            },

            renderFilters: function () {
                var template = $(_.template($(SearchBarTemplate).filter('#filter-by-container').html().trim(), {'polyglot': polyglot}));

                $(this.el)
                    .find('.filter-container')
                    .append(template);

                var self = this;
                _.each(this.filter_by_fields, function (item) {
                    if (!item.values) {
                        item.values = [
                            ['true', item.label, 'glyphicon glyphicon-ok'],
                            ['false', item.label, 'glyphicon glyphicon-remove']
                        ];
                    }

                    _.each(item.values, function (value) {
                        if (value.length > 2) {
                            value[2] = _.template($(SearchBarTemplate).filter('#filter-by-icon').html().trim(), {'classes': value[2]});
                        } else {
                            value[2] = "";
                        }
                    });

                    var select = _.template($(SearchBarTemplate).filter('#filter-by-item').html().trim(), {'key': item.name, 'label': item.label, 'values': item.values});

                    $(self.el)
                        .find('.filter-container .search-filter-group')
                        .append(select);
                });
            },

            renderSortOrder: function () {

                var sort_order_template = _.template($(SearchBarTemplate).filter('#sort-order').html().trim(), {'polyglot': polyglot});
                $(this.el)
                    .find('.filter-container')
                    .append(sort_order_template);
            },

            stopSaytTimer: function () {

                if (this.sayt_timer) {
                    clearTimeout(this.sayt_timer);
                }
            },

            startSaytTimer: function () {

                var self = this;
                this.sayt_timer = setTimeout(function () {
                        self.saytTimerFired.call(self);
                    },
                    this.sayt_delay_ms);
            },

            resetSaytTimer: function () {
                this.stopSaytTimer();
                this.startSaytTimer();
            },

            saytTimerFired: function () {
                this.search();
            },

            searchInputKeyUp: function (event) {

                if (event.keyCode === 13) { // handle enter key press
                    this.search();
                } else if (this.sayt_enabled) {

                    var current_search_value = $(event.target).val();
                    if (current_search_value !== this.previous_search_value) {
                        this.resetSaytTimer();
                    }

                    this.previous_search_value = current_search_value;
                }

                if (this.$('.search-input').val() !== "") {
                    this.$('.clear-search').show();
                } else {
                    this.$('.clear-search').hide();
                }
            },

            searchClicked: function () {
                this.search();
            },

            clearSearchClicked: function () {
                this.$('.search-input').val('');
                this.$('.clear-search').hide();
                this.search();
            },

            sortOrderChanged: function (e) {

                var elem = $(e.target),
                    label = $('<span>');
                label.append(elem.data('title') || elem.text());

                elem
                    .closest('.dropdown')
                    .find('.btn > :first-child')
                    .replaceWith(label);

                this.options.queries.order = elem.data('value');

                this.search();
            },

            orderByChanged: function (e) {

                var elem = $(e.target);

                // Clear selection
                elem
                    .closest('.btn-group')
                    .find('.btn-info')
                    .addClass('btn-default')
                    .removeClass('btn-info');

                // Set new selection
                var btn = elem.closest('.order-by').find('button');
                if (elem.data('value') == "unset") {
                    $('.order-by .btn > :first-child').text(polyglot.t(this.order_by_fields[0][1]));
                    this.options.queries['order-by'] = this.order_by_fields[0][0];
                    btn.addClass('btn-default').removeClass('btn-info');
                } else {

                    var label = $('<span>');
                    label.append(elem.data('title') || elem.text());
                    elem
                        .closest('.dropdown')
                        .find('.btn > :first-child')
                        .replaceWith(label);

                    this.options.queries['order-by'] = elem.data('value');
                    btn.addClass('btn-info').removeClass('btn-default');
                }

                this.search();
            },

            filterChanged: function (e) {

                var elem = $(e.target);

                var label = $('<span>');
                label.append(elem.data('title') || elem.html());

                elem
                    .closest('.dropdown')
                    .find('.btn > :first-child')
                    .replaceWith(label);

                elem
                    .closest('.dropdown-menu')
                    .data('value', elem.data('value'));

                if (elem.data('value') == 'unset') {
                    elem
                        .closest('.dropdown')
                        .find('.btn')
                        .addClass('btn-default')
                        .removeClass('btn-info');
                } else {
                    elem
                        .closest('.dropdown')
                        .find('.btn')
                        .addClass('btn-info')
                        .removeClass('btn-default');
                }
                this.search();
            },

            filterCleared: function () {

                // Reset search order
                $('.sort-order .btn > :first-child').text(polyglot.t('layout.search.sort.ascending'));
                this.options.queries.order = 'asc';

                // Reset order by
                $('.order-by .btn > :first-child').text(polyglot.t(this.order_by_fields[0][1]));
                this.options.queries['order-by'] = this.order_by_fields[0][0];
                $('.order-by')
                    .find('.btn')
                    .addClass('btn-default')
                    .removeClass('btn-info');

                // Reset search filters
                _.each(this.$('.filter-by'), function (filter) {
                    filter = $(filter);
                    var label = $('<span>');
                    label.append(filter.find('.unset').data('title'));

                    filter
                        .find('.btn > :first-child')
                        .replaceWith(label);

                    filter
                        .find('.dropdown-menu')
                        .data('value', 'unset');

                    filter
                        .find('.btn-info')
                        .addClass('btn-default')
                        .removeClass('btn-info');
                });

                this.search();
            },

            search: function () {

                this.stopSaytTimer();

                var self = this,
                    search_value = this.$('.search-input').val();

                this.options.queries.q = this.search_property + ':' + search_value + '*';

                if (this.options.search_options.filter) {
                    var filter = this.options.search_options.filter;
                    this.options.queries.q += ';' + filter.name + ":" + filter.value;
                }

                _.each(this.$('.filter-by .dropdown-menu'), function (elem) {
                    elem = $(elem);
                    if (elem.data('value') != 'unset') {
                        self.options.queries.q += ";" + elem.data('key') + ':' + elem.data('value');
                    }
                });

                this.options.queries.q = encodeURIComponent(this.options.queries.q);

                this.collection.list({
                        queries: this.options.queries
                    },
                    function (err, result_page) {

                        if (err) {
                            self.logger.error(err);
                        }

                        if (Utils.isFunction(self.options.search_complete)) {
                            self.options.search_complete.call(self.options.context || self, err, result_page);
                        }
                    });
            },

            close: function () {
                this.stopSaytTimer();
                this.remove();
                this.unbind();
            }
        });
    }
);