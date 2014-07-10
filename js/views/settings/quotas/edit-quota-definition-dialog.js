/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'util/base-dialog',
    'text!views/settings/quotas/templates/settings.html'],
    function ($, BaseDialog, QuotasTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('settings.quotas.edit_quota.title'),

                dialogId: "edit-quota-definition-dialog",

                clickOnSubmit: ".btn-update-quota",

                render: function () {

                    var that = this,
                        quota = this.options.quota;

                    sconsole.cf_api.quota_definitions.get(quota.metadata.guid, {}, function (err, res) {
                        if (err) {
                            // todo: log error
                        }
                        var bodyTemplate = _.template($(QuotasTemplate).filter('#edit-quota-definition-dialog-body').html().trim(), {quota: res.entity});
                        that.el.html(bodyTemplate);
                        that.buttonContainer.prepend(_.template($(QuotasTemplate).filter('#edit-quota-definition-dialog-footer').html().trim(), {}));
                        
                        that.applyFormValidation(res.entity.name);
                        
                        $(".btn-update-quota", that.buttonContainer).click(function (event) {
                            that.updateQuotaClicked(event);
                        });
                    });
                },
                
                applyFormValidation: function (quota_name) {
                    
                    var rules = {};
                    rules['memory_limit_' + quota_name] = {
                        required: true,
                        positiveInt: true,
                    };
                    rules['total_services_' + quota_name] = {
                        required: true,
                        positiveInt: true,
                    };
                    
                    this.$('form.quota-definition').validate({rules: rules});
                },
                
                updateQuotaClicked: function (event) {

                    var that = this;
                    
                    if (!this.$('form.quota-definition').valid()) {
                        return;
                    }
                    
                    event.preventDefault();
                    $(event.target).button('loading');

                    var quota_guid = this.options.quota.metadata.guid;

                    var quota_data = {};

                    quota_data['name'] = this.$('#input-name').val();
                    quota_data['total_services'] = parseInt(this.$('#input-total_services').val());
                    quota_data['memory_limit'] = parseInt(this.$('#input-memory_limit').val());
                    quota_data['allow_sudo'] = this.$('#input-allow_sudo').is(':checked');

                    sconsole.cf_api.quota_definitions.update(quota_guid, quota_data, {}, function (err, res_body) {
                        if (err) {
                            $(event.target).button('reset');
                            $('.modal-body')
                                .after($('<div>', { 'class': 'alert alert-danger user-creation-error clearfix', 'html': polyglot.t('error') + err.message }));
                            return;
                        }

                        that.closeWithResult({updated: true, id: res_body.metadata.guid, quota: res_body});
                    });
                }
            }
        );
    }
);
