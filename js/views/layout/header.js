/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'appsecute-api/lib/utils',
    'appsecute-api/lib/logger',
    'util/gravatar',
    'util/settings',
    'access/admin-access',
    'views/alerts/alerts',
    'text!views/layout/templates/header.ejs'],
    function ($, Backbone, _, Polyglot, Utils, Logger, Gravatar, Settings, AdminAccess, AlertView, HeaderTemplate) {

        return Backbone.View.extend({

            logger: new Logger('Header'),

            events: {
                "click .logout": "logoutClicked"
            },

            initialize: function () {
                this.render();
                if (!this.options.setup_pending) {
                    this.watchRoutes();
                    this.renderUserInfo();
                    this.renderAlerts();
                    this.showAvailableSettings();
                    this.$('.header-links-wrapper').show();
                }
            },

            render: function () {

                var template = _.template(HeaderTemplate, {settings: Settings.getSettings()});

                $(template)
                    .appendTo(this.el);

                if (AdminAccess.isAdmin()) {
                    this.$('.navbar li').removeClass('admin-only');
                }
            },

            watchRoutes: function () {

                var self = this;
                Backbone.history.on('route', function (router, name, args) {

                    self.$('.navbar-nav li').removeClass('active');

                    switch (router) {
                        case sconsole.routers.application:
                            if (name.indexOf('admin') !== -1) {
                                self.$('.nav-admin').addClass('active');
                            } else {
                                self.$('.nav-applications').addClass('active');
                            }
                            break;

                        case sconsole.routers.store:
                            self.$('.nav-applications').addClass('active');
                            break;

                        case sconsole.routers.organizations:
                            if (name.indexOf('admin') !== -1) {
                                self.$('.nav-admin').addClass('active');
                            } else {
                                self.$('.nav-organizations').addClass('active');
                            }
                            break;

                        case sconsole.routers.spaces:
                            self.$('.nav-organizations').addClass('active'); // spaces are nested under orgs
                            break;

                        case sconsole.routers.users:
                            if (name.indexOf('admin') !== -1) {
                                self.$('.nav-admin').addClass('active');
                            } else {
                                self.$('.nav-organizations').addClass('active');
                            }
                            break;

                        case sconsole.routers.domains:
                            if (name.indexOf('admin') !== -1) {
                                self.$('.nav-admin').addClass('active');
                            } else {
                                self.$('.nav-organizations').addClass('active');
                            }
                            break;

                        case sconsole.routers.services:
                            if (name.indexOf('admin') !== -1) {
                                self.$('.nav-admin').addClass('active');
                            } else {
                                self.$('.nav-organizations').addClass('active');
                            }
                            break;

                        case sconsole.routers.dashboard:
                            self.$('.nav-admin').addClass('active');
                            break;

                        case sconsole.routers.eventlog:
                            self.$('.nav-admin').addClass('active');
                            break;

                        case sconsole.routers.cluster:
                            self.$('.nav-admin').addClass('active');
                            break;

                        case sconsole.routers.settings:
                            self.$('.nav-settings').addClass('active');
                            break;

                        case sconsole.routers.support:
                            self.$('.nav-support').addClass('active');
                            break;
                    }
                });
            },

            renderUserInfo: function () {

                var user_info = sconsole.user.info.entity;

                this.$('.profile-img').attr('src', user_info.image_url);
                this.$('.profile-name').text(user_info.user_name);
                this.$('.account-details').attr('href', '#users/' + user_info.user_id);
            },

            renderAlerts: function () {

                if (!AdminAccess.isAdmin()) {return;}

                this.alert_view = sconsole.alert_view = new AlertView({el: this.$('.navbar-right')});
            },

            showAvailableSettings: function () {

                var that = this;
                sconsole.cf_api.cluster.getStatus({}, function (err, status) {
                    if (err) {
                        // if the call fails, just show all the settings links so that we don't block use of the navigation
                        that.$('.settings_link').removeClass('hide');
                    } else {
                        // only display links for those roles that are available
                        var roles = _.keys(status.roles_stats);

                        _.each(roles, function (role) {
                            that.$('.' + role + "_link").removeClass('hide');
                        });
                    }
                });
            },

            logoutClicked: function (e) {

                e.preventDefault();

                sconsole.cf_api.logout(function (err) {
                    Utils.deleteCookie('cf_token');
                    sconsole.cf_api.authorize();
                });
            },

            close: function () {

                if (this.alert_view) {
                    this.alert_view.close();
                }

                this.remove();
                this.unbind();
            }
        });
    }
);
