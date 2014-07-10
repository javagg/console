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
                'applications/:application_guid': 'application',
                'applications/:application_guid/:sub_view': 'application',
                'applications': 'applications',
                'admin/applications': 'adminApplications'
            },

            viewController: new ViewController('.content'),

            adminApplications: function () {
                this.applications();
            },

            applications: function () {
                this.viewController.changeView('views/applications/applications', {});
            },

            showApplication: function (application_guid) {
                this.showApplicationSubView(application_guid, 'summary');
            },

            showApplicationLogs: function (application_guid) {
                this.showApplicationSubView(application_guid, 'logs');
            },

            showApplicationSubView: function (application_guid, sub_view) {
                this.navigate('applications/' + encodeURIComponent(application_guid) + '/' + sub_view, {trigger: true});
            },

            application: function (application_guid, sub_view) {
                sub_view = sub_view ? decodeURIComponent(sub_view) : null;
                this.viewController.changeView('views/applications/application-v2', {application_guid: decodeURIComponent(application_guid), sub_view: sub_view });
            },

            showDeleteApplicationDialog: function (application, closed, context) {
                DialogHelper.showDialog("views/applications/delete-application-dialog", {application: application}, closed, context);
            },

            showChangeApplicationStateDialog: function (application_guid, action, closed, context) {
                DialogHelper.showDialog("views/applications/change-application-state-dialog", {application_guid: application_guid, action: action}, closed, context);
            }
        });
    }
);
