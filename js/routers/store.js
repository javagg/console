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
                'store': 'showStore',
                'store/deploy/:store_id/:app_id': 'showDeployApp'
            },

            viewController: new ViewController('.content'),

            showStore: function () {
                this.navigate('store', {trigger: false});
                this.viewController.changeView('views/store/store', {});
            },

            showCloneRepoDialog: function(repo_name, repo_src, repo_branch, closed, context) {
                DialogHelper.showDialog("views/store/clone-repo-dialog", {repo_src: repo_src, repo_name: repo_name, repo_branch: repo_branch}, closed, context);
            },

            showDeployAppDialog: function(app_id, app_name, app_desc, app_img, repo_src, repo_branch, closed, context) {
                DialogHelper.showDialog("views/store/deploy-app-dialog", {app_id: app_id, app_name: app_name, app_desc: app_desc, app_img: app_img, repo_src: repo_src, repo_branch: repo_branch}, closed, context);
            },

            showDeployApp: function(store_id, app_id) {
                this.viewController.changeView('views/store/deploy/deploy', {store_id: store_id, app_id: app_id});
            }
        });
    }
);
