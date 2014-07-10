/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'text!views/startup/templates/startup-dialog.ejs'],
    function ($, Backbone, StartupDialogTemplate) {

        return Backbone.View.extend({

                initialize: function () {

                    _.bindAll(this);

                    this.render();

                    sconsole.startup_dialog = this;
                },

                render: function () {

                    var self = this;
                    _.each(this.options.steps, function (step) {
                        step.id = self.getStepId(step);
                    });

                    var template = _.template(StartupDialogTemplate, {steps: this.options.steps});

                    this.el = $(template);
                    this.dialog = $(this.el).modal({keyboard: false, backdrop: 'static'});
                },

                getStepId: function (step) {
                    var split = step.path.split('/');
                    return split[split.length - 1];
                },

                startStep: function (step) {

                },

                failStep: function (step, err) {

                    $('.img-' + this.getStepId(step), this.el)
                        .removeClass('activity-indicator')
                        .addClass('glyphicon glyphicon-remove-sign');

                    $('.bootstrap-alert', this.el)
                        .html(err.message)
                        .show();
                },

                finishStep: function (step) {

                    $('.img-' + this.getStepId(step), this.el)
                        .removeClass('activity-indicator')
                        .addClass('glyphicon glyphicon-ok-sign');

                    if (step.finish) {
                        $('.text-' + this.getStepId(step), this.el)
                            .html(polyglot.t(step.finish));
                    }
                },

                close: function () {
                    $('#startup-dialog').remove();
                    $('body .modal-backdrop').remove();
                    sconsole.startup_dialog = null;
                    this.remove();
                    this.unbind();
                }
            }
        );
    }
);