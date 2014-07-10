/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'util/settings',
    'text!views/layout/templates/footer.ejs'],
    function ($, Backbone, _, Polyglot, Settings, FooterTemplate) {

        return Backbone.View.extend({

            events: {
                'click .eula': 'eulaClicked'
            },

            initialize: function () {
                this.render();
            },

            render: function () {

                var template = _.template(FooterTemplate, {settings: Settings.getSettings() });

                $(template)
                    .appendTo(this.el);
            },

            eulaClicked: function (e) {

                e.preventDefault();

                sconsole.routers.support.showEulaDialog(function () {
                }, this);
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
