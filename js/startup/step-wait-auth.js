/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery'],
    function ($) {

        var waitForAuthServer = function (done) {

            $.ajax({
                    url: sconsole.api_endpoint + '/aok/uaa/userinfo',
                    accept: "application/json",
                    dataType: "json",
                    type: 'GET',
                    async: true,
                    timeout: 30000,
                    processData: false,
                    cache: false,
                    complete: function (jqXHR, textStatus) {
                        if (jqXHR.status !== 200 && jqXHR.status !== 401) {
                            setTimeout(function () {
                                waitForAuthServer(done);
                            }, 2000);
                        } else {
                            done(null);
                        }
                    }}
            );
        };

        return {
            run: function (done) {
                waitForAuthServer(done);
            }
        }
    }
);