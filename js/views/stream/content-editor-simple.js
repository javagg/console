/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'appsecute-api/lib/event',
    'text!views/stream/templates/content-editor-simple.html'],
    function ($, Backbone, _, Event_, EditorTemplate) {

        return Backbone.View.extend({

            events: {
                'click .editor-save': 'editorSaveClicked',
                'click .editor-cancel': 'editorCancelClicked'
            },

            initialize: function () {
                _.bindAll(this);
                this.render();
            },

            render: function () {

                var template = _.template($(EditorTemplate).filter('#editor-template').html().trim(), {
                    save_text: this.options.save_text || polyglot.t('stream.content_editor.reply'),
                    hide_cancel: !_.isBoolean(this.options.hide_cancel) ? false : this.options.hide_cancel,
                    content: this.options.content || ''
                });

                $(template)
                    .appendTo(this.el);
            },

            resetContent: function () {
                this.$('.editor-content').val('');
            },

            editorSaveClicked: function (click_event) {
                this.trigger('save', {editor_content: this.$('.editor-content').val(), editor: this});
            },

            editorCancelClicked: function (click_event) {
                this.trigger('cancel', {editor: this});
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);