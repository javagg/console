//
// Copyright (c) Appsecute 2013 - ALL RIGHTS RESERVED.
//

define([
    'underscore',
    'jquery',
    'backbone',
    'jquery-mousewheel',
    'util/activity-indicator',
    'text!util/templates/base-dialog.html'],
    function (_, $, Backbone, MouseWheel, ActivityIndicator, BaseDialogTemplate) {
        return Backbone.View.extend({


            options: {},

            initialize: function () {
                _.bindAll(this);

                // Gather any user set options.
                this.setupDialogOptions();

                // Render the base dialog elements into el.
                this.renderBaseDialog();

                // Update the dialog size if the user has requested a full screen dialog.
                this.setDialogSize();

                // Call the users pre render function to set up the tabs list.
                // A pre-render can return true if it will continue the tab initialization itself
                // - useful if a GET call is required by the child view in the pre-render.
                // If a child view returns true here then it is their responsibility to call postInitialize manually.
                var manualPostInitialize = false;
                if (this.preRender) {
                    manualPostInitialize = this.preRender();
                }

                if (!manualPostInitialize) {
                    this.postInitialize();
                }
            },

            postInitialize: function () {
                // Call the users render function if it has been provided.
                if (this.render) {
                    this.render();
                }

                // Call the users post-render function if it has been provided when the dialog is visible.
                var that = this;
                $(this.dialog).on('shown.bs.modal', function () {
                    if (that.postRender) {
                        that.postRender();
                    }
                });

                if (this.clickOnSubmit) {
                    $("input", this.el).keypress(function (event) {
                        if (event.which === 13) {
                            event.preventDefault();
                            $(that.clickOnSubmit, that.buttonContainer).click();
                        }
                    });
                }
                // Display the dialog.
                this.displayDialog();

                // Fix the inner scroll event bubbling to window scroll.
                // this.stopWindowScroll();
            },

            setupDialogOptions: function () {
                // Has a unique dialog id been specified?
                this.options.dialogId = this.dialogId || "activestate-dialog";

                // Any header text.
                this.options.headerText = this.headerText || "&nbsp;";
            },

            setDialogSize: function () {
                if (this.fullscreenDialog) {
                    this.dialog.width($(window).width() - 50);
                    this.dialog.height($(window).height() - 50);
                    $(".modal-body", this.dialog).css("max-height", $(window).height() - 50);

                    this.dialog.css({
                        "max-height": $(window).height() - 50,
                        top: "25px",
                        left: "25px",
                        margin: "0"
                    });
                }
            },

            renderBaseDialog: function () {
                var that = this;

                var template = _.template(BaseDialogTemplate, this.options);

                var modalCreationOptions = {
                    show: false
                };
                if (this.modalOptions) {
                    $.extend(modalCreationOptions, this.modalOptions);
                }

                this.dialog = $(template).modal(modalCreationOptions);

                $(this.dialog).on('hidden.bs.modal', function () {
                    that.trigger('hide', that.result);
                    that.close();
                });

                this.el = $('.modal-body', this.dialog);
                this.$el = $(this.el);

                this.buttonContainer = $('.modal-footer', this.dialog);
            },

            displayDialog: function () {
                $(this.dialog).modal('show');
            },

            stopWindowScroll: function () {
                $(this.dialogScrollSelector || ".modal-body").on('mousewheel.base-dialog', function (e, d) {
                    if (d > 0 && $(this).scrollTop() === 0) {
                        e.preventDefault();
                    } else if (d < 0 && $(this).scrollTop() === $(this).get(0).scrollHeight - $(this).innerHeight()) {
                        e.preventDefault();
                    }
                });
            },

            closeWithResult: function (result) {
                this.result = result;
                $(this.dialog).modal('hide');
            },

            close: function () {
                $('body .modal').remove();
                $('body .modal-backdrop').remove();
                this.remove();
                this.unbind();
            }
        });
    }
);