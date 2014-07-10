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
    'text!views/dashboard/templates/usage-summary.ejs'],
    function ($, Backbone, _, Polyglot, Settings, Activity, ClusterSummaryTemplate) {

        return Backbone.View.extend({

            events: {
            },

            initialize: function () {
                _.bindAll(this);
                this.getUsageData();
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
                        .appendTo(self.el);

                    this.$('.progress').tooltip();
                });
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
