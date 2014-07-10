/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery'],
    function ($) {

        var waitForCloudController = function (done) {

            $.ajax({
                    url: sconsole.api_endpoint + '/v2/info',
                    accept: "application/json",
                    dataType: "json",
                    type: 'GET',
                    async: true,
                    timeout: 30000,
                    processData: false,
                    cache: false,
                    complete: function (jqXHR, textStatus) {
                        if (jqXHR.status !== 200) {
                            setTimeout(function () {
                                waitForCloudController(done);
                            }, 2000);
                        } else {
                            done(null);
                        }
                    }}
            );
        };

        return {
            run: function (done) {
                waitForCloudController(done);
            }
        }
    }
);