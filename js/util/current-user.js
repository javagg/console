/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'underscore',
    'jquery',
    'async',
    'jwt',
    'util/gravatar',
    'appsecute-api/lib/utils'],
    function (_, $, Async, JWT, Gravatar, Utils) {

        var getParsedUserToken = function () {

            var token = Utils.getCookie('cf_token');
            if (!token) {
                return sconsole.cf_api.authorize();
            }

            // TODO: Fork JWT and wrap it in an AMD compatible loader, note we load it using requirejs but have to
            // TODO: access it via the global here.
            return jwt.WebTokenParser.parse(token);
        };

        return {

            getCurrentUser: function (done) {

                var user = {
                    info: null,
                    token: getParsedUserToken()
                };

                Async.parallel({
                        cloud_controller: function (done) {
                            sconsole.cf_api.users.get(user.token.payload.user_id, {}, done);
                        },
                        cloud_controller_summary: function (done) {
                            sconsole.cf_api.users.getSummary(user.token.payload.user_id, {}, done);
                        },
                        auth_server: function (done) {
                            sconsole.cf_api.users.getCurrentUserInfo(done);
                        }
                    },
                    function (err, result) {
                        if (err) {
                            return done(err);
                        }

                        user.info = result.cloud_controller;
                        user.summary = result.cloud_controller_summary;

                        _.each(result.auth_server, function (value, key) {
                            user.info.entity[key] = value;
                        });

                        user.info.entity.image_url = Gravatar.getGravatarImageUrl(user.info.entity.email);

                        done(null, user);
                    });
            }
        }
    }
);