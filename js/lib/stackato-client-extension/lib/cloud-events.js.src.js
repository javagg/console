/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([],
    function () {

        var cloud_events = function (api) {
            this.api = api;
        };

        cloud_events.prototype = {

            getEvents: function (since_md5, options, done) {

                if (typeof options === 'function' && typeof done === 'undefined') {
                    done = options;
                    options = null;
                }

                options = options || {};
                options.status_code = 200;

                var url = '/v2/stackato/cloudevents';
                if (since_md5) {
                    url += "?since_md5=" + since_md5;
                }

                this.api.get(url, options, function (err, res) {
                    if (err) {return done(err);}
                    done(null, res.body);
                });
            }
        };

        return cloud_events;
    }
);