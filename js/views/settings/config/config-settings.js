/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'util/activity-indicator',
    'util/settings',
    'text!views/settings/config/templates/config-settings.ejs'],
    function ($, Backbone, _, Polyglot, Activity, Settings, ConfigSettingsTemplate) {

        return Backbone.View.extend({

            events: {
            },

            initialize: function () {
                this.getComponents();
            },

            getComponents: function () {

                var self = this;
                sconsole.cf_api.config.getComponentList(function (err, components) {
                    self.options.activity.close();
                    if (!err) {
                        self.render();
                        self.renderComponents(components);
                    }
                });
            },

            render: function () {

                var template = _.template(ConfigSettingsTemplate, { settings: Settings.getSettings() });

                $(template)
                    .appendTo(this.el);
            },

            renderComponents: function (components) {

                var self = this;
                _.each(components, function (component, index) {

                    var component_el = $('<a>', {href: '#', 'class': 'list-group-item', html: component.name})
                        .click(function (e) {self.componentClicked.call(self, e, component);})
                        .appendTo(self.$('.component-list'));

                    if (index === 0) {
                        component_el.click();
                    }
                });
            },

            componentClicked: function (e, component) {

                e.preventDefault();

                this.$('.component-list a').removeClass('active');
                this.$('.component-container').empty();
                $(e.target).addClass('active');

                var self = this,
                    activity = new Activity(this.$('.component-container'));

                sconsole.cf_api.config.getComponentConfig(component.url, function (err, component_config) {
                    activity.close();
                    if (!err) {
                        self.renderComponentConfig(component, component_config);
                    }
                });
            },

            renderComponentConfig: function (component, component_config) {

            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);