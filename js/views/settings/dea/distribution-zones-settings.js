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
    'views/lists/distribution-zones-table-view',
    'text!views/settings/dea/templates/distribution-zones-settings.ejs'],
    function ($, Backbone, _, Polyglot, Async, Logger, Settings, Validate, ButtonHelper, DistributionZonesTableView, DistributionZonesTemplate) {

        return Backbone.View.extend({

            events: {
            },

            logger: new Logger('DEA Distribution Zones Settings'),

            initialize: function () {
                this.render();
            },

            render: function () {
                var template = _.template($(DistributionZonesTemplate).filter('#dea-zone-template').html().trim(), {});

                $(template).appendTo(this.el);

                this.app_table = new DistributionZonesTableView({
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
