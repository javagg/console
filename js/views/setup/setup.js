/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'util/settings',
    'jqueryvalidation',
    'text!views/setup/templates/setup.html'],
    function ($, Backbone, _, Polyglot, Settings, Validate, SetupTemplate) {

        return Backbone.View.extend({

            events: {
                'click .btn-setup': 'setupFirstUserClicked',
                'click .eula': 'eulaClicked'
            },

            initialize: function () {
                this.options.activity.close();
                this.render();
            },

            render: function () {

                var self = this;
                sconsole.cf_api.get('/v2/info', {}, function (err, res) {
                    if (err) {
                        // todo: show error
                        return;
                    }

                    // if the license has been accepted, navigate to the default view
                    if (res.body.stackato.license_accepted) {
                        window.location.hash = '#';
                        window.location.reload();
                        return;
                    }

                    // otherwise, show the setup form
                    var template = _.template($(SetupTemplate).filter('#setup-template').html().trim(), {
                        settings: Settings.getSettings() });

                    $(template)
                        .appendTo(self.el);

                    $('#setup-form', self.el).validate({
                        debug: true,
                        errorPlacement: function (error, element) {
                            if (element.attr("name") == "agree") {
                                error.insertAfter(".agree-to-tos");
                            } else {
                                error.insertAfter(element);
                            }
                        },
                        rules: {
                            username: "required",
                            email: {
                                email: true
                            },
                            password: {
                                required: true,
                                maxlength: 4096,
                            },
                            password2: {
                                equalTo: '#input-password'
                            },
                            'agree[]': {
                                required: true
                            }
                        },
                        messages: {
                            username: polyglot.t('setup.username_required'),
                            email: {
                                required: polyglot.t('setup.email_required'),
                                email: polyglot.t('setup.email_format')
                            },
                            agree: {
                                required: polyglot.t('setup.agree_required')
                            }
                        }
                    });

                    $('#input-username').focus();
                });
            },

            setupFirstUserClicked: function (event) {
                if (!this.$('#setup-form').valid()) {
                    return;
                }

                $('.btn-setup').button('loading');

                this.$('.error-container').hide();

                var self = this,
                    user_data = {};

                user_data['username'] = $('#input-username').val();
                user_data['email'] = $('#input-email').val();
                user_data['password'] = $('#input-password').val();
                user_data['org_name'] = $('#input-org').val();
                user_data['space_name'] = $('#input-space').val();
                user_data['admin'] = true;

                sconsole.cf_api.post('/v2/stackato/firstuser', {data: user_data}, function (err, res) {
                    if (err) {
                        $('.btn-setup').button('reset');
                        var error = polyglot.t('setup.error_occurred') + (res.body ? (": " + JSON.stringify(res.body)) : ".");
                        self.$('.error-container').html(error);
                        self.$('.error-container').show();
                        return;
                    }

                    window.location.hash = '#';
                    window.location.reload();
                });
            },

            eulaClicked: function (e) {
                sconsole.routers.support.showEulaDialog(function () {
                }, this);
                e.preventDefault();
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
