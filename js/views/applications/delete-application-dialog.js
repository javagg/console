/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */



define([
    'jquery',
    'util/base-dialog',
    'text!views/applications/templates/application-dialogs.html'],
    function ($, BaseDialog, ApplicationDialogsTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('application.delete_application'),

                dialogId: "delete-application-dialog",

                deleteableServices: [], // guids of services that may be deleted when this app is deleted

                render: function () {

                    var that = this;
                    var bodyTemplate = _.template($(ApplicationDialogsTemplate).filter('#delete-application-dialog-body').html().trim(), {});
                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(ApplicationDialogsTemplate).filter('#delete-application-dialog-footer').html().trim(), {}));

                    this.renderServicesToDelete();

                    $(".btn-delete", this.buttonContainer).click(function (event) {
                        that.deleteClicked();
                    });
                },

                renderServicesToDelete: function () {
                    var that = this;
                    var service_bindings_calls = [];
                    this.deleteableServices = []; // Reset to empty

                    _.each(this.options.application.entity.service_bindings, function(service_binding) {
                        var bindings_url = service_binding.entity.service_instance.entity.service_bindings_url + "?inline-relations-depth=1";

                        // Create list of calls to get all service bindings for each service instance.
                        // This lets us check if the service can be deleted when the app is deleted
                        service_bindings_calls.push(
                            
                            sconsole.cf_api.get(bindings_url, {status_code: 200}, function (err, res) {
                                if (res.body.resources.length == 1) {
                                    var listItemTemplate = _.template($(ApplicationDialogsTemplate).filter('#delete-application-dialog-services-list-item').html().trim(), { 
                                        service: res.body.resources[0].entity.service_instance});
                                    
                                    $(listItemTemplate)
                                        .appendTo($('#services-to-delete', that.el));
                                    
                                    that.deleteableServices.push(res.body.resources[0].entity.service_instance_guid);
                                    
                                    // show the list of deleteable services
                                    $('.delete-services', that.el).removeClass('hide');
                                }
                            })

                        );

                    });

                    $.when(service_bindings_calls).done(function() {
                        // do nothing
                    })

                    
                },

                deleteClicked: function () {

                    var that = this;
                    this.$('.btn-delete').button('loading');

                    var delete_services = this.$('#yes-delete-services').is(":checked");

                    sconsole.cf_api.apps.delete_(this.options.application.metadata.guid, {queries: {recursive: true}}, function (err) {

                        if (err) {
                            that.$('.alert-danger').html(JSON.stringify(err));
                            that.$('.btn-delete').remove();
                            return;
                        }

                        if (delete_services) {
                            _.each(that.deleteableServices, function(service_instance_guid) {
                                sconsole.cf_api.service_instances.delete_(service_instance_guid, {queries: {recursive: true}}, function (err) {
                                    if (err) {
                                        that.$('.alert-danger').html(JSON.stringify(err));
                                        that.$('.btn-delete').remove();
                                        return;
                                    }
                                });
                            });
                        }

                        that.closeWithResult({deleted: true});
                    });
                }
            }
        );
    }
);