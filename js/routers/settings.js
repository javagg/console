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
                'settings': 'settings',
                'settings/console/reset/:setting_name': 'showForceResetConsoleSettings',
                'settings/console/:sub_view': 'consoleSettings',
                'settings/console': 'consoleSettings',
                'settings/quota': 'showQuotaSettings',
                'settings/config': 'config',
                'settings/application': 'showApplicationSettings',
                'settings/dea': 'deaSettings',
                'settings/dea/:sub_view': 'deaSettings',
                'settings/stager': 'showStagerSettings',
                'settings/harbor': 'showHarborSettings',
                'settings/logyard': 'showLogyardSettings',
                'settings/mongodb': 'showMongoDBSettings',
                'settings/mysql': 'showMySQLSettings',
                'settings/postgresql': 'showPostgreSQLSettings',
                'settings/rabbitmq': 'showRabbitMQSettings',
                'settings/rabbitmq3': 'showRabbitMQ3Settings',
                'settings/redis': 'showRedisSettings',
                'settings/memcached': 'showMemcachedSettings',
                'settings/file_system': 'showFileSystemSettings',
                'settings/:sub_view': 'settings'
            },

            viewController: new ViewController('.content'),

            settings: function (sub_view) {
                this.viewController.changeView('views/settings/settings', {sub_view: sub_view});
            },

            showSettings: function (sub_view) {
                this.showSettingsSubView('maintenance_mode');
            },

            showSettingsSubView: function (sub_view) {
                this.navigate('settings/' + sub_view, {trigger: false});
                this.settings(sub_view);
            },

            showConsoleSettings: function () {
                this.ShowConsoleSettingsProduct();
            },

            ShowConsoleSettingsProduct: function () {
                this.showConsoleSettingsSubView('product');
            },

            ShowConsoleSettingsTheme: function () {
                this.showConsoleSettingsSubView('theme');
            },

            ShowConsoleSettingsStyle: function () {
                this.showConsoleSettingsSubView('style');
            },

            ShowConsoleSettingsSupport: function () {
                this.showConsoleSettingsSubView('support');
            },

            ShowConsoleSettingsEula: function () {
                this.showConsoleSettingsSubView('eula');
            },

            ShowConsoleSettingsWelcome: function () {
                this.showConsoleSettingsSubView('welcome');
            },

            showConsoleSettingsSubView: function (sub_view) {
                this.navigate('settings/console/' + sub_view, {trigger: false});
                this.consoleSettings(sub_view);
            },

            consoleSettings: function (sub_view) {
                if (!sub_view) {
                    sub_view = 'product';
                    this.navigate('settings/console/product', {trigger: false, replace: true});
                }
                this.viewController.changeView('views/settings/console/console-settings', {sub_view: sub_view || null});
            },

            showLoadDefaultConsoleSettingsDialog: function (closed, context) {
                DialogHelper.showDialog("views/settings/console/load-defaults-dialog", {}, closed, context);
            },

            showForceResetConsoleSettings: function (setting_name) {
                this.viewController.changeView('views/settings/console/console-settings', {reset_setting_name: setting_name || null});
            },

            showQuotaSettings: function () {
                this.viewController.changeView('views/settings/quotas/settings', {});
            },

            showEditQuotaSettingsDialog: function (quota, closed, context) {
                DialogHelper.showDialog("views/settings/quotas/edit-quota-definition-dialog", {quota: quota}, closed, context);
            },

            showApplicationSettings: function () {
                this.viewController.changeView('views/settings/application/settings', {});
            },

            showDEASettings: function (sub_view) {
                this.ShowDEASettingsGeneral();
            },

            ShowDEASettingsGeneral: function () {
                this.showDEASettingsSubView('general');
            },

            ShowDEASettingsDistributionZones: function () {
                this.showDEASettingsSubView('distribution-zones');
            },

            ShowDEASettingsAvailabilityZones: function () {
                this.showDEASettingsSubView('availability-zones');
            },

            showDEASettingsSubView: function (sub_view) {
                this.navigate('settings/dea/' + sub_view, {trigger: false});
                this.deaSettings(sub_view);
            },

            deaSettings: function (sub_view) {
                if (!sub_view) {
                    sub_view = 'general';
                    this.navigate('settings/dea/general', {trigger: false, replace: true});
                }
                this.viewController.changeView('views/settings/dea/settings', {sub_view: sub_view || null});
            },

            showStagerSettings: function () {
                this.viewController.changeView('views/settings/stager/settings', {});
            },

            showHarborSettings: function () {
                this.viewController.changeView('views/settings/harbor/settings', {});
            },

            showLogyardSettings: function () {
                this.viewController.changeView('views/settings/logyard/settings', {});
            },

            showMongoDBSettings: function () {
                this.viewController.changeView('views/settings/mongodb/settings', {});
            },

            showMySQLSettings: function () {
                this.viewController.changeView('views/settings/mysql/settings', {});
            },

            showPostgreSQLSettings: function () {
                this.viewController.changeView('views/settings/postgresql/settings', {});
            },

            showRabbitMQSettings: function () {
                this.viewController.changeView('views/settings/rabbitmq/settings', {});
            },

            showRabbitMQ3Settings: function () {
                this.viewController.changeView('views/settings/rabbitmq3/settings', {});
            },

            showRedisSettings: function () {
                this.viewController.changeView('views/settings/redis/settings', {});
            },

            showMemcachedSettings: function () {
                this.viewController.changeView('views/settings/memcached/settings', {});
            },

            showFileSystemSettings: function () {
                this.viewController.changeView('views/settings/file_system/settings', {});
            },

            config: function () {
                this.viewController.changeView('views/settings/config/config-settings', {});
            },

            showConfig: function () {
                this.navigate('settings/config', {trigger: false});
                this.config();
            }
        });
    }
);
