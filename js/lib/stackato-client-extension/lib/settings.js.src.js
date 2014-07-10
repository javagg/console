/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([],
    function () {

        var settings = function (api) {
            this.api = api;
        };

        var settings_base_url = '/srest/settings/namespace/';

        var console_bucket_name = 'console';

        settings.prototype = {

            deleteBucket: function (bucket, options, done) {

                if (typeof options === 'function' && typeof done === 'undefined') {
                    done = options;
                    options = null;
                }

                var url = settings_base_url + bucket;

                options = options || {};
                options.status_code = 200;

                this.api.delete_(url, options, function (err, res) {
                    if (err) {return done(err);}
                    done(null, res.body);
                });
            },

            getBucket: function (bucket, options, done) {

                if (typeof options === 'function' && typeof done === 'undefined') {
                    done = options;
                    options = null;
                }

                var url = settings_base_url + bucket;

                options = options || {};
                options.status_code = 200;

                this.api.get(url, options, function (err, res) {
                    if (err) {return done(err);}
                    done(null, res.body);
                });
            },

            updateSettings: function (bucket, settings_hash, options, done) {

                if (typeof options === 'function' && typeof done === 'undefined') {
                    done = options;
                    options = null;
                }

                var url = settings_base_url + bucket;

                options = options || {};
                options.data = settings_hash;
                options.status_code = 200;

                this.api.put(url, options, function (err, res) {
                    if (err) {return done(err);}
                    done(null, res.body);
                });
            },

            updateSetting: function (bucket, key, value, options, done) {

                var data = {};
                data[key] = value;

                this.updateSettings(bucket, data, options, done);
            },

            deleteConsoleBucket: function (options, done) {
                this.deleteBucket(console_bucket_name, options, done);
            },

            getConsoleBucket: function (options, done) {
                this.getBucket(console_bucket_name, options, done);
            },

            updateConsoleSettings: function (settings_hash, options, done) {
                this.updateSettings(console_bucket_name, settings_hash, options, done);
            },

            updateConsoleSetting: function (key, value, options, done) {
                this.updateSetting(console_bucket_name, key, value, options, done);
            }
        };

        return settings;
    }
);