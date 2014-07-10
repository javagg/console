/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'jqueryvalidation',
    'backbone',
    'underscore',
    'polyglot',
    'async',
    'util/gravatar',
    'util/activity-indicator',
    'util/maintenance-mode',
    'util/button-helper',
    'util/role-count',
    'views/settings/dea/general-dea-settings',
    'views/settings/dea/distribution-zones-settings',
    'views/settings/dea/availability-zones-settings',
    'text!views/settings/dea/templates/settings.html',
    'text!util/templates/alert.html'],
    function ($, Validate, Backbone, _, Polyglot, Async, Gravatar, Activity, MaintenanceMode, ButtonHelper, RoleCount, GeneralSettingsView, DistributionZonesView, AvailabilityZonesView, SettingsTemplate, AlertTemplate) {

        return Backbone.View.extend({

            events: {
                'click .general-dea-settings': 'generalSettingsClicked',
                'click .dea-distribution-zones-settings': 'deaDistributionZonesSettingsClicked',
                'click .dea-availability-zones-settings': 'deaAvailabilityZonesSettingsClicked'
            },

            initialize: function () {
                this.options.activity.close();
                this.render();

                this.options.sub_view = this.options.sub_view || 'general';

                switch (this.options.sub_view) {
                    case 'general':
                        this.renderSubView(GeneralSettingsView, '.general-dea-settings');
                        break;

                    case 'distribution_zones':
                        this.renderSubView(DistributionZonesView, '.dea-distribution-zones-settings');
                        break;

                    case 'availability_zones':
                        this.renderSubView(AvailabilityZonesView, '.availability-zones-settings');
                        break;

                    default:
                        this.renderSubView(GeneralSettingsView, '.general-dea-settings');
                        break;
                }

                RoleCount.renderNodeCount('dea', '.role-count-container');
            },

            render: function () {
                var template = _.template($(SettingsTemplate).filter('#settings-template').html().trim(), {});

                $(template).appendTo(this.el);
            },

            renderSubView: function (view, menu_selector) {

                if (this.sub_view) {
                    this.sub_view.close();
                }

                sconsole.routers.settings.navigate('settings/dea/' + this.options.sub_view, {trigger: false});

                $('.settings-menu li').removeClass('active');
                $(menu_selector).parent('li').addClass('active');

                this.sub_view = new view({el: $('<div>').appendTo(this.$('.settings-container'))});
            },

            generalSettingsClicked: function () {
                this.options.sub_view = 'general';
                this.renderSubView(GeneralSettingsView, '.general-dea-settings');
                return false;
            },

            deaDistributionZonesSettingsClicked: function () {
                this.options.sub_view = 'distribution-zones';
                this.renderSubView(DistributionZonesView, '.dea-distribution-zones-settings');
                return false;
            },

            deaAvailabilityZonesSettingsClicked: function () {
                this.options.sub_view = 'availability-zones';
                this.renderSubView(AvailabilityZonesView, '.dea-availability-zones-settings');
                return false;
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
