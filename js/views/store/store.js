/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'appsecute-api/lib/logger',
    'util/gravatar',
    'util/activity-indicator',
    'jquery-equalheights',
    'text!util/templates/alert.html',
    'text!views/store/templates/store.html'],
    function ($, Backbone, _, Polyglot, Logger, Gravatar, Activity, EqualHeights, AlertTemplate, StoreTemplate) {

        return Backbone.View.extend({

            events: {
                'click .clone_repo': "cloneRepoClicked"
            },

            logger: new Logger('Store'),

            initialize: function () {
                this.options.activity.close();
                this.render();
                this.getAppStoresContent();
            },

            render: function () {

                var template = _.template($(StoreTemplate).filter('#store-template').html().trim(), { polyglot: window.polyglot });

                $(template).appendTo(this.el);

                this.activity = new Activity(this.$('#store-apps'));
            },

            getAppStoresContent: function () {

                var self = this;

                sconsole.cf_api.app_stores.list(
                    {queries: {'inline-relations-depth': 1}},
                    function (err, app_stores) {
                        if (err) {return;}
                        self.filterStoresAgainstRequirements(app_stores.data.resources);
                    });
            },

            filterStoresAgainstRequirements: function (store_resources) {

                var services_map = {
                    "file system": "filesystem"
                };

                var that = this;
                sconsole.cf_api.services.list({}, function (err, services) {
                    if (err) {
                        return;
                    }

                    var available_services = [];
                    _.each(services.data.resources, function (service) {
                        if (service.entity.active) {
                            available_services.push(service.entity.label);
                        }
                    });

                    var s = 0;
                    store_resources = _.filter(store_resources, function (resource) {
                        if (resource.entity.error || !resource.entity.content) {
                            that.logger.warn("Error loading store manifest " + resource.entity.content_url);
                            if (!resource.entity.error) {
                                resource.entity.error = true;
                            }
                            return false; // Error loading store, skip it
                        }
                        var store_name = resource.metadata.name;
                        var store_content = resource.entity.content;
                        var enabled = resource.entity.enabled;
                        if (enabled && store_content && store_content.apps) {
                            _.each(store_content.apps, function (app) {

                                /* Test that required services are supported */
                                var app_services = app.services ? app.services.split(/\s*,\s*/) : [];
                                app_services = _.map(
                                    app_services,
                                    function (name) {
                                        return services_map[name] || name;
                                    }
                                );

                                var services_supported = true;
                                var missing_services = [];
                                _.each(app_services, function (app_service) {
                                    if (_.indexOf(available_services, app_service) == -1) {
                                        services_supported = false;
                                        missing_services.push(app_service);
                                    }
                                });

                                app.supported = services_supported;
                                app.missing_services = missing_services;

                                if (app.icon == "default" || !app.icon) {
                                    app.icon = "img/" + (app.runtime || app.framework) + ".png";
                                }
                            });
                            s++;
                        }
                        return true;
                    });
                    that.activity.close();
                    that.renderApps(store_resources);
                });

            },

            renderApps: function (store_resources) {
                var template = _.template($(StoreTemplate).filter('#store-apps-template').html().trim(), { polyglot: window.polyglot, store_resources: store_resources });

                $(template)
                    .appendTo($('#store-apps'));

                $('.store-app').equalHeights();

                sconsole.cf_api.spaces.list({}, function (err, spaces) {
                    if (!spaces.data.resources.length) {
                        // disable deploy buttons if there are no spaces to deploy into
                        $('.deploy_app').attr('disabled', true);

                        var template = _.template($(AlertTemplate).filter('#alert-danger').html().trim(), { message: polyglot.t('store.deploy_disabled')});

                        $(template)
                            .appendTo($('.messages'));
                    }
                });
            },

            cloneRepoClicked: function (event) {
                var repo_el = $(event.target).closest('.store-app');
                var repo_src = repo_el.data('repo-src');
                var repo_branch = repo_el.data('repo-branch');
                var repo_name = repo_el.data('app-id');
                if (repo_src) {
                    sconsole.routers.store.showCloneRepoDialog(
                        repo_name,
                        repo_src,
                        repo_branch,
                        function (result) {
                            // do nothing.  this dialog is just informational.
                        },
                        this);
                }

                return false;
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
