/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'appsecute-api/lib/logger',
    'util/activity-indicator',
    'views/lists/user-table-view',
    'text!views/users/templates/users.html'],
    function ($, Backbone, _, Polyglot, Logger, Activity, UserTableView, UsersTemplate) {

        return Backbone.View.extend({

            logger: new Logger('Admin Users'),

            events: {
                "click .create-user": "createUserClicked"
            },

            initialize: function () {
                this.options.activity.close();
                this.render();
                this.renderUserTable();
            },

            render: function () {

                var template = _.template($(UsersTemplate).filter('#users-template').html().trim(), {});

                $(template)
                    .appendTo(this.el);
            },

            renderUserTable: function () {

                this.user_table = new UserTableView({
                    el: $('<div>').appendTo(this.$('.users-table')),
                    resource_clicked: this.userClicked,
                    click_handlers: {deleteUserClicked: this.deleteUserClicked},
                    collection_options: {
                        order_by_fields: [['username', 'users.user_name']],
                        filter_by_fields: [{'name': 'admin',
                                            'label': 'users.roles',
                                            'values': [['true', 'user.role.admin', ''],
                                                       ['false', 'user.role.user', '']]}]
                    },
                    context: this
                });
            },

            userClicked: function (user, click_event) {
                sconsole.routers.users.showUser(user.metadata.guid);
            },

            createUserClicked: function () {

                sconsole.routers.users.showCreateUserDialog(
                    function (result) {
                        if (result && result.created) {
                            sconsole.routers.users.showUser(result.id);
                        }
                    }, this);
            },

            deleteUserClicked: function (user, click_event) {

                sconsole.routers.users.showDeleteUserDialog(
                    user.entity.username,
                    user.metadata.guid,
                    function (result) {
                        if (result && result.deleted) {
                            this.user_table.close();
                            this.renderUserTable();
                        }
                    },
                    this);
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
