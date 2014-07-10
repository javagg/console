/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'bootstrap-select',
    'util/base-dialog',
    'text!views/domains/templates/create-domain-dialog.html'],
    function ($, BootstrapSelect, BaseDialog, CreateDomainDialogTemplate) {

        return BaseDialog.extend({

            headerText: polyglot.t('domains.create_domain'),

            dialogId: "create-domain-dialog",

            clickOnSubmit: ".btn-create-domain",

            render: function () {

                var self = this,
                    bodyTemplate = _.template($(CreateDomainDialogTemplate).filter('#create-domain-dialog-body').html().trim(), {});

                this.el.html(bodyTemplate);
                this.buttonContainer.prepend(_.template($(CreateDomainDialogTemplate).filter('#create-domain-dialog-footer').html().trim(), {}));

                if (!this.options.organization_guid) {
                    this.$('.pubic-domain-message').show();
                }

                this.applyFormValidation();

                $(".btn-create-domain", this.buttonContainer).click(function (event) {
                    event.preventDefault();
                    self.createDomainClicked();
                });
            },

            postRender: function() {
                this.$('#create-domain-name').focus();
            },

            applyFormValidation: function () {

                jQuery.validator.addMethod("checkurl", function(value, element) {
                    // now check if valid url
                    return /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(value);
                    }, "Please enter a valid URL."
                );


                this.$('.create-domain-form').validate({
                    rules: {
                        name: {
                            required: true,
                            checkurl: true
                        }
                    },
                    messages: {
                        name: {
                            required: polyglot.t('domains.create_domain.warn_name_required')
                        }
                    }
                });
            },

            showError: function (err) {
                this.resetCreateButton();
                this.$('.alert-danger').html(err.message).show();
            },

            resetCreateButton: function () {
                $('.btn-create-domain', this.buttonContainer).button('reset');
            },

            createDomainClicked: function () {

                if (!this.$('.create-domain-form').valid()) {
                    return;
                }

                var self = this,
                    domain = {
                        name: this.$('#create-domain-name').val(),
                        owning_organization_guid: this.options.organization_guid || ""
                    };

                this.$('.alert-danger').hide();
                $('.btn-create-domain', this.buttonContainer).button('loading');

                sconsole.cf_api.domains.list({filter: {name: 'name', value: domain.name}}, function (err, domains_page) {
                    if (err) {return self.showError(err);}

                    if (domains_page.data.resources && domains_page.data.resources.length === 1) {

                        domain = domains_page.data.resources[0];
                        if (domain.entity.owning_organization_guid &&
                            self.options.organization_guid &&
                            self.options.organization_guid !== domain.entity.owning_organization_guid) {
                            // A private domain that already exists but belongs to another org...
                            // We should only fall in here if current user is an admin
                            self.showError(new Error('Domain belongs to another organization.'));
                        } else {
                            // A shared domain that already exists, nothing to do...
                            self.closeWithResult({created: true, domain: domain});
                        }
                    } else {

                        var collection = self.options.organization_guid ?
                            sconsole.cf_api.private_domains :
                            sconsole.cf_api.shared_domains;

                        collection.create(domain, {}, function (err, domain) {
                            if (err) {return self.showError(err);}
                            self.closeWithResult({created: true, domain: domain});
                        });
                    }
                });
            }
        });
    }
);
