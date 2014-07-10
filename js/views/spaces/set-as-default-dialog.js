/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'polyglot',
    'jqueryvalidation',
    'util/base-dialog',
    'text!views/spaces/templates/space-dialogs.html'],
    function ($, Polyglot, Validation, BaseDialog, SpaceDialogsTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('space.set_as_default'),

                dialogId: "set-as-default-dialog",

                render: function () {
                    var that = this;
                    var space_name = this.options.space_data.entity.name,
                        org_name = this.options.space_data.entity.organization.entity.name,
                        org_is_default = this.options.space_data.entity.organization.entity.is_default;
                    var bodyTemplate = _.template($(SpaceDialogsTemplate).filter('#set-as-default-dialog-body').html().trim(), {
                        'space_name': $('<div>').text(space_name).html(),
                        'org_name': $('<div>').text(org_name).html(),
                        'org_is_default': org_is_default
                    });
                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(SpaceDialogsTemplate).filter('#set-as-default-dialog-footer').html().trim(), {}));

                    $(".set-as-default-space", this.buttonContainer).click(function (event) {
                        that.setAsDefaultSpaceClicked();
                    });
                },

                setAsDefaultSpaceClicked: function () {
                    var that = this;
                    sconsole.cf_api.spaces.update(
                        this.options.space_data.metadata.guid,
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
