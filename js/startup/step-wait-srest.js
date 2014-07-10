/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery'],
    function ($) {

        var waitForStackatoRest = function (done) {

            $.ajax({
                    url: sconsole.api_endpoint + '/srest/start',
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
                                waitForStackatoRest(done);
                            }, 2000);
                        } else {
                            done(null);
                        }
                    }}
            );
        };

        return {
            run: function (done) {
                waitForStackatoRest(done);
            }
        }
    }
);