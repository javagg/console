/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'async',
    'util/gravatar',
    'appsecute-api/lib/logger',
    'access/admin-access',
    'views/lists/organization-table-view',
    'util/settings',
    'util/activity-indicator',
    'text!util/templates/alert.html',
    'text!views/users/templates/user.html'],
    function ($, Backbone, _, Polyglot, Async, Gravatar, Logger, AdminAccess, OrganizationTableView, Settings, Activity, AlertTemplate, UserTemplate) {

        return Backbone.View.extend({

            logger: new Logger('User'),

            events: {
                'click .organization': 'organizationClicked',
                'click .btn-change-password': 'changePasswordClicked',
                'click .btn-revoke-admin': 'revokeAdminClicked',
                'click .btn-grant-admin': 'grantAdminClicked',
                'click .btn-edit-user-details': 'editUserDetailsClicked'
            },

            initialize: function () {
                this.options.activity.close();
                this.getUser();
            },

            setUserAttributes: function (user_attribute) {
                this.user.attributes = user_attribute;
                this.user.attributes.email = user_attribute.emails.length > 0 ? user_attribute.emails[0].value : "";
                this.user.attributes.displayName = user_attribute.userName || "";
                this.user.attributes.name = user_attribute.name || {};
            },

            getUser: function () {

                var self = this;
                sconsole.cf_api.users.get(self.options.user_guid, function (err, user) {
                    if (err) {return self.logger.error(err);}
                    self.options.activity.close();

                    self.user = user;

                    sconsole.cf_api.users.guidExchange([self.options.user_guid], 'id,emails,userName,name', function (err, user_attributes) {
                        if (err) {return self.logger.error(err);}
                        _.each(user_attributes.resources, function (user_attribute) {
                            if (user_attribute.id == self.options.user_guid) {
                                self.setUserAttributes(user_attribute);
                            }
                        });

                        self.render();
                        self.renderContactInfo();
                        self.renderMembership();
                        self.renderChangePasswordButton();

                        var current_user_guid = sconsole.user.info.metadata.guid;
                        if (AdminAccess.isAdmin() && current_user_guid != self.user.metadata.guid) {
                            self.renderAdminButton(self.user.entity.admin);
                        }
                    });

                });
            },

            render: function () {

                var template = _.template($(UserTemplate).filter('#user-template').html().trim(), {
                    user: this.user,
                    display_name: this.user.attributes.displayName,
                    user_img: Gravatar.getGravatarImageUrl(this.user.attributes.email)
                });

                $(template)
                    .appendTo(this.el);
            },

            renderContactInfo: function () {
                var template = _.template($(UserTemplate).filter('#user-contact-info-template').html().trim(), {
                    user: this.user
                });

                $('.user-contact-list').empty();

                $(template)
                    .appendTo($('.user-contact-list'));
            },

            renderMembership: function () {

                this.organization_table = new OrganizationTableView({
                    collection_options: {
                        filter: {name: 'user_guid', value: this.options.user_guid}
                    },
                    el: $('<div>').appendTo(this.$('.organizations-table')),
                    resource_clicked: this.organizationClicked,
                    context: this
                });
            },

            renderChangePasswordButton: function () {
                // todo: only display if logged in user has permission to change password
                var template = _.template($(UserTemplate).filter('#user-change-password-template').html().trim(), {
                    user: this.user
                });

                $(template)
                    .appendTo($('.user-buttons'))
            },

            renderAdminButton: function (isAdmin) {

                // todo: only display these if currently logged in user is an admin
                // todo: don't display this for currently logged in user
                if (isAdmin) {
                    this.renderRevokeAdminButton();
                }
                else {
                    this.renderGrantAdminButton();
                }
            },

            renderGrantAdminButton: function () {

                $('.user-buttons .admin-btn').remove();

                var template = _.template($(UserTemplate).filter('#user-grant-admin-template').html().trim(), {
                    user: this.user
                })

                $(template)
                    .appendTo($('.user-buttons'))
            },

            renderRevokeAdminButton: function () {

                $('.user-buttons .admin-btn').remove();

                var template = _.template($(UserTemplate).filter('#user-revoke-admin-template').html().trim(), {
                    user: this.user
                });

                $(template)
                    .appendTo($('.user-buttons'))
            },

            organizationClicked: function (organization) {
                sconsole.routers.organizations.showOrganization(organization.metadata.guid);
            },

            changePasswordClicked: function (event) {

                var self = this;
                sconsole.routers.users.showChangePasswordDialog(
                    self.user.entity.username,
                    self.user.metadata.guid,
                    function (result) {
                        if (result && result.changed) {
                            var template = _.template($(AlertTemplate).filter('#alert-success').html().trim(), {
                                message: polyglot.t('user.change_password_success')
                            });

                            $(template)
                                .appendTo($('.page-header'));

                            setTimeout(function () { $('.page-header .alert').slideUp('slow', function () { this.remove() }) }, 3000);
                        }
                    },
                    this);
            },

            editUserDetailsClicked: function (event) {
                var that = this;
                sconsole.routers.users.showEditDetailsDialog(
                    that.user,
                    function (result) {
                        if (result && result.changed && result.attributes) {
                            that.setUserAttributes(result.attributes);
                            that.renderContactInfo(result.attributes);
                        }
                    },
                    this);
            },

            revokeAdminClicked: function (event) {

                var self = this;
                sconsole.cf_api.users.updateUser(
                    this.user.metadata.guid,
                    {admin: false},
                    function (err) {
                        if (err) {return;}
                        self.renderAdminButton(false);
                    }
                );
            },

            grantAdminClicked: function (event) {

                var self = this;
                sconsole.cf_api.users.updateUser(
                    this.user.metadata.guid,
                    {admin: true},
                    function (err) {
                        if (err) {return;}
                        self.renderAdminButton(true);
                    }
                );
            },

            close: function () {

                if (this.organization_table) {
                    this.organization_table.close();
                }

                this.remove();
                this.unbind();
            }
        });
    }
);
