/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'backbone',
    'util/dialog-helper',
    'util/view-controller'],
    function (Backbone, DialogHelper, ViewController) {

        return Backbone.Router.extend({

            routes: {
                'admin/users': 'adminUsers',
                'users/:user_id': 'user'
            },

            viewController: new ViewController('.content'),

            adminUsers: function () {
                this.viewController.changeView('views/users/users', {trigger: true});
            },

            showUser: function (user_guid) {
                this.navigate('users/' + encodeURIComponent(user_guid), {trigger: true});
            },

            user: function (user_guid) {
                this.viewController.changeView('views/users/user', {user_guid: decodeURIComponent(user_guid)});
            },

            showCreateUserDialog: function (closed, context) {
                DialogHelper.showDialog("views/users/create-user-dialog", null, closed, context);
            },

            showDeleteUserDialog: function (user_name, user_guid, closed, context) {
                DialogHelper.showDialog("views/users/delete-user-dialog", {user_name: user_name, user_guid: user_guid}, closed, context);
            },

            showChangePasswordDialog: function (user_name, user_guid, closed, context) {
                DialogHelper.showDialog("views/users/change-password-dialog", {user_name: user_name, user_guid: user_guid}, closed, context);
            },

            showEditDetailsDialog: function (user, closed, context) {
                DialogHelper.showDialog("views/users/edit-user-details-dialog", {user: user}, closed, context);
            }
        });
    }
);
