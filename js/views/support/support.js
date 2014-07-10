/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'util/gravatar',
    'util/settings',
    'util/activity-indicator'],
    function ($, Backbone, _, Polyglot, Gravatar, Settings, Activity) {

        return Backbone.View.extend({

            events: {
            },

            initialize: function () {
                this.render();
            },

            render: function () {
                var that = this;
                sconsole.cf_api.getApiInfo(
                    function (err, res) {

                        that.options.activity.close();

                        var settings = Settings.getSettings(),
                            template = _.template(settings.support_template,
                                {
                                    settings: settings,
                                    polyglot: window.polyglot,
                                    support_email: res.support
                                }
                            );

                        $(template)
                            .appendTo(that.el);
                    }
                );
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
