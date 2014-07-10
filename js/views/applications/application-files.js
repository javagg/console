/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'ace',
    'util/activity-indicator',
    'appsecute-api/lib/logger',
    'text!views/applications/templates/application-file.ejs',
    'text!views/applications/templates/application-files.ejs'],
    function ($, Backbone, _, Ace, Activity, Logger, FileTemplate, ApplicationFilesTemplate) {

        return Backbone.View.extend({

            events: {
                'click .btn-close-file': 'closeFileClicked'
            },

            logger: new Logger('Application Files'),

            plain_text_extensions: [
                'txt', 'log', 'json', 'sh', 'src', 'pl', 'js', 'html', 'css', 'ejs', 'rb', 'md', 'yml',
                'd', 'dart', 'go', 'php', 'py', 'lua', 'tcl', 'sql', 'xml', 'ini'],

            initialize: function () {
                this.render();
                this.getInstances();
            },

            render: function () {

                var template = _.template(ApplicationFilesTemplate, { });

                $(template)
                    .appendTo(this.el);
            },

            showActivity: function () {
                if (!this.activity) {
                    this.activity = new Activity(this.$('.activity'));
                }
            },

            hideActivity: function () {
                if (this.activity) {
                    this.activity.close();
                    this.activity = null;
                }
            },

            getInstances: function () {

                this.showActivity();

                var self = this;
                sconsole.cf_api.apps.getInstances(
                    this.options.application_guid,
                    {global: false},
                    function (err, instances) {
                        self.hideActivity();

                        if (err || instances.length === 0) {
                            self.showNoInstances();
                            return self.logger.error(err.message);
                        }

                        self.hideNoInstances();
                        self.renderInstances(instances);
                    });
            },

            showNoInstances: function () {

                if (!this.no_instances) {
                    this.no_instances = $('<div>', {'class': 'alert alert-info', html: polyglot.t('application.instances.no_instances_files')})
                        .appendTo($(this.el));
                }

                this.hideFileBrowser();
                this.hideFileViewer();
                this.hideControls();
            },

            hideNoInstances: function () {

                if (this.no_instances) {
                    $(this.no_instances).remove();
                    this.no_instances = null;

                    this.showFileBrowser();
                    this.showControls();
                }
            },

            renderInstances: function (instances) {

                this.$('.instances').empty();

                var self = this;
                _.each(instances, function (instance, index) {

                    $('<li>')
                        .append($('<a>', {html: 'Instance #' + index}))
                        .click(function () {
                            self.instanceClicked.call(self, index)
                        })
                        .appendTo(self.$('.instances'));

                    if (index === "0" && instance.state === "RUNNING" || instance.state === "STARTING") {
                        self.instanceClicked.call(self, index);
                    }
                });
            },

            instanceClicked: function (instance_index) {
                this.instance_index = instance_index;
                this.getFiles('/');
            },

            getFiles: function (path, disable_retry) {

                this.showActivity();

                var self = this;
                sconsole.cf_api.apps.getFiles(
                    this.options.application_guid,
                    this.instance_index,
                    path,
                    {global: disable_retry ? true : false},
                    function (err, res) {

                        if (!err || err && disable_retry) {
                            self.hideActivity();
                        }

                        if (err) {
                            // The files api is a little unreliable after the app has just started so we support
                            // a transparent retry
                            if (!disable_retry) {
                                setTimeout(function () {
                                    self.getFiles(path, true);
                                }, 3000);
                            }
                            return self.logger.error(err.message);
                        }

                        self.renderFiles(self.parseFiles(path, res.body), path);
                    });
            },

            parseFiles: function (path, files_text) {

                var files = [],
                    file_pattern = /(\S+)\s+([\d\.]+\w|\-)\r?\n?/g,
                    file_match;

                while ((file_match = file_pattern.exec(files_text)) !== null) {

                    // Ignore files called 'startup' or 'stop' in the root directory
                    if (!((file_match[1] == 'startup' || file_match[1] == 'stop') && path == "/")) {

                        var dir = file_match[2] === '-',
                            file = {
                                name: file_match[1],
                                size: file_match[2],
                                dir: dir
                            };

                        file.clickable = dir || this.isFileViewable(file);
                        files.push(file);
                    }
                }

                return files;
            },

            renderFiles: function (files, path) {

                this.updateParentDirectory(path);
                this.showFileBrowser();

                this.$('.files').empty();

                var self = this;
                _.each(files, function (file) {

                    var template = _.template(FileTemplate, {file: file});

                    $(template)
                        .click(function () {
                            self.fileClicked.call(self, path, file);
                        })
                        .appendTo(self.$('.files'));
                });
            },

            updateParentDirectory: function (current_path) {

                var parent_directory = '/',
                    upper_level = false,
                    current_path_no_trailing_slash = current_path.slice(0, current_path.length - 1);

                if (current_path_no_trailing_slash.length > 0) {
                    upper_level = true;
                    parent_directory = current_path_no_trailing_slash.slice(0, current_path_no_trailing_slash.lastIndexOf('/') + 1);
                }

                this.$('.parent-directory').empty();

                var self = this;
                $('<span>', {'class': 'file-path', html: 'Instance ' + this.instance_index + '#' + current_path})
                    .append(
                        upper_level ?
                            $('<i>', {'class': 'file-path-up glyphicon glyphicon-arrow-up'})
                                .click(function () {
                                    self.getFiles.call(self, parent_directory);
                                }) : '')
                    .appendTo('.parent-directory');
            },

            getFileExtension: function (file_name) {
                return file_name.split('.').pop();
            },

            isFileViewable: function (file) {

                var extension = this.getFileExtension(file.name);
                return this.plain_text_extensions.indexOf(extension) !== -1;
            },

            fileClicked: function (path, file) {

                if (file.dir) {
                    this.getFiles(path + file.name);
                } else {
                    if (this.isFileViewable(file)) {
                        this.getFile(path + file.name);
                    }
                }
            },

            getFile: function (path) {

                this.showActivity();

                var self = this;
                sconsole.cf_api.apps.getFiles(
                    this.options.application_guid,
                    this.instance_index,
                    path,
                    function (err, res) {
                        if (err) {
                            return self.logger.error(err);
                        }

                        self.hideActivity();
                        self.renderFile(path, res.body);
                    });
            },

            getAceEditorModeForExtension: function (extension) {

                switch (extension) {
                    case 'js':
                        return 'javascript';

                    case 'pl':
                        return 'perl';

                    default:
                        return extension;
                }
            },

            hideControls: function () {
                this.$('.file-view-controls').hide();
            },

            showControls: function () {
                this.$('.file-view-controls').show();
            },

            hideFileBrowser: function () {
                this.$('.files').hide();
            },

            hideFileViewer: function () {
                this.$('.file-viewer-wrapper').hide();
                if (this.editor) {
                    this.editor.destroy();
                }
            },

            showFileBrowser: function () {
                this.hideFileViewer();
                this.$('.files').show();
            },

            showFileViewer: function () {
                this.$('.files').hide();
                this.$('.file-viewer-wrapper').show();
            },

            closeFileClicked: function () {
                this.showFileBrowser();
            },

            renderFile: function (path, file_text) {

                this.showFileViewer();

                var extension = this.getFileExtension(path),
                    ace_editor_mode = this.getAceEditorModeForExtension(extension);

                this.editor = ace.edit("file-viewer");
                this.editor.getSession().setMode("ace/mode/" + ace_editor_mode);
                this.editor.setValue(file_text);
                this.editor.setReadOnly(true);
                this.editor.session.selection.clearSelection();
            },

            close: function () {
                if (this.editor) {
                    this.editor.destroy();
                }
                this.remove();
                this.unbind();
            }
        });
    }
);