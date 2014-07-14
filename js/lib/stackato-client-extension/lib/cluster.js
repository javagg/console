/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([],
    function () {

        var cluster = function (api) {
            this.api = api;
        };

        cluster.prototype = {

            getUsage: function (options, done) {

                if (typeof options === 'function' && typeof done === 'undefined') {
                    done = options;
                    options = null;
                }

                options = options || {};
                options.status_code = 200;

                this.api.get('/v2/usage', options, function (err, res) {
                    if (err) {return done(err);}
                    done(null, res.body);
                });
            },

            getStatus: function (options, done) {

                if (typeof options === 'function' && typeof done === 'undefined') {
                    done = options;
                    options = null;
                }

                options = options || {};
                options.status_code = 200;

                this.api.get('/v2/stackato/status', options, function (err, res) {
                    if (err) {return done(err);}
                    done(null, res.body);
                });
            },

            getPrimaryNodeStats: function (plugin, plugin_args, start, finish, options, done) {

                if (typeof options === 'function' && typeof done === 'undefined') {
                    done = options;
                    options = null;
                }

                var url = '/v2/stackato/stats/collectd?host=stackato';

                if (plugin) {
                    url = url + '&plugin=' + plugin;
                }

                if (plugin_args) {
                    url = url + '&args=' + plugin_args;
                }

                if (start) {
                    url = url + '&start=' + start;
                }

                if (finish) {
                    url = url + '&finish=' + finish;
                }

                options = options || {};
                options.status_code = 200;

                this.api.get(url, options, function (err, res) {
                    if (err) {return done(err);}
                    done(null, res.body);
                });
            },

            generateClusterReport: function (secret, options, done) {

                if (typeof options === 'function' && typeof done === 'undefined') {
                    done = options;
                    options = null;
                }

                var url = '/v2/stackato/report/token/' + encodeURIComponent(secret);

                options = options || {};
                options.status_code = 200;

                this.api.put(url, options, function (err, res) {
                    if (err) {return done(err);}
                    done(null, res.body);
                });
            }
        };

        return cluster;
    }
);