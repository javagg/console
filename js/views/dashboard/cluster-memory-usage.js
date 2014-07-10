/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'util/settings',
    'util/activity-indicator',
    'text!views/dashboard/templates/usage-summary.ejs',
    'text!views/dashboard/templates/usage-dea.ejs',
    'text!views/dashboard/templates/usage-placement-zone.ejs',
    'text!views/dashboard/templates/usage-availability-zone.ejs'],
    function ($, Backbone, _, Polyglot, Settings, Activity, ClusterSummaryTemplate, DEAUsageTemplate, PlacementZoneUsageTemplate, AvailabilityZoneUsageTemplate) {

        return Backbone.View.extend({

            events: {
                'click .usage-tabs li a': 'usageTabClicked'
            },

            initialize: function () {
                this.options.activity.close();
                this.options.sub_view = this.options.sub_view || 'summary';
                this.render();
                this.getUsageData();

            },

            render: function () {

                var self = this,
                    template = _.template($(ClusterTemplate).filter('#usage-template').html().trim(), { polyglot: window.polyglot });

                $(template)
                    .appendTo(this.el);

                this.$('.usage-tabs li a[href=#' + this.options.sub_view + ']').click();
            },

            getUsageData: function () {
                var self = this;

                sconsole.cf_api.cluster.getUsage(function (err, usage) {
                    if (err) {return;}

                    var total_memory = usage.cluster.total_available + usage.cluster.total_allocated;
                    var max_usage_value = Math.max(usage.cluster.total_available, usage.cluster.total_assigned, usage.cluster.total_allocated, usage.cluster.total_used);
                    var summary_template = _.template($(ClusterSummaryTemplate).filter('#usage-summary-template').html().trim(),
                        { polyglot: window.polyglot, usage: usage, max_usage_value: max_usage_value, total_memory: total_memory });
                    $(summary_template)
                        .appendTo(this.$('#summary'));

                    var dea_template = _.template($(DEAUsageTemplate).filter('#usage-dea-template').html().trim(),
                        { polyglot: window.polyglot, usage: usage });
                    $(dea_template)
                        .appendTo(this.$('#by_dea'));

                    _.each(usage.deas, function (dea) {
                        var dea_row_template = _.template($(DEAUsageTemplate).filter('#usage-dea-table-row-template').html().trim(),
                            { polyglot: window.polyglot, dea: dea });

                        $(dea_row_template)
                            .appendTo(this.$('#dea-usage-table tbody'));
                    });

                    var pz_template = _.template($(PlacementZoneUsageTemplate).filter('#usage-placement-zone-template').html().trim(),
                        { polyglot: window.polyglot, usage: usage });
                    $(pz_template)
                        .appendTo(this.$('#by_placement_zone'));

                    _.each(usage.placement_zones, function (pz) {
                        var pz_row_template = _.template($(PlacementZoneUsageTemplate).filter('#usage-placement-zone-table-row-template').html().trim(),
                            { polyglot: window.polyglot, pz: pz });

                        $(pz_row_template)
                            .appendTo(this.$('#placement-zone-usage-table tbody'));
                    });

                    var az_template = _.template($(AvailabilityZoneUsageTemplate).filter('#usage-availability-zone-template').html().trim(),
                        { polyglot: window.polyglot, usage: usage });
                    $(az_template)
                        .appendTo(this.$('#by_availability_zone'));

                    _.each(usage.availability_zones, function (az) {
                        var az_row_template = _.template($(AvailabilityZoneUsageTemplate).filter('#usage-availability-zone-table-row-template').html().trim(),
                            { polyglot: window.polyglot, az: az });

                        $(az_row_template)
                            .appendTo(this.$('#availability-zone-usage-table tbody'));
                    });

                    this.$('.progress').tooltip();
                });
            },

            usageTabClicked: function (e) {
                e.preventDefault();
                $(this).tab('show');
                var sub_view = $(e.target).attr('href').substring(1);
                sconsole.routers.usage.navigate('usage/' + sub_view, {trigger: false});
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
