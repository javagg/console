/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */



define([
    'jquery',
    'bootstrap-select',
    'util/base-dialog',
    'async',
    'views/lists/typeahead-bar',
    'text!views/organizations/templates/organization-dialogs.html'],
    function ($, BootstrapSelect, BaseDialog, Async, TypeAheadBar, OrganizationDialogsTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('organization.edit_quota'),

                dialogId: "edit-quota-dialog",

                render: function () {

                    var that = this;
                    var bodyTemplate = _.template($(OrganizationDialogsTemplate).filter('#edit-quota-dialog-body').html().trim(), {plan_name: this.options.org.entity.quota_definition.entity.name});
                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(OrganizationDialogsTemplate).filter('#edit-quota-dialog-footer').html().trim(), {}));

                    this.quota_type_ahead = new TypeAheadBar({
                        el: this.$('.quota-select'),
                        collection: sconsole.cf_api.quota_definitions,
                        search_property: 'name',
                        placeholder: 'Quota Definition',
                        resource_formatter: function (datum, container, query) {
                            return _.template($(OrganizationDialogsTemplate).filter('#edit-quota-resource').html().trim(), {quota: datum.resource});
                        }});

                    $(".btn-edit-quota", this.buttonContainer).click(function (event) {
                        that.editQuotaClicked();
                    });
                },

                editQuotaClicked: function () {

                    var self = this,
                        quota_definition = this.quota_type_ahead.getSelectedResource();

                    if (!quota_definition) {return;}

                    this.$('.error').hide();
                    $('.btn-edit-quota', this.buttonContainer).button('loading');

                    sconsole.cf_api.organizations.update(self.options.org.metadata.guid, {quota_definition_guid: quota_definition.metadata.guid}, {}, function (err, res) {
                        if (err) {
                            self.$('.error').html(err.message).show();
                            $('.btn-edit-quota', self.buttonContainer).button('reset');
                        }

                        self.closeWithResult({updated: true});
                    });
                }
            }
        );
    }
);
