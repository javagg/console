/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'jqueryvalidation',
    'backbone',
    'underscore',
    'polyglot',
    'util/gravatar',
    'util/activity-indicator',
    'util/maintenance-mode',
    'util/settings',
    'text!views/settings/templates/settings.html',
    'text!util/templates/alert.html'],
    function ($, Validate, Backbone, _, Polyglot, Gravatar, Activity, MaintenanceMode, Settings, SettingsTemplate, AlertTemplate) {

        return Backbone.View.extend({

            events: {
                "click #settings_tabs li a": "settingTabClicked",
                "click #maintenance_mode": 'maintenanceModeChanged',
                "click #save_system_settings": 'saveSystemSettings',
                "click .app_store_url_enabled": 'toggleAppStoreURL',
                "click .delete_app_store": 'deleteAppStore',
                "click #add_app_store_url": 'addAppStoreURL',
                "click .delete_allowed_repo_url": 'deleteAllowedRepo',
                "click #add_allowed_repo": 'addAllowedRepo'
            },

            initialize: function () {
                this.options.activity.close();
                this.render();
                this.getCloudControllerConfig();
                this.options.sub_view = this.options.sub_view || 'maintenance_mode';
            },

            render: function () {
                var template = _.template($(SettingsTemplate).filter('#settings-template').html().trim(), { polyglot: window.polyglot });

                $(template).appendTo(this.el);
                
                this.$('#settings_tabs li a[href=#tab_' + this.options.sub_view + ']').click();
            },

            settingTabClicked: function(e) {
                e.preventDefault();
                $('this').tab('show');
                var sub_view = $(e.target).attr('href').substring(5);
                sconsole.routers.settings.navigate('settings/' + sub_view, {trigger: false});
            },

            renderCloudControllerConfig: function (cc_config) {
                var cc_maintenance_mode = cc_config.maintenance_mode ? 'checked="checked"' : '';
                var template = _.template(
                    $(SettingsTemplate).filter('#settings-maintenance-mode-config').html().trim(), {
                        polyglot: window.polyglot,
                        maintenance_mode: cc_maintenance_mode,
                        logging_level: cc_config.logging.level,
                        support_email: cc_config.info.support_address,
                        settings: Settings.getSettings()
                    });

                $(template).appendTo(this.$('#tab_maintenance_mode'));

                var system_template = _.template(
                    $(SettingsTemplate).filter('#settings-system-config').html().trim(), {
                        polyglot: window.polyglot,
                        logging_level: cc_config.logging.level,
                        support_email: cc_config.info.support_address,
                        settings: Settings.getSettings()
                    });

                $(system_template).appendTo(this.$('#tab_system'));

                // Select the current logging level
                this.$('#logging_level').find("option").filter(function () {
                    return $(this).text() === cc_config.logging.level;
                }).prop('selected', true);

                // Monitor the form for changes, and enable the submit button when the form is dirty
                var that = this;
                this.$('#system_settings_form :input').bind("keyup change", function (event) {
                    that.$('#system_settings_form').addClass("dirty");
                    that.$('#save_system_settings').removeClass("disabled").removeClass("btn-default").addClass("btn-primary");
                });

                this.applyCCSettingsValidation();
            },

            applyCCSettingsValidation: function () {
                this.$('#add_app_store_url_form').validate({
                    errorPlacement: function (error, element) {
                        error.appendTo(element.closest('.col-lg-10'));
                    },
                    highlight: function (element, errorClass) {
                        $(element).closest('.form-group').addClass('has-error');
                    },
                    success: function (label, input) {
                        label.closest('.form-group').removeClass('has-error');
                        label.remove();  // no other way to hide it
                    },
                    rules: {
                        support_email: {
                            required: true,
                            email: true
                        }
                    }
                });
            },

            renderAppStoresConfig: function (app_stores_response) {
                var template = _.template(
                    $(SettingsTemplate).filter('#settings-app-stores').html().trim(), {
                        polyglot: window.polyglot,
                        app_stores_response: app_stores_response
                    }
                );

                this.$('#tab_app_store_urls').empty();
                $(template).appendTo(this.$('#tab_app_store_urls'));

                this.applyAppStoreValidation();
            },

            applyAppStoreValidation: function () {
                this.$('#add_app_store_url_form').validate({
                    errorPlacement: function (error, element) {
                        error.appendTo(element.closest('form'));
                    },
                    highlight: function (element, errorClass) {
                        $(element).closest('.form').addClass('has-error');
                    },
                    success: function (label, input) {
                        label.closest('.form').removeClass('has-error');
                        label.remove();  // no other way to hide it
                    },
                    rules: {
                        new_app_store_name: {
                            minlength: 2
                        },
                        new_app_store_content_url: {
                            url: true
                        }
                    }
                });
            },

            renderAllowedRepos: function (cc_config) {
                var template = _.template($(SettingsTemplate).filter('#settings-allowed-repos').html().trim(), {
                    allowed_repos: cc_config.allowed_repos
                });

                this.$('#allowed_repos').empty();
                $(template).appendTo(this.$('#tab_allowed_repos'));

                this.$('#allowed_repos_help').popover({placement: 'right'});
            },

            getCloudControllerConfig: function () {

                var self = this,
                    cc_config_activity = new Activity(this.$('.cloud_controller_config')),
                    app_store_urls_activity = new Activity(this.$('.app_store_urls')),
                    allowed_repos_activity = new Activity(this.$('.allowed_repos'));

                sconsole.cf_api.config.getCloudControllerConfig({}, function (err, cc_config) {
                    cc_config_activity.close();
                    allowed_repos_activity.close();

                    if (!err) {
                        self.renderCloudControllerConfig(cc_config);
                        self.renderAllowedRepos(cc_config);
                    }
                });

                sconsole.cf_api.app_stores.list({}, function (err, app_stores_page) {
                    app_store_urls_activity.close();
                    if (!err) {
                        self.renderAppStoresConfig(app_stores_page.data);
                    }
                });
            },

            maintenanceModeChanged: function (event) {

                var maintenance_mode = $('#maintenance_mode').is(':checked');

                // get the new value for maintenance mode and set it
                sconsole.cf_api.config.updateCloudControllerConfigValue(
                    'maintenance_mode',
                    maintenance_mode,
                    {},
                    function (err) {
                        // reset on error
                        if (err) {return maintenance_mode ? MaintenanceMode.off() : MaintenanceMode.on()}

                        if (maintenance_mode) {
                            MaintenanceMode.on();
                        }
                        else {
                            MaintenanceMode.off();
                        }
                    }
                );
            },

            saveLogLevelSetting: function (done) {

                var logging_level = $('#logging_level').val();

                sconsole.cf_api.config.updateCloudControllerConfigValue(
                    'logging',
                    {level: logging_level},
                    {},
                    done
                );
            },

            saveSupportAddressSetting: function (done) {

                var support_email = $('#support_email').val();

                sconsole.cf_api.config.updateCloudControllerConfigValue(
                    'info',
                    {support_address: support_email},
                    {},
                    done
                );
            },

            saveKeysSetting: function (cc_keys, done) {

                if (!cc_keys) {
                    return setTimeout(function () {done(null);}, 1);
                }

                sconsole.cf_api.config.updateCloudControllerConfigValue(
                    'keys',
                    cc_keys,
                    {},
                    done
                );
            },

            resetSaveSettingsButton: function () {
                var submit_button = this.$('#save_system_settings');
                submit_button.button('reset');
                submit_button.addClass('disabled');
                submit_button.addClass('btn-default');
                submit_button.removeClass('btn-primary');
            },

            showSystemSettingErrorMessage: function (errorMessage) {
                this.resetSaveSettingsButton();
                if (!errorMessage || !errorMessage.description) {
                    return;
                }
                this.$('.system-settings-error').text(errorMessage.description).closest('.form-group').removeClass('hide');
            },

            hideSystemSettingErrorMessage: function () {
                this.$('.system-settings-error').text('').closest('.form-group').addClass('hide');
            },

            saveSystemSettings: function (event) {

                var that = this,
                    submit_button = $(event.target).closest('button');

                this.hideSystemSettingErrorMessage();

                that.saveLogLevelSetting(
                    function (err) {
                        if (err) {
                            that.resetSaveSettingsButton();
                            return that.showSystemSettingErrorMessage(err.message);
                        }

                        that.saveSupportAddressSetting(
                            function (err) {
                                if (err) {that.showSystemSettingErrorMessage(err.message);}
                                that.resetSaveSettingsButton();
                            }
                        );
                    }
                );
            },

            toggleAppStoreURL: function (event) {

                var checkboxElement = $(event.target),
                    status = checkboxElement.is(':checked'),
                    appStoreName = checkboxElement.data('app-store-name');

                sconsole.cf_api.app_stores.update(
                    appStoreName,
                    {enabled: status},
                    function (err, app_store) {
                        if (err) {
                            // Show an error if the enabled flag cannot be changed -- revert the checked state.
                            checkboxElement.prop('checked', !status);  
                        }
                    }
                );
            },

            deleteAppStore: function (event) {

                // get the data-url value from the button
                var deleteButtonElement = $(event.target).closest('button'),
                    row_to_delete = $(event.target).closest('tr'),
                    app_store_name = deleteButtonElement.data('name');

                deleteButtonElement.button('loading');

                sconsole.cf_api.app_stores.delete_(
                    app_store_name,
                    {},
                    function (err) {
                        deleteButtonElement.button('reset');
                        if (!err) {
                            $(row_to_delete).remove();
                        }
                    });
            },

            addAppStoreURL: function (event) {

                // get the data-url value from the button
                var self = this,
                    addButtonElement = $(event.target).closest('button'),
                    new_name = $('#new_app_store_name').val(),
                    new_content_url = $('#new_app_store_content_url').val(),
                    new_enabled = $('#new_app_store_enabled').is(':checked');

                if ($('#add_app_store_url_form').valid()) {

                // get the list of URLs fresh from the server to reduce chance of overwriting values
                if (new_name && new_content_url) {
                    addButtonElement.button('loading');

                    sconsole.cf_api.app_stores.create(
                        {
                            name: new_name,
                            content_url: new_content_url,
                            enabled: new_enabled
                        },
                        {},
                        function (err, app_store) {
                            if (err) {return addButtonElement.button('reset');}

                            // Get all app stores and re-render display
                            sconsole.cf_api.app_stores.list({}, function (err, app_stores_page) {
                                addButtonElement.button('reset');
                                if (!err) {
                                    self.renderAppStoresConfig(app_stores_page.data);
                                }
                            });
                        });
                }
                }
            },

            deleteAllowedRepo: function (event) {

                // get the data-url value from the button
                var self = this,
                    repo_to_delete = $(event.target).closest('button').data('repo');

                // get the list of repos fresh from the server to reduce chance of overwriting values
                sconsole.cf_api.config.getCloudControllerConfig({}, function (err, cc_config) {
                    if (err) {return;}

                    // remove the deleted store from the list and set it as the config for app_store.stores
                    var allowed_repos = _.reject(cc_config.allowed_repos, function (repo) { return repo === repo_to_delete; });

                    sconsole.cf_api.config.updateCloudControllerConfigValue(
                        'allowed_repos',
                        allowed_repos,
                        {},
                        function (err) {
                            if (err) {return;}
                            self.renderAllowedRepos({allowed_repos: allowed_repos});
                        });
                });
            },

            addAllowedRepo: function (event) {

                var self = this,
                    addRepoButton = $(event.target).closest('button'),
                    repo_to_add = $('#new_allowed_repo').val();

                addRepoButton.button('loading');

                // get the list of repos fresh from the server to reduce chance of overwriting values
                if (repo_to_add) {

                    sconsole.cf_api.config.getCloudControllerConfig({}, function (err, cc_config) {
                        if (err) {return addRepoButton.button('reset');}

                        var allowed_repos = cc_config.allowed_repos || [];

                        // if the store hasn't already been added, add it
                        if (!_.find(allowed_repos, function (repo) { return repo === repo_to_add; })) {
                            allowed_repos.push(repo_to_add);

                            sconsole.cf_api.config.updateCloudControllerConfigValue(
                                'allowed_repos',
                                allowed_repos,
                                {},
                                function (err) {
                                    addRepoButton.button('reset');
                                    if (err) {return;}
                                    self.renderAllowedRepos({allowed_repos: allowed_repos});
                                });
                        }
                    });
                }
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
