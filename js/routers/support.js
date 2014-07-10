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
                'client': 'client',
                'support': 'showSupport',
                'support/stackato_report': 'showStackatoReport'
                // 'support/stackato_export': 'showStackatoExport'
            },

            viewController: new ViewController('.content'),

            client: function () {
                this.viewController.changeView('views/support/client', {});
            },

            showSupport: function () {
                this.viewController.changeView('views/support/support', {});
            },

            showStackatoReport: function () {
                this.viewController.changeView('views/support/stackato_report/stackato_report', {});
            },

            showStackatoExport: function () {
                this.viewController.changeView('views/support/stackato_export/stackato_export', {});
            },

            showEulaDialog: function (closed, context) {
                DialogHelper.showDialog("views/support/eula-dialog", {}, closed, context);
            }
        });
    }
);
