/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'moment',
    'jqueryvalidation',
    'jquery-linkify',
    'jquery-toggles',
    'appsecute-api/lib/logger',
    'views/stream/stream',
    'access/access-control',
    'views/lists/route-table',
    'views/lists/app-service-bindings-table',
    'views/lists/typeahead-bar',
    'views/applications/application-files',
    'views/applications/application-env-vars',
    'views/applications/application-log-stream',
    'util/dialog-helper',
    'util/settings',
    'text!views/applications/templates/application-v2.html'],
    function ($, Backbone, _, Polyglot, Moment, Validate, Linkify, Toggles, Logger, StreamView, AccessControl, RouteTable, AppServiceBindingsTable, TypeAheadBar, FileView, EnvVarsView, LogStreamView, DialogHelper, Settings, ApplicationTemplate) {

        return Backbone.View.extend({

            events: {
                'click .breadcrumb-space': 'clickedBreadcrumbSpace',
                'click .save-settings': 'appSettingsClicked',
                'click .start-app': 'startApplicationClicked',
                'click .stop-app': 'stopApplicationClicked',
                'click .restart-app': 'restartApplicationClicked',
                'click .delete-app': 'deleteApplicationClicked',
                'click .btn-launch-app': 'launchApplicationClicked',
                'click .cancel-settings': 'settingsCancelClicked',
                'input #tab_settings input': 'settingsInputChanged',
                'change #tab_settings input': 'settingsInputChanged',
                'click .btn-map-route': 'mapRouteClicked',
                'click .app_description_btn': 'editAppDescriptionClicked',
                'click .app_description_save': 'appDescriptionSaveClicked',
                'click .app_description_cancel': 'appDescriptionCancelClicked',
                'click #refresh-app-instances': 'refreshAppInstancesSlider'
            },

            logger: new Logger('Application'),

            initialize: function () {
                this.options.sub_view = this.options.sub_view || 'summary';
                this.initialized = false;
                this.keep_polling = true;
                this.polling_instances_failed = false;
                this.polling_usage_failed = false;
                this.polling_app_failed = false;
                this.current_cpu_thresholds = [];
                this.current_autoscaling_app_instances = [];
                this.current_app_instances = "";
                this.getApplication();
            },

            render: function () {

                var self = this,
                    template = _.template($(ApplicationTemplate).filter('#application-template').html().trim(), {app: this.app.entity});

                $(template)
                    .appendTo(this.el);

                this.renderStreamView();
                this.renderAppState(this.app.entity.state);
                this.renderAbout(this.app);
                this.renderRoutes(this.app.entity.routes);
                this.renderInstances(this.app);
                this.renderServices();
                this.renderApplicationControls(this.app.entity);
                this.renderSettings(this.app);
                this.getInstances(this.app);
                this.getUsage(this.app.metadata.guid);

                this.$('#application_tabs a', this.el).click(function (e) {
                    e.preventDefault();
                    $(this).tab('show');
                    var sub_view = $(e.target).attr('href').substring(5);
                    sconsole.routers.application.navigate('applications/' + self.options.application_guid + '/' + sub_view, {trigger: false});
                });

                this.$('#application_tabs a[href="#tab_files"]').on('show.bs.tab', function (e) {
                    self.closeChildViews.call(self);
                    self.file_view = new FileView({el: $('<div>').appendTo(self.$('#tab_files')), application_guid: self.app.metadata.guid});
                });

                this.$('#application_tabs a[href="#tab_env_vars"]').on('show.bs.tab', function (e) {
                    self.closeChildViews.call(self);
                    self.env_var_view = new EnvVarsView({el: $('<div>').appendTo(self.$('#tab_env_vars')), application_guid: self.app.metadata.guid});
                });

                this.$('#application_tabs a[href="#tab_logs"]').on('show.bs.tab', function (e) {
                    self.closeChildViews.call(self);
                    self.log_view = new LogStreamView({el: $('<div>').appendTo(self.$('#tab_logs')), application_guid: self.app.metadata.guid});
                });

                this.$('#application_tabs a[href="#tab_settings"]').on('show.bs.tab', function (e) {
                    self.renderSettings(self.app);
                });

                this.$('#application_tabs li a[href=#tab_' + this.options.sub_view + ']').click();
            },

            closeChildViews: function () {
                if (this.file_view) {
                    this.file_view.close();
                    this.file_view = null;
                }

                if (this.log_view) {
                    this.log_view.close();
                    this.log_view = null;
                }

                if (this.env_var_view) {
                    this.env_var_view.close();
                    this.env_var_view = null;
                }
            },

            renderStreamView: function () {
                this.stream_view = new StreamView({el: this.$('#tab_timeline'), application_guid: this.options.application_guid});
            },

            renderAppState: function (state) {

                $('.app-state').html('(' + state.toLowerCase() + ')');
            },

            renderAbout: function (app) {

                app.metadata.created_at_pretty = Moment(app.metadata.created_at).fromNow();
                app.metadata.updated_at_pretty = Moment(app.metadata.updated_at).fromNow();

                var self = this;
                var template = _.template($(ApplicationTemplate).filter('#application-about-template').html().trim(), {'app': app, 'product_name': Settings.getSettings().product_name});

                $('#tab_summary .summary-content .about').remove();

                $(template)
                    .appendTo($('#tab_summary .summary-content'));

                this.$('.app_created_at').tooltip({title: Moment(app.metadata.created_at).format('LLLL')});
                this.$('.app_updated_at').tooltip({title: Moment(app.metadata.updated_at).format('LLLL')});

                this.updateAbout(app);
            },

            updateAbout: function (app) {

                var created_at_pretty = Moment(app.metadata.created_at).fromNow(),
                    updated_at_pretty = Moment(app.metadata.updated_at).fromNow();

                this.$('.app_buildpack').html(app.entity.detected_buildpack || polyglot.t('application.about.buildpack_none'));
                this.$('.app_created_at').html(created_at_pretty);
                this.$('.app_updated_at').html(updated_at_pretty);

                if (app.entity.description) {
                    this.renderAppDescription(app.entity.description);
                } else {
                    this.$('.app_description_plain')
                        .text(polyglot.t('application.about.description.placeholder'))
                        .addClass('text-muted');
                    if (this.$('.app_description_edit').is(':hidden')) {
                        this.$('.placeholder_btn').show();
                    }
                }

                if (app.entity.sso_enabled) {
                    this.$('.app_sso_disabled').hide();
                    this.$('.app_sso_enabled').show();
                    this.$('.app_sso_enabled').tooltip({title: polyglot.t('application.about.sso.enabled.title')});
                } else {
                    this.$('.app_sso_enabled').hide();
                    this.$('.app_sso_disabled').show();
                    this.$('.app_sso_disabled').tooltip({title: polyglot.t('application.about.sso.disabled.title')});
                }

                this.$('.app_created_at').tooltip({title: Moment(app.metadata.created_at).format('LLLL')});
                this.$('.app_updated_at').tooltip({title: Moment(app.metadata.updated_at).format('LLLL')});
            },

            renderAppDescription: function (description) {
                // hide both buttons.  we'll show just the one we want.
                this.$('.app_description_btn').hide();

                if (description) {
                    var nodes = this.$('.app_description_plain')
                        .text(description);

                    // Support line breaks
                    nodes
                        .html(nodes.html().replace(/\r?\n/g, '<br />'));
                    try {
                        nodes.linkify({target: "_blank"});
                    } catch (e) {
                        // linkify fails on phantomjs, and possibly older webkit
                        // ignore the error, since we still end up with nodes.
                    }
                    nodes.removeClass('text-muted')
                        .find('*')
                        .addBack()
                        .contents()
                        .filter(function () { return this.nodeType === 3; })
                        .each(function () {
                            // Add zero-width space to allow long URLs to wrap
                            this.nodeValue = this.nodeValue.replace(/\b/g, "\u200b");
                        });
                    if (this.$('.app_description_edit').is(':hidden')) {
                        this.$('.edit_btn').show();
                        this.$('.placeholder_btn').hide();
                    }
                } else {
                    if (this.$('.app_description_edit').is(':hidden')) {
                        this.$('.edit_btn').hide();
                        this.$('.placeholder_btn').show();
                    }
                    this.$('.app_description_plain')
                        .text(polyglot.t('application.about.description.placeholder'))
                        .addClass('text-muted');
                }
            },

            editAppDescriptionClicked: function () {

                this.$('.app_description_plain').hide();
                this.$('.app_description_btn').hide();
                this.$('.app_description_edit').show();
                this.$('.app_description_text')
                    .text(this.app.entity.description)
                    .select();

                this.$('#app_description_edit_form').validate({
                    debug: true,
                    rules: {
                        app_description_text: {
                            maxlength: 2048
                        }
                    }
                });

            },

            appDescriptionSaveClicked: function (e) {

                var self = this,
                    old_description = this.app.description,
                    new_description = this.$('.app_description_text').val();

                if (!this.$('#app_description_edit_form').valid()) {
                    return;
                }

                this.renderAppDescription(new_description);

                sconsole.cf_api.apps.update(
                    this.options.application_guid,
                    {description: new_description},
                    {},
                    function (err, app) {
                        if (err) {return self.renderAppDescription(old_description);}
                        self.$('.app_description_edit').hide();
                        self.$('.app_description_plain').show();
                        if (new_description) {
                            self.$('.app_description_btn.edit_btn').show();
                        } else {
                            self.$('.app_description_btn.placeholder_btn').show();
                        }
                        self.getApplication();
                    }
                );
                e.preventDefault();
                document.documentElement.focus();
            },

            appDescriptionCancelClicked: function () {
                this.$('.app_description_plain').show();
                if (this.app.entity.description) {
                    self.$('.app_description_btn.edit_btn').show();
                } else {
                    self.$('.app_description_btn.placeholder_btn').show();
                }
                this.$('.app_description_edit').hide();
                this.$('.app_description_text').val(this.app.entity.description);
                this.$('.app_description_text')
                    .text(this.app.entity.description);
            },

            renderInstances: function(app) {
                if (app.entity.autoscale_enabled) {
                    this.$('#autoscaling-controls').removeClass('hide');
                    this.$('#non-autoscaling-controls').addClass('hide');
                } else {
                    this.$('#non-autoscaling-controls').removeClass('hide');
                    this.$('#autoscaling-controls').addClass('hide');
                }

                this.$('#autoscaling-status').toggles({
                    checkbox: $('#autoscaling-status-checkbox'),
                    on: app.entity.autoscale_enabled
                }).on('toggle', _.bind(this.autoscalingToggleClicked, this));
                this.renderSliders(app);
            },

            autoscalingToggleClicked: function(e, active) {
                var self = this;
                sconsole.cf_api.apps.update(this.options.application_guid, {autoscale_enabled: active}, function (err, res) {
                    if (err) {
                        $(e.target).trigger(active ? 'toggleOff' : 'toggleOn');
                    }
                    else {
                        if (active) {
                            self.$('#autoscaling-controls').removeClass('hide');
                            self.$('#non-autoscaling-controls').addClass('hide');
                        } else {
                            self.$('#non-autoscaling-controls').removeClass('hide');
                            self.$('#autoscaling-controls').addClass('hide');
                            self.$('#refresh-app-instances').click();
                        }
                    }
                });
            },

            renderRoutes: function () {

                this.$('.route-table-view').remove();

                this.route_list = new RouteTable({
                    el: $('<div class="route-table-view">').appendTo(this.$('.routes-table')),
                    context: this,
                    paging_style: 'replace',
                    collection: sconsole.cf_api.apps.routes(this.options.application_guid),
                    resource_clicked: this.routeClicked,
                    click_handlers: {
                        unmapRouteClicked: this.unmapRouteClicked
                    },
                    makeNoResourceMessageEl: function () {
                        return $('<div>', {'class': 'route text-muted', html: polyglot.t('application.routes_none')});
                    }
                });

                var self = this;
                AccessControl.isAllowed(
                    this.options.application_guid,
                    AccessControl.resources.application,
                    AccessControl.actions.update,
                    function () {
                        self.$('.btn-map-route').show();
                    }
                );
            },

            mapRouteClicked: function (e) {

                e.preventDefault();

                sconsole.routers.routes.showMapRouteDialog(
                    this.app,
                    function (result) {
                        if (result && result.mapped) {
                            this.route_list.close();
                            this.renderRoutes();
                        }
                    },
                    this);
            },

            unmapRouteClicked: function (route, e) {

                e.preventDefault();

                sconsole.routers.routes.showUnmapRouteDialog(
                    this.app.metadata.guid,
                    route,
                    function (result) {
                        if (result && result.unmapped) {
                            this.route_list.close();
                            this.renderRoutes();
                        }
                    },
                    this);
            },

            routeClicked: function (route, e) {

                e.preventDefault();

                var url = 'http://' + (route.entity.host ? route.entity.host + '.' : "") + route.entity.domain.entity.name;

                window.open(url, '_blank');
            },

            launchApplicationClicked: function (e) {

                e.preventDefault();

                // get the first route
                var route = this.app.entity.routes[0];
                this.routeClicked(route, e);
            },

            renderServices: function () {
                var that = this;

                this.services_list = new AppServiceBindingsTable({
                    el: $('<div class="services-table-view">').appendTo(this.$('.services-table')),
                    context: this,
                    paging_style: 'replace',
                    disable_search_bar: true, // TODO /v2/service_instances doesn't seem to have picked up the wildcard search functionality
                    collection: sconsole.cf_api.service_bindings,
                    collection_options: {filter: {name: 'app_guid', value: this.app.metadata.guid}, queries: {'inline-relations-depth': 2} },
                    resource_clicked: this.serviceClicked,
                    makeNoResourceMessageEl: function () {
                        return $('<div>', {'class': 'list-group-item text-muted', html: polyglot.t('application.no_service_instances')});
                    }
                });
            },

            renderRestrictedControls: function () {

                var self = this;

                AccessControl.isAllowed(
                    this.options.application_guid,
                    AccessControl.resources.application,
                    AccessControl.actions.update,
                    function () {
                        self.$('.start-app').show();
                        self.$('.stop-app').show();
                        self.$('.restart-app').show();
                        self.$('.btn-save').show();
                        self.$('.btn-cancel').show();
                    },
                    function () {
                        $('.app-settings-form input').attr('disabled', 'disabled');
                    }
                );

                AccessControl.isAllowed(
                    this.options.application_guid,
                    AccessControl.resources.application,
                    AccessControl.actions.delete,
                    function () {
                        self.$('.delete-app').show();
                    }
                );
            },

            renderApplicationControls: function (application) {

                var action_template;

                if ( (application.package_state == "PENDING" && application.staging_task_id) || (application.package_state == "FAILED") ) {
                    // only show a delete button when app package is pending
                    action_template = _.template($(ApplicationTemplate).filter('#app-staging-actions-template').html().trim(), {});
                }
                else {
                    // display action buttons if state is started or stopped
                    if (application.state === "STOPPED") {
                        action_template = _.template($(ApplicationTemplate).filter('#app-start-delete-actions-template').html().trim(), {});
                    }
                    else {
                        action_template = _.template($(ApplicationTemplate).filter('#app-stop-restart-actions-template').html().trim(), {});
                    }
                }

                $('.app-buttons').replaceWith($(action_template));

                this.renderRestrictedControls();
            },

            renderSettings: function (app) {

                var template =
                    _.template($(ApplicationTemplate).filter('#application-settings-template').html().trim(), {'app': app, 'product_name': Settings.getSettings().product_name });

                $('#tab_settings', this.el)
                    .empty()
                    .append($(template));

                this.$('#input-single-signon').parent().tooltip();

                this.application_zone_type_ahead = new TypeAheadBar({
                    el: this.$('#input-distribution-zone'),
                    collection: sconsole.cf_api.zones,
                    search_property: 'name',
                    placeholder: app.entity.distribution_zone || 'Application Zone'});

                var that = this;
                this.application_zone_type_ahead.on('resource_selected', function (resource) {
                    that.settingsInputChanged();
                    if (resource) {
                        self.$('#input-distribution-zone').removeClass('has-error');
                    }
                });

                this.$('.app-settings-form').validate({
                    rules: {
                        instances: {
                            required: true,
                            positiveInt: true
                        },
                        disk: {
                            required: true,
                            positiveInt: true
                        },
                        mem: {
                            required: true,
                            positiveInt: true
                        }
                    },
                    messages: {
                        instances: {
                            required: polyglot.t('application.settings.num_instances_required')
                        },
                        disk: {
                            required: polyglot.t('application.settings.disk_space_required')
                        },
                        mem: {
                            required: polyglot.t('application.settings.memory_required')
                        }
                    }
                });

                this.renderRestrictedControls();
            },

            sliderSlid: function (slider_el, unit_indicator, ui) {
                if (ui.values) {
                    $(".slider-label", slider_el).val(ui.values[ 0 ] + unit_indicator + " - " + ui.values[ 1 ] + unit_indicator);
                }
                else {
                    $(".slider-label", slider_el).val(ui.value + unit_indicator);
                }
            },

            sliderChanged: function (slider_el, update_values, unit_indicator, app, event, ui) {
                var self = this;
                // If the event target has a "_unit_test" attribute, assume that we actually want to trigger the change
                if (event.originalEvent || $(event.target).attr('_unit_test')) {
                    $('.slider-saved', slider_el).hide();
                    $('.slider-saving', slider_el).show();

                    sconsole.cf_api.apps.update(app.metadata.guid, update_values, function (err, res) {
                        $('.slider-saving', slider_el).hide();
                        if (err) {
                            // uh oh! something went wrong, so show the error label...
                            $('.slider-failed', slider_el).show().delay(2000).fadeOut(1000);
                            // ...then reset the slider to it's original values
                            var original_values = $(".slider-container", slider_el).data('current-values');
                            $(".slider-container", slider_el)
                                .slider(Array.isArray(original_values) ? "values" : "value", original_values);
                        }
                        else {
                            // it worked! show the saved label and fade it out slowly
                            $('.slider-saved', slider_el).show().delay(2000).fadeOut(1000);
                            $(".slider-container", slider_el).data('current-values', _.values(update_values));
                        }

                    });
                }
                else {
                    // if the change is scripted, we need to update the text display, since the slide event won't be triggered
                    if (ui.values) {
                        $(".slider-label", slider_el).val(ui.values[ 0 ] + unit_indicator + " - " + ui.values[ 1 ] + unit_indicator);
                    }
                    else {
                        $(".slider-label", slider_el).val(ui.value + unit_indicator);
                    }
                }
            },

            renderSliders: function (app) {
                var self = this;
                var cpu_values = [ app.entity.min_cpu_threshold, app.entity.max_cpu_threshold ];
                $("#slider-cpu-threshold").data('current-values', self.current_cpu_thresholds).slider({
                    range: true,
                    min: 0,
                    max: 100,
                    values: cpu_values,
                    slide: function (event, ui) {
                        self.sliderSlid('#cpu-threshold', "%", ui);
                    },
                    change: function (event, ui) {
                        var update_values = {
                            min_cpu_threshold: ui.values[0],
                            max_cpu_threshold: ui.values[1]
                        };

                        self.sliderChanged('#cpu-threshold', update_values, "%", app, event, ui);
                    }
                });
                $("#cpu-threshold .slider-label").val($("#cpu-threshold .slider-container").slider("values", 0) +
                    "% - " + $("#cpu-threshold .slider-container").slider("values", 1) + "%");

                // get the available memory in this app's org so that we can set an appropriate 'max' on the instances slider
                var org_guid = app.entity.space.entity.organization_guid;
                var quota_definition_guid = app.entity.space.entity.organization.entity.quota_definition_guid;

                sconsole.cf_api.quota_definitions.get(quota_definition_guid, {}, function (err, quota_definition) {
                    var memory_limit = quota_definition.entity.memory_limit;

                    sconsole.cf_api.organizations.getSummary(org_guid, {}, function (err, organization_summary) {
                        var total_memory_usage = 0,
                            total_service_usage = 0;
                        _.each(organization_summary.spaces, function (space_summary) {
                            total_memory_usage += space_summary.mem_dev_total;
                            total_memory_usage += space_summary.mem_prod_total;
                        });

                        var available_space = memory_limit - total_memory_usage;
                        var max_instances = Math.min( app.entity.instances + 10, app.entity.instances + Math.floor(available_space / app.entity.memory));
                        var max_autoscaling_instances = Math.min( app.entity.max_instances + 10, app.entity.instances + Math.floor(available_space / app.entity.memory));

                        var instance_values = [ app.entity.min_instances, app.entity.max_instances ];
                        $("#slider-app-autoscaling-instances").data('current-values', self.current_autoscaling_app_instances).slider({
                            range: true,
                            min: 1,
                            max: max_autoscaling_instances,
                            values: instance_values,
                            slide: function (event, ui) {
                                self.sliderSlid('#app-autoscaling-instances', "", ui);
                            },
                            change: function (event, ui) {
                                var update_values = {
                                    min_instances: ui.values[0],
                                    max_instances: ui.values[1]
                                };
                                self.current_autoscaling_app_instances = [
                                    ui.values[0],
                                    ui.values[1]
                                ]
                                self.sliderChanged('#app-autoscaling-instances', update_values, "", app, event, ui);
                            }
                        });
                        $("#app-autoscaling-instances .slider-label").val($("#app-autoscaling-instances .slider-container").slider("values", 0) +
                            " - " + $("#app-autoscaling-instances .slider-container").slider("values", 1));

                        // slider for non-autoscaling instances
                        $("#slider-app-instances").data('current-values', self.current_app_instances).slider({
                            range: false,
                            min: 1,
                            max: max_instances,
                            value: self.current_app_instances,
                            slide: function (event, ui) {
                                self.sliderSlid('#app-instances', "", ui);
                            },
                            change: function (event, ui) {
                                var update_values = {
                                    instances: ui.value,
                                    min_instances: ui.value,
                                    max_instances: Math.max(ui.value + 1, self.current_autoscaling_app_instances[1])
                                };
                                self.sliderChanged('#app-instances', update_values, "", app, event, ui);

                                // set the minimum number of app instances to the new instance value
                                // and the maximum to larger of the new instance value + 1, and the current max_instances value 
                                self.current_autoscaling_app_instances = [
                                    ui.value,
                                    Math.max(ui.value + 1, self.current_autoscaling_app_instances[1])  
                                ]

                                // refresh the autoscaling slider to reflect the new values
                                self.refreshAppAutoscalingInstancesSlider();
                            }
                        });
                        $("#app-instances .slider-label").val($("#app-instances .slider-container").slider("value"));

                    });
                });
            },

            refreshAppInstancesSlider: function (e) {
                e.preventDefault();
                $(e.target).blur();
                $("#slider-app-instances").data('current-value', self.current_app_instances).slider("value", this.current_app_instances);
            },

            refreshAppAutoscalingInstancesSlider: function () {
                $("#slider-app-autoscaling-instances").data('current-values', this.current_autoscaling_app_instances).slider("values", this.current_autoscaling_app_instances);
            },

            getInstances: function (app) {

                var self = this;

                if (app.entity.state === "STARTED" || app.entity.package_state == "PENDING") {
                    sconsole.cf_api.apps.getInstances(this.app.metadata.guid, {global: false}, function (err, instances) {

                        // Clear instance counts and alerts
                        $('#tab_instances .alert').remove();
                        $('#tab_instances tbody tr').remove();

                        // If the file view is open and there was an error or no instances are up then render an alert
                        if (self.file_view) {
                            if (err || Object.keys(instances).length === 0) {
                                self.file_view.showNoInstances();
                            } else {
                                if (self.file_view.no_instances) {
                                    self.file_view.getInstances();
                                }
                            }
                        }

                        // Do our own error handling (global:false above)
                        if (err) {
                            switch (err.status_code) {
                                // 400 indicates the app has failed staging
                                case 400:
                                    $('<div>', {'class': 'alert alert-danger', html: _.escape(instances.body.description)})
                                        .appendTo(self.$('#tab_instances'));
                                    self.$('.app_status').html($('<span>', {'class': 'label label-danger break-words', html: polyglot.t('application.about.status.staging_failed')}));
                                    break;

                                // 404 will be dealt with in the other polling calls
                                case 404:
                                    break;

                                // Other errors e.g. 500 etc. may indicate a problem talking to the CC
                                default:
                                    self.polling_instances_failed = true;
                                    self.showError();
                            }
                            return;
                        }

                        // No errors, render instances...
                        self.polling_instances_failed = false;
                        self.hideError();

                        if (Object.keys(instances).length) {
                            self.$('.no_instances').hide();

                            var i = 0,
                                is_flapping = false;
                            _.each(instances, function (instance) {
                                var since = Moment.unix(instance.since);
                                instance.since = since.format('YYYY-MM-DD HH:mm:ss');
                                if (instance.state == "FLAPPING") {
                                    is_flapping = true;
                                }

                                $('<tr>', {'class': 'instance', html: "<td>" + polyglot.t('application.instances.instance_num') + i + "</td><td>"
                                    + instance.state + " (" + polyglot.t('application.instances.since') + " " + instance.since + ")</td><td>" + instance.host_ip + "</td>"})
                                    .appendTo(self.$('#tab_instances table tbody'));
                                i++;
                            });

                            if (is_flapping) {
                                self.$('.app_status').html($('<span>', {'class': 'label label-warning', html: polyglot.t('application.about.status.flapping')}));
                            }
                            else {
                                if (app.entity.package_state == "PENDING") {
                                    self.$('.app_status').html($('<span>', {'class': 'label label-info', html: polyglot.t('application.about.status.staging')}));
                                }
                                else {
                                    self.$('.app_status').html($('<span>', {'class': 'label label-success', html: polyglot.t('application.about.status.online')}));
                                }
                            }

                        } else {
                            if (app.entity.package_state == "PENDING") {
                                self.$('.app_status').html($('<span>', {'class': 'label label-info', html: polyglot.t('application.about.status.staging')}));
                            }
                            else {
                                self.$('.no_instances').show();
                                self.$('.app_status').html($('<span>', {'class': 'label label-warning', html: polyglot.t('application.about.status.down')}));
                                $('<div>', {'class': 'alert alert-info', html: polyglot.t('application.instances.no_instances')})
                                    .appendTo(self.$('#tab_instances'));
                            }
                        }
                    });
                } else {

                    if (self.file_view) {
                        self.file_view.showNoInstances();
                    }

                    $('#tab_instances .alert').remove();
                    $('#tab_instances tbody tr').remove();

                    self.$('.app_status').html($('<span>', {'class': 'label label-default', html: polyglot.t('application.about.status.offline')}));

                    $('<div>', {'class': 'alert alert-info', html: polyglot.t('application.instances.no_instances')})
                        .appendTo(self.$('#tab_instances'));
                }
            },

            getUsage: function (app_guid) {

                var self = this;
                sconsole.cf_api.apps.getUsage(app_guid, {global: false}, function (err, usage) {

                    if (err && err.status_code !== 404) {
                        self.polling_usage_failed = true;
                        return self.showError();
                    }
                    else {
                        self.polling_usage_failed = false;
                        self.hideError();
                    }

                    $('.usage-panel .panel-body .alert').remove();
                    $('.usage-panel .panel-body .usage-bar').remove();

                    if (err) {
                        $('<div>', {'class': 'alert alert-warning', html: _.escape(err)})
                            .appendTo(self.$('.usage-panel .panel-body'));
                        return;
                    }

                    var template = _.template($(ApplicationTemplate).filter('#application-usage-template').html().trim(), {'usage': usage.usage, 'allocated': usage.allocated});

                    $(template)
                        .appendTo($('.usage-panel .panel-body', this.el));
                });
            },

            getApplication: function () {

                var self = this;
                sconsole.cf_api.apps.get(this.options.application_guid, {'queries': { 'inline-relations-depth': 2, 'include-relations': 'routes,domain,service_bindings,service_instance,space,organization' }, global: false}, function (err, app) {
                    if (err) {

                        if (err.status_code === 404) {
                            self.$('div').remove();

                            var template = _.template($(ApplicationTemplate).filter('#application-404').html().trim(), {});
                            $(template)
                                .appendTo(self.el);

                            self.options.activity.close();
                        }
                        else {
                            self.polling_application_failed = true;
                            self.showError();
                        }
                    }
                    else {
                        self.polling_application_failed = false;
                        self.current_cpu_thresholds = [app.entity.min_cpu_threshold, app.entity.max_cpu_threshold];
                        self.current_autoscaling_app_instances = [app.entity.min_instances, app.entity.max_instances];
                        self.current_app_instances = app.entity.instances;
                        self.hideError();
                        self.app = app;

                        if (self.initialized) {
                            // update elements during polling
                            self.renderAppState(self.app.entity.state);
                            self.updateAbout(self.app);

                            // only update the app controls if the app's state has changed
                            if ( (app.entity.state != self.last_known_state) || (app.entity.package_state != self.last_known_package_state) ) {
                                self.renderApplicationControls(self.app.entity);
                            }

                            self.getInstances(self.app);
                            self.getUsage(self.app.metadata.guid);

                        } else {
                            self.options.activity.close();
                            self.render();
                            self.initialized = true;
                        }

                        if (app.entity.restart_required) {
                            self.$('.restart_required').show();
                        }
                        else {
                            self.$('.restart_required').hide();
                        }

                        if (app.entity.routes.length) {
                            $('.app-buttons .btn-launch-app').show();
                        }
                        else {
                            $('.app-buttons .btn-launch-app').hide();
                        }

                        self.last_known_state = app.entity.state;
                        self.last_known_package_state = app.entity.package_state;

                    }

                    // poll for application changes
                    if (self.keep_polling) {
                        setTimeout(function () {
                            // Polling might have been disabled since the timeout was set
                            if (self.keep_polling) {
                                self.getApplication();
                            }
                        }, 2000);
                    }

                });
            },

            clickedBreadcrumbSpace: function (event) {
                event.preventDefault();
                var guid = $(event.target).data('space-guid');

                sconsole.routers.spaces.showSpace(guid);
            },

            serviceClicked: function (service_instance_binding, e) {
                e.preventDefault();
                sconsole.routers.services.showService(service_instance_binding.entity.service_instance.metadata.guid);
            },

            settingsInputChanged: function () {
                this.$('.settings-buttons .btn').removeAttr('disabled');
            },

            settingsCancelClicked: function () {
                $('#tab_settings', this.el).empty();
                this.renderSettings(this.app);
                this.disableSaveSettingsButtons();
            },

            disableSaveSettingsButtons: function () {
                this.$('.settings-buttons .btn').attr('disabled', 'disabled');
                this.$('.save-settings').removeClass('disabled');
                this.$('.save-settings').html(polyglot.t('save'));
            },

            showDisableSingleSignOnDialog: function (application, settings, callback, context) {
                if (!application.entity.sso_enabled || settings.sso_enabled) {
                    // No need to prompt, call the callback immediately
                    callback.call(context, true);
                    return;
                }
                DialogHelper.showDialog("views/applications/disable-sso-dialog", {app_name: application.entity.name}, callback, context);
            },

            appSettingsClicked: function (event) {
                // remove any alerts
                $('#tab_settings :not(input).error', this.el).remove();

                if (!this.$('.app-settings-form').valid()) {
                    return;
                }
                $('.save-settings').button('loading');

                var application_zone = this.application_zone_type_ahead.getSelectedResource();

                var settings = {
                    instances: parseInt(this.$('#input-instances').val(), 10),
                    memory: parseInt(this.$('#input-memory-allotted').val(), 10),
                    disk_quota: parseInt(this.$('#input-disk-space').val(), 10),
                    sso_enabled: this.$('input[name="input-single-signon"]:checked').val() == "true" ? true : false
                };

                if (application_zone) {
                    settings['distribution_zone'] = application_zone.metadata.guid;
                }

                var self = this;
                this.showDisableSingleSignOnDialog(this.app, settings, function (result) {
                    if (result) {
                        sconsole.cf_api.apps.update(self.app.metadata.guid, settings, {global: false}, function (err, res) {
                            if (err) {
                                var msg = err.message;
                                if (res && "body" in res && "description" in res.body) {
                                    msg = res.body.description;
                                }
                                $('<div>', {'class': 'error alert alert-danger', html: msg})
                                    .prependTo(self.$('#tab_settings form'));

                                $('.save-settings').button('reset');
                            } else {
                                self.disableSaveSettingsButtons();
                            }
                        });
                    } else {
                        self.disableSaveSettingsButtons();
                        self.settingsInputChanged();
                    }
                });
            },

            displayHeaderError: function (message, err) {
                var msg = err.message ? err.message : polyglot.t('unknown_error');
                $('<div>', {'class': 'alert alert-danger', html: _.escape(message + msg)})
                    .appendTo(this.$('.page-header'));
            },

            startApplication: function (done) {
                sconsole.cf_api.apps.update(this.app.metadata.guid, {'state': 'STARTED'}, done);
            },

            startApplicationClicked: function (event) {
                var self = this;
                $('.page-header .alert').remove();

                this.startApplication(function (err) {
                });
            },

            stopApplicationClicked: function (event) {
                var self = this;
                $('.page-header .alert').remove();
                sconsole.routers.application.showChangeApplicationStateDialog(
                    this.app.metadata.guid,
                    'stop',
                    function (result) {
                        if (result && result.stopped) {
                            // reset the instance polling status, since we don't poll for instances on stopped apps
                            self.polling_instances_failed = false;
                        }
                    },
                    this);
            },

            restartApplicationClicked: function () {
                $('.page-header .alert').remove();
                sconsole.routers.application.showChangeApplicationStateDialog(
                    this.app.metadata.guid,
                    'restart',
                    function (result) {
                    },
                    this);
            },

            deleteApplicationClicked: function () {
                $('.page-header .alert').remove();
                var space_guid = this.app.entity.space_guid;

                sconsole.routers.application.showDeleteApplicationDialog(
                    this.app,
                    function (result) {
                        if (result && result.deleted) {
                            this.keep_polling = false;
                            sconsole.routers.spaces.showSpace(space_guid);
                        }
                    },
                    this);
            },

            showError: function () {
                var self = this;
                // TODO: show different errors if the app
                if (self.polling_application_failed || self.polling_usage_failed || self.polling_instances_failed) {
                    if (!$('.app-polling-error').length) {
                        $('<div>', {'class': 'app-polling-error alert alert-warning', html: polyglot.t('application.polling_failed_error')})
                            .prependTo(self.el);
                    }
                }

            },

            hideError: function () {
                var self = this;

                if (!(self.polling_application_failed || self.polling_usage_failed || self.polling_instances_failed)) {
                    $('.app-polling-error').remove();
                }
            },

            close: function () {
                this.keep_polling = false;

                if (this.stream_view) {
                    this.stream_view.close();
                }

                if (this.route_list) {
                    this.route_list.close();
                }
                this.closeChildViews();
                this.remove();
                this.unbind();
            }
        });
    }
);
