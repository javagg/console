/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([],
    function () {

        var stream = function (api) {
            this.api = api;
        };

        stream.prototype = {

            getTags: function (options, done) {

                if (typeof options === 'function' && typeof done === 'undefined') {
                    done = options;
                    options = null;
                }

                options = options || {};
                options.status_code = 200;

                this.api.get('/srest/applications/tags', options, function (err, res) {
                    if (err) {return done(err);}
                    done(null, res.body);
                });
            },

            createEvent: function (application_guid, name, content, status, tags, options, done) {

                var url = '/srest/applications/' + application_guid + '/events',
                    data = {
                        status: status,
                        name: name,
                        content: content,
                        tags: tags
                    };

                if (typeof options === 'function' && typeof done === 'undefined') {
                    done = options;
                    options = null;
                }

                options = options || {};
                options.data = data;
                options.status_code = 201;

                this.api.post(url, options, function (err, res) {
                    if (err) {return done(err);}
                    done(null, res.body);
                });
            },

            searchEvents: function (search_url, search_filters, options, done) {

                options = options || {};
                options.data = {search_filters: search_filters};
                options.status_code = 200;

                this.api.post(search_url, options, function (err, res) {
                    if (err) {return done(err);}
                    done(null, res.body);
                });
            }
        };

        return stream;
    }
);