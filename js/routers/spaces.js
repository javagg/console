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
                'spaces': 'spaces',
                'spaces/:space_guid': 'space',
                'spaces/:space_guid/:sub_view': 'space'
            },

            viewController: new ViewController('.content'),

            showSpace: function (space_guid) {
                this.showSpaceSubView(space_guid, 'applications');
            },

            showSpaceSubView: function (space_guid, sub_view) {
                this.navigate('spaces/' + encodeURIComponent(space_guid) + '/' + sub_view, {trigger: true});
            },

            space: function (space_guid, sub_view) {
                sub_view = sub_view ? decodeURIComponent(sub_view) : null;
                this.viewController.changeView('views/spaces/space', {space_guid: decodeURIComponent(space_guid), sub_view: sub_view});
            },

            showSetAsDefaultDialog: function (space_data, closed, context) {
                DialogHelper.showDialog("views/spaces/set-as-default-dialog", {space_data: space_data}, closed, context);
            },

            showUnsetAsDefaultDialog: function (space_data, closed, context) {
                DialogHelper.showDialog("views/spaces/unset-as-default-dialog", {space_data: space_data}, closed, context);
            },

            showDeleteSpaceDialog: function (space_guid, closed, context) {
                DialogHelper.showDialog("views/spaces/delete-space-dialog", {space_guid: space_guid}, closed, context);
            },

            showAddUserDialog: function (space_guid, user_type, closed, context) {
                DialogHelper.showDialog("views/spaces/add-user-dialog", {space_guid: space_guid, user_type: user_type}, closed, context);
            },

            showRemoveUserDialog: function (space_guid, user, user_type, closed, context) {
                DialogHelper.showDialog("views/spaces/remove-user-dialog", {space_guid: space_guid, user: user, user_type: user_type}, closed, context);
            }
        });
    }
);
