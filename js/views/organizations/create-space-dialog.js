/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */



define([
    'jquery',
    'bootstrap-select',
    'util/base-dialog',
    'text!views/organizations/templates/organization-dialogs.html'],
    function ($, BootstrapSelect, BaseDialog, OrganizationDialogsTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('spaces.create_space'),

                dialogId: "create-space-dialog",

                clickOnSubmit: ".btn-create-space",

                render: function () {

                    var self = this;
                    var bodyTemplate = _.template($(OrganizationDialogsTemplate).filter('#create-space-dialog-body').html().trim(), {});
                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(OrganizationDialogsTemplate).filter('#create-space-dialog-footer').html().trim(), {}));

                    this.applyFormValidation();

                    $(".btn-create-space", this.buttonContainer).click(function (event) {
                        event.preventDefault();
                        self.createSpaceClicked();
                    });
                },

                postRender: function () {
                    $('#create-space-name').focus();
                },

                applyFormValidation: function () {

                    this.$('.create-space-form').validate({
                        rules: {
                            name: {
                                required: true
                            }
                        },
                        messages: {
                            name: {
                                required: polyglot.t('spaces.create_space.warn_name_required')
                            }
                        }
                    });
                },

                createSpaceClicked: function () {

                    if (!this.$('.create-space-form').valid()) {
                        return;
                    }

                    var self = this;
                    this.$('.error').hide();
                    $('.btn-create-space', this.buttonContainer).button('loading');

                    var new_space_name = this.$('#create-space-name').val();

                    sconsole.cf_api.spaces.create({name: new_space_name, 'organization_guid': self.options.org_guid }, {}, function (err, space) {
                        if (err) {
                            self.$('.error').html(err.message).show();
                            $('.btn-create-space', self.buttonContainer).button('reset');
                            return;
                        }

                        self.closeWithResult({"guid": space.metadata.guid});
                    });

                }
            }
        );
    }
);
