/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'views/dashboard/cluster-memory-usage-summary',
    'views/dashboard/cluster-memory-usage-by-dea',
    'views/dashboard/cluster-memory-usage-by-placement-zone',
    'views/dashboard/cluster-memory-usage-by-availability-zone',
    'views/dashboard/primary-node-stats',
    'views/dashboard/router-stats',
    'text!views/dashboard/templates/dashboard.ejs'],
    function ($, Backbone, _, Polyglot, ClusterMemoryUsageSummary, ClusterMemoryByDEA, ClusterMemoryByPZ, ClusterMemoryByAZ, PrimaryNodeStats, RouterStats, DashboardTemplate) {

        return Backbone.View.extend({

            events: {
                "click .memory-usage-summary": "clusterMemoryUsageSummaryClicked",
                "click .dea-usage": "clusterMemoryUsageByDEAClicked",
                "click .placement-zone-usage": "clusterMemoryUsageByPZClicked",
                "click .availability-zone-usage": "clusterMemoryUsageByAZClicked",
                "click .router-stats": "routerStatsClicked",
                "click .primary-node-stats": "primaryNodeStatsClicked"
            },

            initialize: function () {
                _.bindAll(this);
                this.options.activity.close();
                this.render();

                this.options.sub_view = this.options.sub_view || 'cluster-memory-usage-summary';
                switch (this.options.sub_view) {
                    case 'memory-usage-summary':
                        this.clusterMemoryUsageSummaryClicked();
                        break;

                    case 'dea-usage':
                        this.clusterMemoryUsageByDEAClicked();
                        break;

                    case 'placement-zone-usage':
                        this.clusterMemoryUsageByPZClicked();
                        break;

                    case 'availability-zone-usage':
                        this.clusterMemoryUsageByAZClicked();
                        break;

                    case 'router-stats':
                        this.routerStatsClicked();
                        break;

                    case 'primary-node-stats':
                        this.primaryNodeStatsClicked();
                        break;

                    default:
                        this.clusterMemoryUsageSummaryClicked();
                        break;
                }
            },

            render: function () {

                var template = _.template(DashboardTemplate, {});

                $(template)
                    .appendTo(this.el);

                $('.dashboard-tabs li .' + this.options.sub_view).click();
            },

            deactivateStatsSelection: function () {
                this.$('.stats-list div').removeClass('active');
            },

            closeActiveChildView: function () {
                if (this.current_child) {
                    this.current_child.close();
                }
            },

            loadChildView: function (view, menu_selector) {
                this.deactivateStatsSelection();
                this.closeActiveChildView();
                
                $('.dashboard-tabs li').removeClass('active');
                $(menu_selector).parent('li').addClass('active');

                sconsole.routers.settings.navigate('dashboard/' + menu_selector.substring(1) , {trigger: false});
                this.current_child = new view({el: $('<div>').appendTo(this.$('.dashboard-content'))});
            },

            clusterMemoryUsageSummaryClicked: function () {
                this.loadChildView(ClusterMemoryUsageSummary, '.memory-usage-summary');
            },

            clusterMemoryUsageByDEAClicked: function () {
                this.loadChildView(ClusterMemoryByDEA, '.dea-usage');
            },

            clusterMemoryUsageByPZClicked: function () {
                this.loadChildView(ClusterMemoryByPZ, '.placement-zone-usage');
            },

            clusterMemoryUsageByAZClicked: function () {
                this.loadChildView(ClusterMemoryByAZ, '.availability-zone-usage');
            },

            routerStatsClicked: function () {
                this.loadChildView(RouterStats, '.router-stats');
            },

            primaryNodeStatsClicked: function () {
                this.loadChildView(PrimaryNodeStats, '.primary-node-stats');
            },

            close: function () {
                this.closeActiveChildView();
                this.remove();
                this.unbind();
            }
        });
    }
);
