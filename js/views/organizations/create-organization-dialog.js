/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'polyglot',
    'jqueryvalidation',
    'bootstrap-select',
    'util/base-dialog',
    'views/lists/typeahead-bar',
    'text!views/organizations/templates/organization-dialogs.html'],
    function ($, Polyglot, Validation, BootstrapSelect, BaseDialog, TypeAheadBar, OrganizationDialogsTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('organizations.new'),

                dialogId: "create-organization-dialog",

                clickOnSubmit: ".create-organization",

                render: function () {
                    var that = this;

                    var bodyTemplate = _.template($(OrganizationDialogsTemplate).filter('#create-organization-dialog-body').html().trim(), {});
                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(OrganizationDialogsTemplate).filter('#create-organization-dialog-footer').html().trim(), {}));

                    this.quota_type_ahead = new TypeAheadBar({
                        el: this.$('.quota-select'),
                        collection: sconsole.cf_api.quota_definitions,
                        search_property: 'name',
                        placeholder: 'Quota',
                        resource_formatter: function (datum, container, query) {
                            return _.template($(OrganizationDialogsTemplate).filter('#edit-quota-resource').html().trim(), {quota: datum.resource})
                        }});

                    this.applyFormValidation();

                    $(".create-organization", this.buttonContainer).click(function (event) {
                        that.createOrganizationClicked();
                    });
                },

                postRender: function () {
                    this.$('#input-organization-name').focus();
                },

                applyFormValidation: function () {

                    this.$('.create-organization-form').validate({
                        rules: {
                            name: {
                                required: true
                            },
                            'typeahead-input': {
                                required: true
                            }
                        },
                        messages: {
                            name: {
                                required: polyglot.t('organizations.warn_name_required')
                            },
                            'typeahead-input': {
                                required: polyglot.t('organizations.warn_quota_required')
                            }
                        }
                    });
                },

                createOrganizationClicked: function () {

                    if (!this.$('.create-organization-form').valid()) {
                        return;
                    }

                    this.$('.error').hide();

                    var that = this,
                        selected_quota = this.quota_type_ahead.getSelectedResource();

                    if (!selected_quota) {return;}

                    $('.create-organization', this.buttonContainer).button('loading');

                    sconsole.cf_api.organizations.create(
                        {
                            name: this.$('#input-organization-name').val(),
                            quota_definition_guid: selected_quota.metadata.guid
                        },
                        null,
                        function (err, res) {
                            if (err) {
                                that.$('.error').html(err.message).show();
                                $('.create-organization', that.buttonContainer).button('reset');
                            } else {
                                that.closeWithResult({created: true, organization: res});
                            }
                        }
                    );
                }
            }
        );
    }
);
