/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'access/access-control',
    'util/activity-indicator',
    'appsecute-api/lib/logger',
    'text!views/applications/templates/application-env-var.ejs',
    'text!views/applications/templates/application-env-var-new.ejs',
    'text!views/applications/templates/application-env-vars.ejs'],
    function ($, Backbone, _, AccessControl, Activity, Logger, ApplicationEnvVarTemplate, ApplicationEnvVarNewTemplate, ApplicationEnvVarsTemplate) {

        return Backbone.View.extend({

            events: {
                'click .btn-save': 'saveClicked',
                'click .btn-cancel': 'cancelClicked',
                'click .btn-add': 'addEnvVarClicked',
                'input .value': 'inputChanged'
            },

            logger: new Logger('Application Environment Variables'),

            env_vars_original: null,

            env_vars_working: null,

            initialize: function () {
                this.render();
                this.getApplication();
            },

            render: function () {

                var template = _.template(ApplicationEnvVarsTemplate, { });

                $(template)
                    .appendTo(this.el);
            },

            getApplication: function () {

                var self = this;
                activity = new Activity(this.$('.activity'));

                sconsole.cf_api.apps.get(this.options.application_guid, {}, function (err, app) {
                    if (err) {return console.error(err);}
                    activity.close();
                    self.env_vars_original = app.entity.environment_json;
                    self.env_vars_working = _.clone(self.env_vars_original);
                    self.renderEnvironmentVariables.call(self);
                });
            },

            renderEnvironmentVariables: function () {

                this.$('.env-vars').empty();

                this.toggleNoEnvVarInfo();

                var self = this;
                _.each(this.env_vars_working, function (value, key) {
                    self.renderEnvironmentVariable.call(self, value, key);
                });

                AccessControl.isAllowed(
                    this.options.application_guid,
                    AccessControl.resources.application,
                    AccessControl.actions.update,
                    function () {
                        self.renderNewEnvVarInput();
                        self.$('.btn-delete').show();
                        self.$('.btn-save').show();
                        self.$('.btn-cancel').show();
                    },
                    function () {
                        self.$('.value').attr('disabled', 'disabled');
                    }
                );
            },

            renderEnvironmentVariable: function (value, key) {

                var self = this,
                    template = _.template(ApplicationEnvVarTemplate, {key: key, value: value });

                var var_el = $(template)
                    .appendTo(self.$('.env-vars'));

                $('.btn-show', var_el).click(function () {
                    self.showVarClicked.call(self, var_el);
                });

                $('.btn-hide', var_el).click(function () {
                    self.hideVarClicked.call(self, var_el);
                });

                $('.btn-delete', var_el).click(function () {
                    self.deleteVarClicked.call(self, key, var_el);
                });

                $('.control-label', var_el).tooltip();
            },

            renderNewEnvVarInput: function () {

                var template = _.template(ApplicationEnvVarNewTemplate, {});

                $(template)
                    .appendTo(self.$('.env-vars'));
            },

            toggleNoEnvVarInfo: function () {

                if (Object.keys(this.env_vars_working).length === 0) {
                    this.$('.no-env-vars').show();
                } else {
                    this.$('.no-env-vars').hide();
                }
            },

            inputChanged: function (event) {

                var key = $(event.target).data('key');

                this.env_vars_working[key] = $(event.target).val();

                this.enableSaveButtons();
            },

            showVarClicked: function (var_el) {
                $('input', var_el).attr('type', 'text');
                $('.btn-show', var_el).hide();
                $('.btn-hide', var_el).show();
            },

            hideVarClicked: function (var_el) {
                $('input', var_el).attr('type', 'password');
                $('.btn-hide', var_el).hide();
                $('.btn-show', var_el).show();
            },

            deleteVarClicked: function (key, var_el) {

                $(var_el).remove();

                delete this.env_vars_working[key];

                this.toggleNoEnvVarInfo();
                this.enableSaveButtons();
            },

            enableSaveButtons: function () {
                this.$('.btn-save').removeAttr('disabled');
                this.$('.btn-cancel').removeAttr('disabled');
            },

            disableSaveButtons: function () {
                this.$('.btn-save').attr('disabled', 'disabled');
                this.$('.btn-cancel').attr('disabled', 'disabled');

                // This is a little hack to manually reset the save button (equivalent to .button('reset')).
                // Needs to be done manually as normal reset also removes disabled attr and there is a timing hole.
                this.$('.btn-save').removeClass('disabled');
                this.$('.btn-save').html(polyglot.t('save'));
            },

            addEnvVarClicked: function () {

                var key = this.$('.input-new-key').val(),
                    value = this.$('.input-new-value').val();

                if (!key || !value) {
                    this.$('.input-new-group').addClass('has-error');
                    return;
                } else {
                    this.$('.input-new-group').removeClass('has-error');
                }

                this.env_vars_working[key] = value;
                this.renderEnvironmentVariables();
                this.enableSaveButtons();
            },

            saveClicked: function () {

                this.$('.btn-save').button('loading');

                var self = this;
                sconsole.cf_api.apps.update(
                    this.options.application_guid,
                    {environment_json: this.env_vars_working},
                    {},
                    function (err, app) {
                        if (err) {return self.logger.error(err);}
                        self.env_vars_original = app.entity.environment_json;
                        self.env_vars_working = _.clone(self.env_vars_original);
                        self.disableSaveButtons.call(self);
                    }
                );
            },

            cancelClicked: function () {
                this.disableSaveButtons();
                this.env_vars_working = _.clone(this.env_vars_original);
                this.renderEnvironmentVariables();
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
