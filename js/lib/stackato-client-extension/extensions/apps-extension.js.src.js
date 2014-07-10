/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'cloud-foundry-client/lib/apps'],
    function (Apps) {

        return  {

            extend: function () {

                Apps.prototype.getLogTail = function (guid, line_count, options, done) {

                    if (typeof options === 'function' && typeof done === 'undefined') {
                        done = options;
                        options = null;
                    }

                    options = options || {};
                    options.query = '?num=' + (line_count || 25) + '&monolith=1';
                    options.status_code = 200;

                    this.api.get(this.getCollectionUrl() + '/' + guid + '/stackato_logs', options, done)
                };
            }
        }
    }
);