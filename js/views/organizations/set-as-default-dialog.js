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

                headerText: polyglot.t('organization.set_as_default'),

                dialogId: "set-as-default-dialog",

                render: function () {
                    var that = this;
                    var bodyTemplate = _.template($(OrganizationDialogsTemplate).filter('#set-as-default-dialog-body').html().trim(), {organization_name: $('<div>').text(this.options.organization_data.entity.name).html()});
                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(OrganizationDialogsTemplate).filter('#set-as-default-dialog-footer').html().trim(), {}));

                    $(".set-as-default-organization", this.buttonContainer).click(function (event) {
                        that.setAsDefaultOrganizationClicked();
                    });
                },

                setAsDefaultOrganizationClicked: function () {
                    var that = this;
                    sconsole.cf_api.organizations.update(
                        this.options.organization_data.metadata.guid,
                        {is_default: true},
                        function (err, res) {
                            if (err) {
                            } else {
                                that.closeWithResult({set_successfully: true});
                            }
                        }
                    );
                }
            }
        );
    }
);
