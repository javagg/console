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
    'text!views/dashboard/templates/usage-placement-zone.ejs'],
    function ($, Backbone, _, Polyglot, Settings, Activity, PlacementZoneUsageTemplate) {

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

                    var pz_template = _.template($(PlacementZoneUsageTemplate).filter('#usage-placement-zone-template').html().trim(),
                        { polyglot: window.polyglot, usage: usage });
                    $(pz_template)
                        .appendTo(self.el);

                    _.each(usage.placement_zones, function (pz) {
                        pz.used_by_apps = pz.total_physical ? pz.total_used / pz.total_physical * 100 : 0;
                        pz.allocated_to_apps = pz.total_physical ? ( pz.total_allocated - pz.total_used ) / pz.total_physical * 100 : 0;
                        var pz_row_template = _.template($(PlacementZoneUsageTemplate).filter('#usage-placement-zone-table-row-template').html().trim(),
                            { polyglot: window.polyglot, pz: pz });

                        $(pz_row_template)
                            .appendTo(this.$('#placement-zone-usage-table tbody'));
                    });
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
