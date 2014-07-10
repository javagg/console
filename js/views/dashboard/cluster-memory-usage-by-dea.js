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
    'text!views/dashboard/templates/usage-dea.ejs'],
    function ($, Backbone, _, Polyglot, Settings, Activity, DEAUsageTemplate) {

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

                    var dea_template = _.template($(DEAUsageTemplate).filter('#usage-dea-template').html().trim(),
                        { polyglot: window.polyglot, usage: usage });
                    $(dea_template)
                        .appendTo(self.el);

                    _.each(usage.deas, function (dea) {
                        var dea_row_template = _.template($(DEAUsageTemplate).filter('#usage-dea-table-row-template').html().trim(),
                            { polyglot: window.polyglot, dea: dea });

                        $(dea_row_template)
                            .appendTo(this.$('#dea-usage-table tbody'));
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
