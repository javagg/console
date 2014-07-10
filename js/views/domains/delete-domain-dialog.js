/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'bootstrap-select',
    'util/base-dialog',
    'text!views/domains/templates/delete-domain-dialog.html'],
    function ($, BootstrapSelect, BaseDialog, DeleteDomainDialogTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('domains.delete_domain'),

                dialogId: "delete-domain-dialog",

                render: function () {

                    var self = this,
                        bodyTemplate = _.template($(DeleteDomainDialogTemplate).filter('#delete-domain-dialog-body').html().trim(), {domain: this.options.domain});

                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(DeleteDomainDialogTemplate).filter('#delete-domain-dialog-footer').html().trim(), {}));

                    $(".btn-delete-domain", this.buttonContainer).click(function (event) {
                        event.preventDefault();
                        self.deleteDomainClicked();
                    });
                },

                deleteDomainClicked: function () {

                    var self = this,
                        domain_guid = this.options.domain.metadata.guid;

                    this.$('.error').hide();
                    $('.btn-delete-domain', this.buttonContainer).button('loading');

                    sconsole.cf_api.domains.delete_(domain_guid, {queries: {recursive: true}}, function (err, domain) {
                        if (err) {
                            self.$('.error').html(err.message).show();
                            $('.btn-delete-domain', self.buttonContainer).button('reset');
                            return;
                        }

                        self.closeWithResult({deleted: true});
                    });
                }
            }
        );
    }
);
