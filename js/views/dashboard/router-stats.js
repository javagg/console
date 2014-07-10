/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'chartjs',
    'jquery-fittext',
    'sockets/stats-socket',
    'text!views/dashboard/templates/router-stats.html'],
    function ($, Backbone, _, Polyglot, ChartJs, FitText, StatsSocket, RouterStatsTemplate) {

        return Backbone.View.extend({

            initialize: function () {

                _.bindAll(this);
                this.render();

                this.statsSocket = new StatsSocket();

                var that = this;
                this.statsSocket.on('ready', function () {
                    that.statsSocket.on('stats-update', that.handleRouterStatsUpdated);
                    that.statsSocket.joinRouterStats();
                });
            },

            render: function () {

                var template = _.template($(RouterStatsTemplate).filter('#router-stats-template').html().trim(), {});

                $(template)
                    .appendTo(this.el);

                $('.responsive-text').fitText(0.4);

                $('#load-distribution-help').popover({
                    trigger: 'hover',
                    title: polyglot.t('dashboard.load'),
                    content: polyglot.t('dashboard.load_description')});

                $('#current-requests-help').popover({
                    trigger: 'hover',
                    title: polyglot.t('dashboard.incoming_requests'),
                    content: polyglot.t('dashboard.incoming_requests_description')});

                $('#current-errors-help').popover({
                    trigger: 'hover',
                    title: polyglot.t('dashboard.routing_errors'),
                    content: polyglot.t('dashboard.routing_errors_description')});

                $('#historical-requests-help').popover({
                    trigger: 'hover',
                    title: polyglot.t('dashboard.historical_requests'),
                    content: polyglot.t('dashboard.historical_requests_description')});

                this.gage_current_https = new JustGage({
                    id: "current-https",
                    value: 0,
                    levelColorsGradient: true,
                    relativeGaugeSize: true,
                    title: polyglot.t('dashboard.https'),
                    label: polyglot.t('dashboard.requests_per_second'),
                    titleFontColor: "#fafbfc",
                    labelFontColor: "#fafbfc",
                    hideMinMax: true,
                    min: 0,
                    max: 1000
                });

                this.gage_current_http = new JustGage({
                    id: "current-http",
                    value: 0,
                    levelColorsGradient: true,
                    relativeGaugeSize: true,
                    title: polyglot.t('dashboard.http'),
                    label: polyglot.t('dashboard.requests_per_second'),
                    titleFontColor: "#fafbfc",
                    labelFontColor: "#fafbfc",
                    hideMinMax: true,
                    min: 0,
                    max: 1000
                });

                this.gage_current_websockets = new JustGage({
                    id: "current-websockets",
                    value: 0,
                    levelColorsGradient: true,
                    relativeGaugeSize: true,
                    title: polyglot.t('dashboard.websockets'),
                    label: polyglot.t('dashboard.connections_per_second'),
                    titleFontColor: "#fafbfc",
                    labelFontColor: "#fafbfc",
                    hideMinMax: true,
                    min: 0,
                    max: 1000
                });

                this.gage_current_errors_http = new JustGage({
                    id: "current-errors-http",
                    value: 0,
                    levelColorsGradient: true,
                    relativeGaugeSize: true,
                    title: polyglot.t('dashboard.http') + " ",
                    label: polyglot.t('dashboard.errors_per_second'),
                    titleFontColor: "#fafbfc",
                    labelFontColor: "#fafbfc",
                    hideMinMax: true,
                    min: 0,
                    max: 1000
                });

                this.gage_current_errors_https = new JustGage({
                    id: "current-errors-https",
                    value: 0,
                    levelColorsGradient: true,
                    relativeGaugeSize: true,
                    title: polyglot.t('dashboard.https') + " ",
                    label: polyglot.t('dashboard.errors_per_second'),
                    titleFontColor: "#fafbfc",
                    labelFontColor: "#fafbfc",
                    hideMinMax: true,
                    min: 0,
                    max: 1000
                });

                this.gage_current_errors_proxy = new JustGage({
                    id: "current-errors-proxy",
                    value: 0,
                    levelColorsGradient: true,
                    relativeGaugeSize: true,
                    title: polyglot.t('dashboard.proxy') + " ",
                    label: polyglot.t('dashboard.errors_per_second'),
                    titleFontColor: "#fafbfc",
                    labelFontColor: "#fafbfc",
                    hideMinMax: true,
                    min: 0,
                    max: 1000
                });

                var current_ctx = document.getElementById("current-distribution").getContext("2d");
                this.current_distribution_chart = new Chart(current_ctx);

                var lifetime_ctx = document.getElementById("lifetime-distribution").getContext("2d");
                this.lifetime_distribution_chart = new Chart(lifetime_ctx);

                this.distribution_charts_first_load = true;
            },

            // TODO: Need to randomly generate suitable colors, or expand this list to a reasonable length
            colorPalette: [
                "#026982",
                "#028269",
                "#690282",
                "#698202",
                "#820269",
                "#826902"
            ],

            router_color: {},

            renderDistributionKeys: function (routers) {

                var that = this;
                _.each(routers, function (router, index) {
                    that.router_color[router.host] = that.colorPalette[index];
                    $('<div>', {'class': 'router-key'})
                        .append($('<div>', {'class': 'router-key-color', style: 'background-color:' + that.router_color[router.host]}))
                        .append($('<span>', {'class': 'router-key-host'}).html(router.host))
                        .appendTo(that.$('#load-distribution-keys'));
                });
            },

            updateLoadDistributionCharts: function (routers) {

                var chart_options = {animation: false};

                if (this.distribution_charts_first_load) {
                    this.renderDistributionKeys(routers);
                    chart_options = {animation: true};
                }

                this.updateCurrentDistributionChart(routers, chart_options);
                this.updateLifetimeDistributionChart(routers, chart_options);

                this.distribution_charts_first_load = false;
            },

            updateCurrentDistributionChart: function (routers, chart_options) {

                var that = this;
                var data = [];
                var no_current_requests = true;

                _.each(routers, function (router, index) {
                    try {
                        var value = parseInt(router.current_connections_http) +
                            parseInt(router.current_connections_https) +
                            parseInt(router.current_websocket_requests);

                        if (value > 0) {
                            no_current_requests = false;
                        }

                        data.push({
                            value: value,
                            color: that.router_color[router.host]
                        });
                    } catch (e) {
                        // We can't do anything if we can't parse the stats...
                    }
                });

                if (no_current_requests) {
                    _.each(data, function (datum) {
                        datum.value = 1;
                    });
                }

                // If there is only one router then no need to continuously re-render
                if (this.distribution_charts_first_load || routers.length >= 2) {
                    this.current_distribution_chart.Doughnut(data, chart_options);
                }
            },

            updateLifetimeDistributionChart: function (routers, chart_options) {

                var that = this;
                var data = [];

                _.each(routers, function (router, index) {
                    try {
                        var value = (parseInt(router.total_connections_http) +
                            parseInt(router.total_connections_https) +
                            parseInt(router.total_websocket_requests)) || 0;

                        data.push({
                            value: value,
                            color: that.router_color[router.host]
                        });
                    } catch (e) {
                        // We can't do anything if we can't parse the stats...
                    }
                });

                // If there is only one router then no need to continuously re-render
                if (this.distribution_charts_first_load || routers.length >= 2) {
                    this.lifetime_distribution_chart.Doughnut(data, chart_options);
                }
            },

            numberWithCommas: function (x) {
                return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            },

            handleRouterStatsUpdated: function (event_data) {

                // event_data.data is an array of stats for each router in the cluster
                var cluster_totals = {};

                _.each(event_data.data, function (router_stats) {
                    _.each(router_stats, function (value, key) {
                        if (_.isUndefined(cluster_totals[key])) {
                            cluster_totals[key] = 0;
                        }

                        try {
                            cluster_totals[key] += parseInt(value);
                        } catch (e) {
                            // Just ignore values that aren't numbers...
                        }
                    });
                });

                /*
                 current_connections_http: 0
                 current_connections_https: 1
                 current_websocket_requests: 0

                 current_errors_http: 0
                 current_errors_https: 0
                 current_proxy_errors: 0

                 total_connections_http: 9039
                 total_connections_https: 28046
                 total_websocket_requests: 0

                 total_errors_http: 0
                 total_errors_https: 0
                 total_proxy_errors: 230

                 current_memory_usage_heap_total: 33906176
                 current_memory_usage_heap_used: 21936424
                 current_memory_usage_rss: 84025344
                 */

                this.updateLoadDistributionCharts(event_data.data);

                this.gage_current_https.refresh(cluster_totals.current_connections_https);
                this.gage_current_http.refresh(cluster_totals.current_connections_http);
                this.gage_current_websockets.refresh(cluster_totals.current_websocket_requests);

                this.gage_current_errors_http.refresh(cluster_totals.current_errors_http);
                this.gage_current_errors_https.refresh(cluster_totals.current_errors_https);
                this.gage_current_errors_proxy.refresh(cluster_totals.current_proxy_errors);

                this.$('#total-https').html(this.numberWithCommas(cluster_totals.total_connections_https));
                this.$('#total-http').html(this.numberWithCommas(cluster_totals.total_connections_http));
                this.$('#total-websockets').html(this.numberWithCommas(cluster_totals.total_websocket_requests));
            },

            close: function () {
                this.statsSocket.leaveRouterStats();
                this.remove();
                this.unbind();
            }
        });
    }
);
