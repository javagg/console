/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'bootstrap-select',
    'util/base-dialog',
    'views/lists/typeahead-bar',
    'text!views/routes/templates/map-route-dialog.html'],
    function ($, BootstrapSelect, BaseDialog, TypeAheadBar, MapRouteDialogTemplate) {

        return BaseDialog.extend({

            headerText: polyglot.t('routes.map'),

            dialogId: "map-route-dialog",

            clickOnSubmit: ".btn-route-domain",

            render: function () {

                var self = this,
                    bodyTemplate = _.template($(MapRouteDialogTemplate).filter('#map-route-dialog-body').html().trim(), {});

                this.el.html(bodyTemplate);
                this.buttonContainer.prepend(_.template($(MapRouteDialogTemplate).filter('#map-route-dialog-footer').html().trim(), {}));

                this.domain_type_ahead = new TypeAheadBar({
                    el: this.$('.domain-select'),
                    collection: sconsole.cf_api.spaces.domains(this.options.application.entity.space_guid),
                    search_property: 'name',
                    placeholder: 'Domain'});

                this.domain_type_ahead.on('resource_selected', this.domainSelected, this);

                this.applyFormValidation();

                this.$('#host').keyup(function() {
                    self.$('.route-host').html(self.$('#host').val());
                });

                $(".btn-map-route", this.buttonContainer).click(function (event) {
                    event.preventDefault();
                    self.mapRouteClicked();
                });
            },

            postRender: function () {
                this.$('#host').focus();
            },

            applyFormValidation: function () {

                $.validator.addMethod("hostRegex", function(value, element) {
                    if (this.optional(element)) {
                        return this.optional(element);
                    }

                    var validHostCheck = /^[a-z0-9\-]+$/i.test(value);
                    if (!validHostCheck) {
                        return false;
                    }

                    return !(value[0] === '-' || value[value.length - 1] === '-');
                }, "Host must contain only letters, numbers, or dashes, and must begin and end with letters or numbers.");


                this.$('.map-route-form').validate({
                    rules: {
                        host: {
                            required: true,
                            hostRegex: true
                        }
                    },
                    messages: {
                        host: {
                            required: polyglot.t('routes.map.warn_host_required')
                        }
                    }
                });
            },

            showError: function (err, res) {
                this.resetCreateButton();
                var message = err.message;
                if (res && "body" in res) {
                    if ("description" in res.body) {
                        message = res.body.description;
                    }
                    if ("error_code" in res.body) {
                        var key = res.body.error_code;
                        var localized_message = polyglot.t(key, {body: res.body, _: ""});
                        if (localized_message && localized_message != key) {
                            message = localized_message;
                        }
                    }
                }
                this.$('.alert-danger').html(message).show();
            },

            resetCreateButton: function () {
                $('.btn-map-route', this.buttonContainer).button('reset');
            },

            domainSelected: function (domain) {
                this.$('.route-domain').html(domain.entity.name);
            },

            mapRouteClicked: function () {

                var self = this,
                    host = this.$('#host').val(),
                    domain = this.domain_type_ahead.getSelectedResource();

                if (!domain) {return;}

                this.$('.alert-danger').hide();
                $('.btn-map-route', this.buttonContainer).button('loading');

                // Check if the route already exists...
                sconsole.cf_api.routes
                    .list({filter: {name: 'host', value: host}}, function (err, routes_page) {
                        if (err) {return self.showError(err);}

                        // It does exists so map it to the app...
                        if (routes_page.data.resources && routes_page.data.resources.length === 1 &&
                            routes_page.data.resources[0].entity.domain_guid === domain.metadata.guid) {
                            sconsole.cf_api.apps.routes(self.options.application.metadata.guid).update(
                                routes_page.data.resources[0].metadata.guid, {}, {},
                                function (err, route) {
                                    if (err) {
                                        return self.showError(err, route);
                                    }
                                    self.closeWithResult({mapped: true, route: route});
                                });
                        }
                        // It doesn't exist so create it first...
                        else {
                            sconsole.cf_api.routes.create({
                                domain_guid: domain.metadata.guid,
                                host: host,
                                space_guid: self.options.application.entity.space_guid
                            }, {global: false}, function (err, route) {
                                if (err) {
                                    return self.showError(err, route);
                                }

                                sconsole.cf_api.apps.routes(self.options.application.metadata.guid).update(
                                    route.metadata.guid, {}, {},
                                    function (err, route) {
                                        if (err) {return self.showError(err);}
                                        self.closeWithResult({mapped: true, route: route});
                                    });
                            });
                        }
                    });
            }
        });
    }
);
