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
    'text!views/dashboard/templates/usage-availability-zone.ejs'],
    function ($, Backbone, _, Polyglot, Settings, Activity, AvailabilityZoneUsageTemplate) {

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

                    var az_template = _.template($(AvailabilityZoneUsageTemplate).filter('#usage-availability-zone-template').html().trim(),
                        { polyglot: window.polyglot, usage: usage });
                    $(az_template)
                        .appendTo(self.el);

                    _.each(usage.availability_zones, function (az) {
                        az.used_by_apps = az.total_physical ? az.total_used / az.total_physical * 100 : 0;
                        az.allocated_to_apps = az.total_physical ? ( az.total_allocated - az.total_used ) / az.total_physical * 100 : 0;
                        var az_row_template = _.template($(AvailabilityZoneUsageTemplate).filter('#usage-availability-zone-table-row-template').html().trim(),
                            { polyglot: window.polyglot, az: az });

                        $(az_row_template)
                            .appendTo(this.$('#availability-zone-usage-table tbody'));
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
