/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'async',
    'appsecute-api/lib/logger',
    'util/settings',
    'jqueryvalidation',
    'util/button-helper',
    'views/lists/availability-zones-table-view',
    'text!views/settings/dea/templates/availability-zones-settings.ejs'],
    function ($, Backbone, _, Polyglot, Async, Logger, Settings, Validate, ButtonHelper, AvailabilityZonesTableView, AvailabilityZonesTemplate) {

        return Backbone.View.extend({

            events: {
            },

            logger: new Logger('DEA Availability Zones Settings'),

            initialize: function () {
                this.render();
            },

            render: function () {
                var template = _.template($(AvailabilityZonesTemplate).filter('#dea-zone-template').html().trim(), {});

                $(template).appendTo(this.el);

                this.app_table = new AvailabilityZonesTableView({
                    el: this.$('.zone-listing'),
                    context: this
                });
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
