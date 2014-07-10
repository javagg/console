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

                headerText: polyglot.t('space.unset_as_default'),

                dialogId: "unset-as-default-dialog",

                render: function () {
                    var that = this;
                    var bodyTemplate = _.template($(SpaceDialogsTemplate).filter('#unset-as-default-dialog-body').html().trim(), {space_name: $('<div>').text(this.options.space_data.entity.name).html()});
                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(SpaceDialogsTemplate).filter('#unset-as-default-dialog-footer').html().trim(), {}));

                    $(".unset-as-default-space", this.buttonContainer).click(function (event) {
                        that.unsetAsDefaultSpaceClicked();
                    });
                },

                unsetAsDefaultSpaceClicked: function () {
                    var that = this;
                    sconsole.cf_api.spaces.update(
                        this.options.space_data.metadata.guid,
                        {is_default: false},
                        function (err, res) {
                            if (err) {
                            } else {
                                that.closeWithResult({unset_successfully: true});
                            }
                        }
                    );
                }
            }
        );
    }
);
