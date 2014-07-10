/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'polyglot',
    'jqueryvalidation',
    'util/base-dialog',
    'text!views/organizations/templates/organization-dialogs.html'],
    function ($, Polyglot, Validation, BaseDialog, OrganizationDialogsTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('organizations.delete'),

                dialogId: "delete-organization-dialog",

                render: function () {
                    var that = this;
                    var bodyTemplate = _.template($(OrganizationDialogsTemplate).filter('#delete-organization-dialog-body').html().trim(), {organization_name: this.options.organization_data.entity.name});
                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(OrganizationDialogsTemplate).filter('#delete-organization-dialog-footer').html().trim(), {}));

                    $("#yes_delete_org", that.el).click(function (event) {
                        if ($("#yes_delete_org", that.el).is(':checked')) {
                            $(".delete-organization", that.buttonContainer).attr('disabled', false);
                        }
                        else {
                            $(".delete-organization", that.buttonContainer).attr('disabled', true);
                        }
                    });

                    $(".delete-organization", this.buttonContainer).click(function (event) {
                        that.deleteOrganizationClicked();
                    });
                },

                deleteOrganizationClicked: function () {
                    if (this.$('#yes_delete_org').is(':checked')) {
                        this.$('.delete-organization').button('loading');

                        var that = this;
                        sconsole.cf_api.organizations.delete_(
                            this.options.organization_data.metadata.guid,
                            {queries: {recursive: true}},
                            function (err, res) {
                                if (err) {
                                    // TODO: Display an error to the user as to why the org wasn't deleted.
                                    that.$('.delete-organization').button('reset');
                                } else {
                                    that.closeWithResult({deleted: true});
                                }
                            }
                        );
                    }
                }
            }
        );
    }
);
