//
// Copyright (c) Appsecute 2013 - ALL RIGHTS RESERVED.
//

/**
 * @description An HttpClient capable of executing GET, PUT, POST and DELETE.
 */
define([
    'jquery',
    'appsecute-api/lib/utils',
    'appsecute-api/lib/logger',
    'appsecute-api/lib/start'],
    function ($, Utils, Logger, StartDocument) {

        /**
         * @description A logger used for logging within the HttpClient object.
         */
        var _logger = new Logger("HttpClient");

        /**
         * Parses the response to an HTTP request to JSON.
         * If parsing fails the original response string will be returned.
         */
        var parseResponse = function (jqXHR) {
            try {
                return JSON.parse(jqXHR.responseText)
            } catch (e) {
                return jqXHR.responseText;
            }
        };

        /**
         * Gets HTTP request headers that should be sent with the request.
         */
        var getRequestHeaders = function (httpRequest) {

            var headers = httpRequest.headers || {};

            if (httpRequest.verb !== "GET") {
                headers['X-CSRF-Token'] = Utils.getCookie('authenticity_token');
            }

            var token = Utils.getCookie('cf_token');
            if (token) {
                headers['Authorization'] = 'bearer ' + token;
            }

            return headers;
        };

        /**
         * @description Executes an HttpRequest.
         */
        var _doRequest = function (httpRequest, timeout, success, error) {
            try {
                httpRequest.handle = $.ajax({
                        url: httpRequest.url,
                        accept: "application/json",
                        contentType: httpRequest.data ? "application/json" : "",
                        dataType: "text",
                        type: httpRequest.verb,
                        async: true,
                        data: httpRequest.data ? JSON.stringify(httpRequest.data) : null,
                        timeout: timeout,
                        headers: getRequestHeaders(httpRequest),
                        processData: false,
                        cache: false,
                        success: function (data, textStatus, jqXHR) {
                            if (Utils.isFunction(success)) {

                                var httpResponse = {
                                    status_code: jqXHR.status,
                                    body: parseResponse(jqXHR),
                                    headers: Utils.processHttpHeaders(jqXHR.getAllResponseHeaders()),
                                    jqXHR: jqXHR
                                };

                                // Workaround for Firefox not exposing http response headers on CORS requests.
                                // This workaround expects the server to set the location and id properties in the response
                                // body when resources are created (status code 201).
                                if (httpResponse.status_code === 201 &&
                                    httpResponse.body &&
                                    (httpResponse.body.id || httpResponse.body.location )) {
                                    httpResponse.headers.id = httpResponse.body.id;
                                    httpResponse.headers.location = httpResponse.body.location;
                                }

                                success(httpRequest, httpResponse);
                            }
                        },
                        error: function (jqXHR) {
                            if (Utils.isFunction(error)) {

                                var httpResponse = {
                                    status_code: jqXHR.status,
                                    body: parseResponse(jqXHR),
                                    headers: Utils.processHttpHeaders(jqXHR.getAllResponseHeaders()),
                                    jqXHR: jqXHR
                                };

                                error(httpRequest, httpResponse);
                            }
                        }}
                );
            } catch (e) {
                _logger.error("An exception occurred processing an HTTP Request: " + e);
            }
        };

        return {

            /**
             * @description Executes the provided http request.
             * @param {Object} request The http request to execute.
             * @param {int} timeout The maximum time in milliseconds the request may be in-progress
             * before being aborted.
             * @param {function} success A function that will be called if the request succeeds.
             * @param {function} error A function that will be called if the request fails.
             */
            executeHttpRequest: function (request, timeout, success, error) {

                // If the request contains a url then use it
                if (Utils.isUrl(request.url)) {
                    _doRequest(request, timeout, success, error);
                } else {
                    // Otherwise the request contains the name of a start document uri.
                    StartDocument.getUri(
                        request.url,
                        function (url) {
                            request.url = url;
                            _doRequest(request, timeout, success, error);
                        },
                        function (errorReason) {
                            _doRequest(request, timeout, success, error);
                        }
                    );
                }
            }
        }
    }
);