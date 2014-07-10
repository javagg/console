/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define(['underscore'],
    function (_) {

        // We only want one of these for the lifetime of the app
        if (sconsole.stream_cache) {
            return sconsole.stream_cache;
        }

        var streamCache = function () {
            this.apps = {};
            this.app_callbacks = {};
            this.users = {};
            this.user_callbacks = {};
            this.current_user = null;
            this.current_user_request = null;
            this.current_user_callbacks = [];
        };

        streamCache.prototype = {

            drainAppCallbacks: function (app_guid, err, app) {
                if (app) {
                    this.apps[app_guid] = app;
                }
                _.each(this.app_callbacks[app_guid], function (callback) {
                    callback(err, app);
                });
                this.app_callbacks[app_guid] = [];
            },

            getApplication: function (app_guid, done) {

                var self = this;
                if (this.apps[app_guid]) {
                    setTimeout(function () {
                        done(null, self.apps[app_guid])
                    }, 1);
                } else {
                    if (this.app_callbacks[app_guid]) {
                        this.app_callbacks[app_guid].push(done);
                    } else {
                        this.app_callbacks[app_guid] = [done];
                        sconsole.cf_api.apps.get(app_guid, {}, function (err, app) {
                            self.drainAppCallbacks.call(self, app_guid, err, app);
                        });
                    }
                }
            },

            drainUserCallbacks: function (user_guid, err, users) {
                if (users) {
                    this.users[user_guid] = users.resources[0];
                }
                _.each(this.user_callbacks[user_guid], function (callback) {
                    callback(err, users.resources[0]);
                });
                this.user_callbacks[user_guid] = [];
            },

            getUser: function (user_guid, done) {

                var self = this;
                if (this.users[user_guid]) {
                    setTimeout(function () {
                        done(null, self.users[user_guid])
                    }, 1);
                } else {

                    if (this.user_callbacks[user_guid]) {
                        this.user_callbacks[user_guid].push(done);
                    } else {
                        this.user_callbacks[user_guid] = [done];
                        sconsole.cf_api.users.guidExchange([user_guid], 'id,userName,emails', function (err, users) {
                            self.drainUserCallbacks.call(self, user_guid, err, users);
                        });
                    }
                }
            },

            drainCurrentUserCallbacks: function (err, user) {
                if (user) {
                    this.current_user = user;
                }
                _.each(this.current_user_callbacks, function (callback) {
                    callback(err, user);
                });
                this.current_user_callbacks = [];
            },

            getCurrentUser: function (done) {

                var self = this;
                if (this.current_user) {
                    setTimeout(function () {
                        done(null, self.current_user);
                    }, 1);
                } else {

                    this.current_user_callbacks.push(done);

                    if (!this.current_user_request) {
                        this.current_user_request = true;
                        sconsole.cf_api.users.getCurrentUserInfo(function (err, user) {
                            self.drainCurrentUserCallbacks.call(self, err, user);
                        });
                    }
                }
            }
        };

        sconsole.stream_cache = new streamCache();
        return sconsole.stream_cache;
    }
);