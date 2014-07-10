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
                'admin/cluster': 'showCluster'
            },

            viewController: new ViewController('.content'),

            showCluster: function () {
                this.viewController.changeView('views/cluster/cluster', {});
            },

            showNodeSettingsDialog: function (node_ip, closed, context) {
                DialogHelper.showDialog("views/cluster/node-settings-dialog", {node_ip: node_ip}, closed, context);
            }
        });
    }
);
