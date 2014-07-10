/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'appsecute-api/lib/logger',
    'util/settings',
    'ace',
    'text!views/settings/console/templates/welcome-template-settings.ejs'],
    function ($, Backbone, _, Polyglot, Logger, Settings, Ace, WelcomeSettingsTemplate) {

        return Backbone.View.extend({

            events: {
                'click .btn-save': 'saveClicked',
                'click .btn-cancel': 'cancelClicked',
                'click .btn-load-default': 'loadDefaultClicked'
            },

            logger: new Logger('Welcome Settings'),

            initialize: function () {

                var that = this;

                // Work around bug in ace editor, it seems to tell requirejs it has loaded before it really has
                if (!window.ace) {
                    setTimeout(function () {
                        that.initialize.call(that);
                    }, 100);
                } else {
                    this.render();
                }
            },

            render: function () {

                var that = this,
                    template = _.template(WelcomeSettingsTemplate, { });

                $(template)
                    .appendTo(this.el);

                this.editor = ace.edit("welcome-editor");
                this.editor.getSession().setMode("ace/mode/html");

                this.editor.setValue(Settings.getSetting('welcome_template'));
                this.editor.session.selection.clearSelection();

                this.editor.getSession().on('change', function (e) {
                    that.inputChanged.call(that);
                });
            },

            inputChanged: function () {
                this.$('.btn').removeAttr('disabled');
            },

            loadDefaultClicked: function () {
                this.editor.setValue(Settings.defaults.welcome_template);
                this.editor.session.selection.clearSelection();
                this.inputChanged();
            },

            saveClicked: function () {

                this.$('.btn-save').button('loading');

                var self = this;
                sconsole.cf_api.settings.updateConsoleSetting(
                    'welcome_template',
                    this.editor.getValue(),
                    {},
                    function (err) {
                        if (err) {
                            self.$('.btn-save').button('reset');
                            self.logger.error(res.body);
                            self.cancelClicked();
                        } else {
                            window.location.reload();
                        }
                    });
            },

            cancelClicked: function () {
                if (this.editor) {
                    this.editor.destroy();
                }
                $(this.el).empty();
                this.render();
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);