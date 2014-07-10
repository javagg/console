/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'flot',
    'flot-time',
    'appsecute-api/lib/logger',
    'text!views/dashboard/templates/primary-node-stats.ejs'],
    function ($, Backbone, _, Flot, FlotTime, Logger, PrimaryNodeStatsTemplate) {

        return Backbone.View.extend({

            flot_options: {
                series: {
                    lines: { show: true }
                },
                legend: {
                    noColumns: 1,
                    position: 'nw',
                    backgroundOpacity: "0.5"
                },
                xaxis: {
                    ticks: 10,
                    mode: 'time'
                },
                yaxis: {
                    min: 0
                },
                selection: {
                    mode: "x"
                }
            },

            plugins: {
                cpu_0: 'cpu-0',
                memory: 'memory',
                load: 'load',
                processes: 'processes',
                swap: 'swap'
            },

            plugin_args: {
                "cpu-0": 'cpu-system,cpu-user,cpu-wait',
                memory: 'memory-used,memory-buffered,memory-cached,memory-free',
                load: '',
                processes: 'ps_state-running,ps_state-sleeping,ps_state-stopped,ps_state-zombies,ps_state-paging,ps_state-blocked',
                swap: 'swap-used,swap_io-in,swap_io-out,swap-cached,swap-free'
            },

            logger: new Logger('Primary Node Stats'),

            initialize: function () {
                _.bindAll(this);
                this.render();
            },

            render: function () {

                var self = this,
                    template = _.template(PrimaryNodeStatsTemplate, {});

                $(template)
                    .appendTo(this.el);

                this.$('#graph-tabs a', this.el).click(function (e) {
                    e.preventDefault();
                    self.destroyActiveGraph.call(self);
                    $(this).tab('show');
                });

                this.$('#graph-tabs a[href="#cpu"]').on('show.bs.tab', function (e) {
                    self.loadCPUGraph.call(self);
                });

                this.$('#graph-tabs a[href="#load"]').on('show.bs.tab', function (e) {
                    self.loadLoadGraph.call(self);
                });

                this.$('#graph-tabs a[href="#memory"]').on('show.bs.tab', function (e) {
                    self.loadMemoryGraph.call(self);
                });

                this.$('#graph-tabs a[href="#processes"]').on('show.bs.tab', function (e) {
                    self.loadProcessesGraph.call(self);
                });

                this.$('#graph-tabs a[href="#swap"]').on('show.bs.tab', function (e) {
                    self.loadSwapGraph.call(self);
                });

                $('#graph-tabs').find('a[href="#cpu"]').tab('show');
            },

            loadCPUGraph: function () {

                var self = this,
                    options = $.extend(true, {}, this.flot_options);

                options.yaxis.max = 100;

                this.getGraphData(
                    this.plugins.cpu_0,
                    function (err, data) {
                        if (err) {return self.logger.error('Unable to load CPU graph data: ' + err.message);}
                        self.renderGraph.call(self, self.$('#cpu-graph'), data, options);
                    }
                );
            },

            loadLoadGraph: function () {

                var self = this;

                this.getGraphData(
                    this.plugins.load,
                    function (err, data) {
                        if (err) {return self.logger.error('Unable to load "load" graph data: ' + err.message);}
                        self.renderGraph.call(self, self.$('#load-graph'), data, null);
                    }
                );
            },

            loadMemoryGraph: function () {

                var self = this,
                    options = $.extend(true, {}, this.flot_options);

                options.yaxis.tickFormatter = "byte";

                this.getGraphData(
                    this.plugins.memory,
                    function (err, data) {
                        if (err) {return self.logger.error('Unable to load memory graph data: ' + err.message);}
                        self.renderGraph.call(self, self.$('#memory-graph'), data, options);
                    }
                );
            },

            loadProcessesGraph: function () {

                var self = this;

                this.getGraphData(
                    this.plugins.processes,
                    function (err, data) {
                        if (err) {return self.logger.error('Unable to load processes graph data: ' + err.message);}
                        self.renderGraph.call(self, self.$('#processes-graph'), data, null);
                    }
                );
            },

            loadSwapGraph: function () {

                var self = this,
                    options = $.extend(true, {}, this.flot_options);

                options.yaxis.tickFormatter = "byte";

                this.getGraphData(
                    this.plugins.swap,
                    function (err, data) {
                        if (err) {return self.logger.error('Unable to load swap graph data: ' + err.message);}
                        self.renderGraph.call(self, self.$('#swap-graph'), data, options);
                    }
                );
            },

            destroyActiveGraph: function () {
                if (this.plot) {
                    this.plot.shutdown();
                }
            },

            getGraphData: function (plugin, done) {

                var self = this,
                    now = Math.floor((new Date()).getTime() / 1000),
                    start = now - 3600,
                    args = this.plugin_args[plugin];

                sconsole.cf_api.cluster.getPrimaryNodeStats(
                    plugin,
                    args,
                    start,
                    now,
                    {},
                    function (err, stats) {

                        if (err) {
                            return done.call(self, new Error(stats.body));
                        }

                        var data = self.formatGraphData(stats.json, start);
                        done.call(self, null, {start: start, finish: now, data: data});
                    }
                );
            },

            formatGraphData: function (input, start) {

                var offset = (new Date()).getTimezoneOffset() * 60;
                input = input['stackato'];
                var keys = _.keys(input);
                input = input[keys[0]];
                keys = _.keys(input);
                if (keys.length == 1) {
                    input = input[keys[0]];
                }
                var output = [];
                for (var name in input) {
                    var data = input[name].value ?
                        input[name].value.data :
                        input[name].data;
                    var seconds = start - offset;
                    var data2 = [];
                    data.pop();
                    for (var i = 0, l = data.length; i < l; i++, seconds += 10) {
                        if (data[i] === null) {
                            continue;
                        }
                        data2.push([seconds * 1000, data[i]]);
                    }

                    var set = {
                        'label': name,
                        'data': data2
                    };
                    output.push(set);
                }

                return output;
            },

            renderGraph: function (el, data, options) {

                options = options || _.clone(this.flot_options);

                var offset = (new Date()).getTimezoneOffset() * 60;

                options.xaxis.min = (data.start - offset) * 1000;
                options.xaxis.max = (data.finish - 10 - offset) * 1000;

                if (options.yaxis.tickFormatter === "byte") {
                    options.yaxis.tickFormatter = this.graphByteSuffixFormatter;
                }

                var self = this;

                self.plot = $.plot(el, data.data, options);

                $(el).bind("plotselected", function (event, ranges) {
                    self.plot = $.plot(
                        self.element,
                        data,
                        $.extend(true, {}, options, {
                            xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to }
                        }));
                });
            },

            graphByteSuffixFormatter: function (val, axis) {

                var units = ["B", "KB", "MB", "GB", "TB", "PB"],
                    i = 0;

                if (val === 0) {
                    // No decimal places for 0
                    return val + units[0];
                }
                for (i = 0; i < units.length; i++) {
                    if (val < Math.pow(1024, i + 1)) {
                        val = val / Math.pow(1024, i);
                        // 3 significant digits
                        return val.toFixed(val < 10 ? 2 : val < 100 ? 1 : 0) + units[i];
                    }
                }
                throw "Couldn't determine bytes unit";
            },

            close: function () {
                this.destroyActiveGraph();
                this.remove();
                this.unbind();
            }
        });
    }
);