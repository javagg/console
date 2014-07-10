/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'jqueryui',
    'backbone',
    'underscore',
    'jqueryvalidation',
    'moment',
    'tag-it',
    'bootstrap-select',
    'util/gravatar',
    'views/stream/content-editor-simple',
    'text!views/stream/templates/create-discussion.html'],
    function ($, $UI, Backbone, _, Validation, Moment, TagIt, BootstrapSelect, Gravatar, ContentEditor, DiscussionTemplate) {

        return Backbone.View.extend({

            events: {

            },

            initialize: function () {

                _.bindAll(this);

                var that = this;

                sconsole.cf_api.users.getCurrentUserInfo(function (err, user) {
                    that.render(user);
                    that.getApps();
                    that.getAndPopulateApplicationTags();
                });

                // TODO
                // If app_guid is provided then get the app and set app dropdown to app (don't let it be changed).
                // If org or space guid is provided then get the apps in X and let drop down be changed
            },

            render: function (current_user) {

                current_user.image_url = Gravatar.getGravatarImageUrl(current_user.email || '');

                var template = _.template($(DiscussionTemplate).filter('#discussion-template').html().trim(), {
                    now_pretty: Moment().fromNow(),
                    user: current_user
                });

                $(template)
                    .appendTo(this.el);

                this.$('.app-list')
                    .selectpicker({title: polyglot.t('loading')});

                this.renderEditor();
                this.applyFormValidation();
            },

            getApps: function () {

                var self = this;
                if (this.options.application_guid) {
                    self.$('.app-list').hide();
                    this.selected_app_guid = this.options.application_guid;
                } else if (this.options.space_guid) {

                    sconsole.cf_api.apps.list(
                        {filter: {name: 'space_guid', value: this.options.space_guid}},
                        function (err, apps) {
                            // todo err
                            self.has_apps = (apps.data.resources && apps.data.resources.length > 0);
                            self.renderApps(apps.data.resources);
                        });
                }
            },

            renderApps: function (apps) {

                var self = this;
                _.each(apps, function (app) {

                    $('<option>', {role: 'menuitem', html: _.escape(app.entity.name)})
                        .click(function () {
                            self.appClicked(app);
                        })
                        .appendTo(self.$('.app-list'));
                });
                self.$('.app-list').selectpicker('refresh');

                if (apps.length > 0) {
                    this.updateCurrentApp(apps[0]);
                } else {
                    this.$('.app-list')
                        .selectpicker({title: polyglot.t('stream.create_discussion.no_apps')})
                        .selectpicker('refresh');
                    this.disableInputs();
                }
            },

            disableInputs: function () {
                this.$('.event-name-input').attr('disabled', 'disabled');
                this.$('.editor-content').attr('disabled', 'disabled');
                this.$('.editor-save').attr('disabled', 'disabled');
            },

            updateCurrentApp: function (app) {
                this.selected_app_guid = app.metadata.guid;
            },

            appClicked: function (app) {
                this.updateCurrentApp(app);
            },

            renderEditor: function () {

                var that = this;
                this.editor = new ContentEditor({
                    el: $('<div>').prependTo(this.$('.event-content')),
                    save_text: polyglot.t('save'),
                    hide_cancel: true});

                this.editor.on('save', function (event_data) {
                    that.createDiscussionClicked(event_data.editor_content, event_data.editor);
                });

                this.editor.on('cancel', function (event_data) {
                    that.cancelDiscussionClicked(event_data.editor);
                });
            },

            getAndPopulateApplicationTags: function () {

                var self = this;
                sconsole.cf_api.stream.getTags({}, function (err, tags) {
                    if (!err) {
                        self.$('.discussion-tags').tagit({
                            availableTags: tags,
                            caseSensitive: false,
                            showAutocompleteOnFocus: true,
                            showAutocompleteAfterTagManipulation: false,
                            dynamicAutoCompleteWidth: true,
                            placeholderText: polyglot.t('stream.create_discussion.tag'),
                            hidePlaceholderOnVisibleTags: true
                        });

                        if (!self.has_apps && !self.options.application_guid) {
                            self.$('ul.tagit').attr('disabled', 'disabled');
                            self.$('ul.tagit input[type="text"]').attr('disabled', 'disabled');
                        }
                    }
                });
            },

            applyFormValidation: function () {

                this.$('.create-discussion-form').validate({
                    rules: {
                        name: {
                            required: true
                        }
                    },
                    messages: {
                        name: polyglot.t('stream.create_discussion.subject_prompt')
                    }
                });
            },

            createDiscussionClicked: function (content, editor) {

                if (!this.$('.create-discussion-form').valid()) {
                    return false;
                }

                var self = this,
                    tag_container = this.$('.discussion-tags'),
                    tags = tag_container.tagit('assignedTags');

                // Add the 'discussion' tag to this event
                tags.push('discussion');

                sconsole.cf_api.stream.createEvent(
                    this.selected_app_guid,
                    this.$('.event-name-input').val(),
                    content,
                    'info',
                    tags,
                    {},
                    function (err) {
                        if (!err) {
                            self.$('.event-name-input').val('');
                            tag_container.tagit('removeAll');
                            editor.resetContent();
                        }
                    });
            },

            cancelDiscussionClicked: function (editor) {
                this.$('.event-name-input').val('');
                editor.resetContent();
            },

            close: function () {
                this.editor.close();
                this.remove();
                this.unbind();
            }
        });
    }
);
