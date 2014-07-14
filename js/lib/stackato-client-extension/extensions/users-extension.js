/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'cloud-foundry-client/lib/users'],
    function (Users) {

        return  {

            extend: function () {

                /**
                 * Creates a new user using a Stackato-specific api call to coordinate between the CC and UAA.
                 */
                Users.prototype.createNewUser = function (user_data, options, done) {

                    if (typeof options === 'function' && typeof done === 'undefined') {
                        done = options;
                        options = null;
                    }

                    options = options || {};
                    options.status_code = 201;
                    options.data = user_data;

                    this.api.post('/v2/stackato/users', options, function (err, res) {
                        if (err) {return done(err);}
                        done(null, res.body);
                    });
                };

                /**
                 * Updates an existing user using a Stackato-specific api call to coordinate between the CC and UAA.
                 */
                Users.prototype.updateUser = function (user_guid, user_data, options, done) {

                    if (typeof options === 'function' && typeof done === 'undefined') {
                        done = options;
                        options = null;
                    }

                    options = options || {};
                    options.status_code = 200;
                    options.data = user_data;

                    this.api.put('/v2/stackato/users/' + user_guid, options, function (err, res) {
                        if (err) {return done(err);}
                        done(null, res.body);
                    });
                };

                /**
                 * Deletes an existing user using a Stackato-specific api call to coordinate between the CC and UAA.
                 */
                Users.prototype.deleteUser = function (user_guid, options, done) {

                    if (typeof options === 'function' && typeof done === 'undefined') {
                        done = options;
                        options = null;
                    }

                    options = options || {};
                    options.status_code = 200;

                    this.api.delete_('/v2/stackato/users/' + user_guid, options, function (err, res) {
                        if (err) {return done(err);}
                        done(null, res.body);
                    });
                };

                /**
                 * Enumerates users using the Stackato-specific api call.
                 */
                Users.prototype.guidExchange = function (guids, attributes, options, done) {

                    if (typeof options === 'function' && typeof done === 'undefined') {
                        done = options;
                        options = null;
                    }

                    options = options || {};
                    options.status_code = 200;

                    var query = {attributes: attributes ? attributes.split(',') : [], guids: guids},
                        query_string = encodeURIComponent(JSON.stringify(query));

                    this.api.get('/v2/stackato/users?q=' + query_string, options, function (err, res) {
                        if (err) {return done(err);}
                        done(null, res.body);
                    });
                };
            }
        }
    }
);