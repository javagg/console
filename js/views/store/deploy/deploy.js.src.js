/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'jqueryvalidation',
    'bootstrap-select',
    'access/admin-access',
    'appsecute-api/lib/logger',
    'util/gravatar',
    'util/activity-indicator',
    'views/lists/typeahead-bar',
    'util/random-id',
    'text!views/store/deploy/templates/deploy.html'],
    function ($, Backbone, _, Polyglot, Validation, BootstrapSelect, AdminAccess, Logger, Gravatar, Activity, TypeAheadBar, RandomId, DeployTemplate) {

        return Backbone.View.extend({

            events: {
                "click #deploy-app-btn": "deployButtonClicked",
                "change #select-space": "selectedSpaceChanged"
            },

            logger: new Logger('AppStoreDeploy'),

            initialize: function () {
                $.validator.addMethod("pattern", function(value, elem, param) {
                    return this.optional(elem) || param.test(value);
                });
                this.options.activity.close();
                this.render();
                this.getAppDetails();
                this.deployComplete = false;
            },

            render: function () {
                var template = _.template($(DeployTemplate).filter('#deploy-template').html().trim(), { polyglot: window.polyglot, store_id: this.options.store_id, app_id: this.options.app_id });

                $(template)
                    .appendTo(this.el);
            },

            getAppDetails: function () {

                var self = this,
                    activity = new Activity(this.$('#store-apps'));

                sconsole.cf_api.app_stores.get(
                    this.options.store_id,
                    {queries: {'inline-relations-depth': 1}},
                    function (err, app_store) {
                        if (err) {return;}

                        sconsole.cf_api.spaces.list(
                            {queries: {'inline-relations-depth': 1}},
                            function (err, spaces) {
                                activity.close();
                                if (err) {return;}

                                var store = app_store.entity.content.store,
                                    apps = app_store.entity.content.apps,
                                    app = apps[self.options.app_id],
                                    space_resources = spaces.data.resources;

                                var user_accessible_spaces = sconsole.user.summary.entity.spaces.concat(sconsole.user.summary.entity.managed_spaces);
                                var user_accessible_space_guids = _.pluck(_.pluck(user_accessible_spaces, 'metadata'), 'guid');

                                // only list spaces with mapped domains
                                space_resources = _.filter(space_resources, function (space) {
                                    // Reject spaces without domains first
                                    if (space.entity.domains.length === 0) {
                                        return false;
                                    }

                                    // Admins can deploy to any space with a domain
                                    if (AdminAccess.isAdmin()) {
                                        return true;
                                    }

                                    // Everyone else can deploy only to spaces they have access to as a dev or manager
                                    return _.contains(user_accessible_space_guids, space.metadata.guid);
                                });

                                if (app.icon === "default" || !app.icon) {
                                    app.icon = "img/" + (app.runtime || app.framework) + ".png";
                                }

                                var random_app_id = app.id + '-' + RandomId.make_random_id(5);

                                self.renderAppDetails(store, app, random_app_id, space_resources);
                            }
                        );
                    });
            },

            applyFormValidation: function () {

                var self = this;

                $('#app-deploy-form').validate({
                    rules: {
                        name: {
                            required: true,
                            pattern: /^[A-Za-z0-9_-]+$/
                        },
                        space: {
                            required: true
                        }
                    },
                    messages: {
                        name: {
                            required: polyglot.t('store.deploy.warn_name_required'),
                            pattern: polyglot.t('store.deploy.warn_name_invalid')
                        },
                        space: {
                            required: polyglot.t('store.deploy.warn_space_required')
                        }
                    }
                });
            },

            renderAppDetails: function (store, app, random_app_id, space_resources) {
                var template = _.template($(DeployTemplate).filter('#app-details-template').html().trim(), { polyglot: window.polyglot, store: store, random_app_id: random_app_id, app: app, space_resources: space_resources });

                $('#section-title').append(' ' + app.name);

                $(template).appendTo($('#deploy-app'));

                this.deploy_app_zone_type_ahead = new TypeAheadBar({
                    el: this.$('#input-placement-zone'),
                    collection: sconsole.cf_api.zones,
                    search_property: 'name',
                    placeholder: polyglot.t('store.app_placement_zone')});

                var that = this;
                this.deploy_app_zone_type_ahead.on('resource_selected', function (resource) {
                    if (resource) {
                        that.$('#input-placement-zone').removeClass('has-error');
                    }
                });

                this.applyFormValidation();

                var populate_domains = true;

                if (!space_resources || space_resources.length === 0) {
                    $('.deploy-app-form, .deploy-app-details').addClass('hide');
                    $('.no-spaces-available').removeClass('hide');
                } else {
                    _.each(space_resources, function (space_resource) {
                        var space_option_template = _.template($(DeployTemplate).filter('#select-space-options-template').html().trim(), { polyglot: window.polyglot, space_resource: space_resource });

                        $(space_option_template)
                            .data("space", space_resource)
                            .appendTo($('#select-space'));

                        if (populate_domains) {
                            $('#select-domain', that.el).selectpicker();
                            that.populateDomainSelect(space_resource.entity.domains);
                            populate_domains = false;
                        }
                    });
                }

                $('#select-space', this.el).selectpicker();
            },

            selectedSpaceChanged: function (event) {
                var selected_index = $(event.target).context.selectedIndex;
                var selected_space = $("#select-space option")[selected_index];

                var available_domains = $(selected_space).data("space").entity.domains;

                this.populateDomainSelect(available_domains);
            },

            populateDomainSelect: function (available_domains) {
                $('#select-domain').empty();

                _.each(available_domains, function (domain_resource) {
                    var domain_option_template = _.template($(DeployTemplate).filter('#select-domain-options-template').html().trim(), { polyglot: window.polyglot, domain_resource: domain_resource });

                    $(domain_option_template)
                        .data("domain", domain_resource)
                        .appendTo($('#select-domain'));
                });

                $('#select-domain', this.el).selectpicker('refresh');
            },

            deployButtonClicked: function (event) {

                event.preventDefault();

                if (!$('#app-deploy-form').valid()) {
                    return;
                }

                this.$('.error').remove();

                var self = this,
                    form = this.$('.deploy-app-form'),
                    app_name = $('#input-name', form).val(),
                    space_guid = $('#select-space', form).val(),
                    autostart = $('#input-autostart', form).is(':checked'),
                    src = form.data('app-src'),
                    commit = form.data('app-commit'),
                    app_display_name = form.data('app-display-name'),
                    url = app_name + "." + $('#select-domain', form).val(),
                    application_zone = this.deploy_app_zone_type_ahead.getSelectedResource();

                this.$('#deploy-app-btn').button('loading');

                var app_create_details = {
                    app_name: app_name,
                    space_guid: space_guid
                };

                if (application_zone) {
                    app_create_details['zone'] = application_zone.metadata.guid;
                }

                sconsole.cf_api.app_store.create(
                    app_create_details,
                    {global: true},
                    function (err, app) {
                        if (err) {
                            self.$('#deploy-app-btn').button('reset');
                            $('pre').hide();
                            return;
                        }

                        $('#deploy-app').slideToggle({
                            complete: function () {
                                $('#deploy-log').removeClass('hide');
                                $('#deploy-app').remove();
                            }
                        });

                        var app_guid = app.app_guid;
                        var app_update_details = {
                            app_name: app_name,
                            url: url,
                            space_guid: space_guid,
                            from: src,
                            commit: commit,
                            autostart: autostart
                        };

                        if (app_create_details['zone']) {
                            app_update_details['zone'] = app_create_details['zone'];
                        }

                        // Don't wait for this call to finish
                        sconsole.cf_api.app_store.update(
                            app_guid,
                            app_update_details,
                            {timeout: 60000},
                            function (err, app) {
                                if (err) {self.logger.error(err.message);}
                            }
                        );

                        // Navigate straight to the new apps log view
                        sconsole.routers.application.showApplicationLogs(app_guid);
                    }
                );
            },


            close: function () {
                this.deployComplete = true;
                this.remove();
                this.unbind();
            }
        });
    }
);
