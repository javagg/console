/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([],
    function () {

        var export_ = function (api) {
            this.api = api;
        };

        export_.prototype = {

            getInfo: function (options, done) {

                if (typeof options === 'function' && typeof done === 'undefined') {
                    done = options;
                    options = null;
                }

                options = options || {};
                options.status_code = 200;

                this.api.get('/v2/stackato/export_info', options, function (err, res) {
                    if (err) {return done(err);}
                    done(null, res.body);
                });
            }
        };

        return export_;
    }
);