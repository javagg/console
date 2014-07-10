/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'bootstrap-select',
    'util/base-dialog',
    'text!views/domains/templates/update-domain-dialog.html'],
    function ($, BootstrapSelect, BaseDialog, UpdateDomainDialogTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('domains.update_domain'),

                dialogId: "update-domain-dialog",

                clickOnSubmit: ".btn-update-domain",

                render: function () {

                    var self = this,
                        bodyTemplate = _.template($(UpdateDomainDialogTemplate).filter('#update-domain-dialog-body').html().trim(), {domain: this.options.domain});

                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(UpdateDomainDialogTemplate).filter('#update-domain-dialog-footer').html().trim(), {}));

                    this.applyFormValidation();

                    $(".btn-update-domain", this.buttonContainer).click(function (event) {
                        event.preventDefault();
                        self.updateDomainClicked();
                    });
                },

                applyFormValidation: function () {

                    this.$('.create-domain-form').validate({
                        rules: {
                            name: {
                                required: true
                            }
                        },
                        messages: {
                            name: {
                                required: polyglot.t('domains.create_domain.warn_name_required')
                            }
                        }
                    });
                },

                updateDomainClicked: function () {

                    if (!this.$('.update-domain-form').valid()) {
                        return;
                    }

                    var self = this,
                        domain = {
                            name: this.$('#create-domain-name').val()
                        };

                    this.$('.alert-danger').hide();
                    $('.btn-update-domain', this.buttonContainer).button('loading');

                    sconsole.cf_api.domains.update(this.options.domain.metadata.guid, domain, {}, function (err, domain) {
                        if (err) {
                            self.$('.alert-danger').html(err.message).show();
                            $('.btn-update-domain', self.buttonContainer).button('reset');
                            return;
                        }

                        self.closeWithResult({updated: true, domain: domain});
                    });
                }
            }
        );
    }
);
