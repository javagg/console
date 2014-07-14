//
// Copyright (c) Appsecute 2013 - ALL RIGHTS RESERVED.
//

/**
 * @description The Appsecute Api, use this to interact with the Appsecute webservices.
 */
define([
    'jquery',
    'appsecute-api/lib/event',
    'appsecute-api/lib/logger',
    'appsecute-api/lib/utils',
    'appsecute-api/lib/start',
    'appsecute-api/lib/priority-queue',
    'appsecute-api/lib/http-client',
    'appsecute-api/lib/settings'],
    function ($, Event, Logger, Utils, Start, PriorityQueue, HttpClient, Settings) {

        /**
         *
         * @type {Boolean}
         * @private
         */
        var _authenticated = true;


        /**
         * @description The maximum number of HTTP requests that may
         * be in-progress at any given time.
         */
        var _maxSimultaneousHttpRequests = 3;


        /**
         * @description The time in milliseconds between queue processing
         * timer events.
         */
        var _processQueueTimerInterval = 500;


        /**
         * @description A timer that will be used to periodically process the
         * queue.
         */
        var _processQueueTimer = null;


        /**
         * @description A state variable for tracking the number of in-progress
         * HTTP requests.
         */
        var _numberOfInProgressHttpRequests = 0;


        /**
         * @description An Appsecute Logger used for logging within the Api object.
         */
        var _logger = new Logger("Appsecute Api");


        /**
         * @description An internal priority queue for keeping track of http requests.
         */
        var _queue = null;


        /**
         * @description Used to maintain a reference to all requests that are in progress.
         */
        var _inProgressRequests = {};


        /**
         * @description An event that is raised when an http request sent
         * through the Appsecute Api fails.
         * This event may be suppressed on an individual request by setting
         * suppressGlobal to true.
         */
        var _httpRequestFailed = new Event("Http Request Failed", this);


        /**
         * @description An event that is raised when a request for a resource results in the server
         * returning a 401 Unauthorized. This event should be used to trigger a login screen
         * which would then call the login method on the AppSnap Api. This event differs from
         * authenticationStatusChanged in that it is specifically used to start the login process.
         */
        var _authenticationRequired = new Event("Authentication Required", this);


        /**
         * @description The Appsecute Api constructor. Put any code here that must be run after
         * all properties and functions of the Appsecute Api have been defined.
         */
        var _initialize = function () {

            _queue = new PriorityQueue(_httpRequestPriorityComparer);

            // Don't do anything until the start document uri has been provided
            Start.startDocumentUriSet.subscribe(
                function () {
                    _processQueueTimer = setTimeout(_processQueue, _processQueueTimerInterval);
                },
                this);
        };


        /**
         * @description Executes an async HTTP request.
         * @param {Object} httpRequest The HTTP request to execute.
         */
        var _doHttpRequest = function (httpRequest) {

            _inProgressRequests[httpRequest.id] = httpRequest;

            HttpClient.executeHttpRequest(
                httpRequest,
                httpRequest.timeout || Settings.httpRequestTimeOut,
                _handleSuccessfulHttpRequest,
                _handleFailedHttpRequest
            );
        };


        /**
         * @description Processes a successful http request as appropriate.
         * @param {Object} httpRequest The Appsecute HttpRequest to process.
         * @param {Object} httpResponse The Appsecute HttpResponse associated with the request.
         */
        var _handleSuccessfulHttpRequest = function (httpRequest, httpResponse) {

            _numberOfInProgressHttpRequests--;

            if (_inProgressRequests[httpRequest.id]) {
                delete(_inProgressRequests[httpRequest.id]);
            }

            if (!httpRequest.isCancelled) {

                _logger.info(httpRequest.verb + " to '" + httpRequest.url + "' succeeded with status code " + httpResponse.status_code);

                if (Utils.isFunction(httpRequest.success)) {
                    if (httpRequest.context) {
                        httpRequest.success.apply(httpRequest.context, [httpRequest, httpResponse]);
                    } else {
                        httpRequest.success(httpRequest, httpResponse);
                    }
                }
            }
        };


        /**
         * @description Processes a failed http request as appropriate.
         * @param {Object} httpRequest The Appsecute HttpRequest to process.
         * @param {Object} httpResponse The Appsecute HttpResponse associated with the request.
         */
        var _handleFailedHttpRequest = function (httpRequest, httpResponse) {

            _numberOfInProgressHttpRequests--;

            if (_inProgressRequests[httpRequest.id]) {
                delete(_inProgressRequests[httpRequest.id]);
            }

            if (!httpRequest.isCancelled) {

                _logger.error(httpRequest.verb + " to '" + httpRequest.url + "' failed with status code " + httpResponse.status_code);

                httpRequest.failureCount++;
                httpRequest.lastFailureTime = new Date();
                httpRequest.failedDueToUnauthorized = httpResponse.status_code === 401;

                if (httpRequest.failedDueToUnauthorized) {
                    _authenticated = false;
                    _authenticationRequired.trigger(httpRequest, httpResponse);
                    _retry(httpRequest);
                } else if (Utils.isFunction(httpRequest.error)) {
                    if (httpRequest.context) {
                        httpRequest.error.apply(httpRequest.context, [httpRequest, httpResponse]);
                    } else {
                        httpRequest.error(httpRequest, httpResponse);
                    }
                }

                // Trigger the request failed event if it hasn't been suppressed
                if (httpRequest.suppressGlobal !== true && !httpRequest.failedDueToUnauthorized) {
                    _httpRequestFailed.trigger({request: httpRequest, response: httpResponse});
                }
            }
        };


        /**
         * @description Retries the provided HTTP request.
         * @param {Object} httpRequest The HTTP request to retry.
         */
        var _retry = function (httpRequest) {
            _queue.add(httpRequest);
            _kickQueue();
        };


        /**
         * @description A priority comparer that compares the priority
         * of HttpRequests.
         * @param {Object} a The left operand.
         * @param {Object} b The right operand.
         * @return {Number} The result of the comparison of the two HttpRequests.
         */
        var _httpRequestPriorityComparer = function (a, b) {

            if (a.priority === b.priority) {
                return 0;
            }

            if (a.priority > b.priority) {
                return 1;
            }

            return -1;
        };


        /**
         * @description Determines if the queue should be processed.
         * @returns {Boolean} true If the queue should be processed.
         */
        var _shouldProcessQueue = function () {

            var shouldProcessQueue = true;

            if (_queue.peek() === null) { // There's nothing to process

                shouldProcessQueue = false;

            } else if (_numberOfInProgressHttpRequests >= _maxSimultaneousHttpRequests) { // Max requests are in progress

                shouldProcessQueue = false;
            }

            return shouldProcessQueue;
        };


        /**
         * @description Processes the queue and initiates up to _maxSimultaneousHttpRequests
         * HTTP requests at any one time.
         * @param {Boolean} initiatedByKick Set to true if _processQueue was called
         * as the result of a "kick".
         */
        var _processQueue = function (initiatedByKick) {

            var requestsToRequeue = [];

            while (_shouldProcessQueue()) {

                var nextRequest = _queue.next();

                if (!nextRequest.isCancelled) {

                    // Don't send requests that are waiting on authentication
                    if (!nextRequest.failedDueToUnauthorized || (nextRequest.failedDueToUnauthorized && _authenticated === true)) {
                        _doHttpRequest(nextRequest);
                        _numberOfInProgressHttpRequests++;
                    } else {
                        requestsToRequeue.push(nextRequest);
                    }
                }
            }

            // Re-queue requests that are waiting on authentication
            var i;
            for (i = 0; i < requestsToRequeue.length; i++) {
                _queue.add(requestsToRequeue[i]);
            }

            if (initiatedByKick !== true) {
                _processQueueTimer = setTimeout(_processQueue, _processQueueTimerInterval);
            }
        };


        /**
         * @description Kicks the queue, causing it to immediately
         * process queued requests as appropriate.
         */
        var _kickQueue = function () {
            _processQueue(true);
        };


        /**
         * @description Cancels an http request that has been submitted to the Api.
         * @param httpRequest The request to cancel
         * @private
         */
        var _cancelRequest = function (httpRequest) {

            // Mark the request as cancelled
            httpRequest.isCancelled = true;

            // Abort the request if it is in progress
            if (httpRequest.handle) {
                httpRequest.handle.abort();
            }

            _logger.debug("Cancelled request to " + httpRequest.url);

            if (Utils.isFunction(httpRequest.cancelled)) {
                if (httpRequest.context) {
                    httpRequest.cancelled.apply(httpRequest.context, [httpRequest]);
                } else {
                    httpRequest.cancelled(httpRequest);
                }
            }
        };


        /**
         * @description Builds an http request from the supplied parameters and submits it to the queue.
         * @param verb The http verb of the request.
         * @param url The url of the request.
         * @param data The body of the request or null for get/delete.
         * @param options The request options.
         * @return {int} The id of the new request.
         * @private
         */
        var _submitHttpRequest = function (verb, url, data, options) {

            options = options || {};

            var httpRequest = {
                id: Utils.getGuid(),
                url: url,
                verb: verb,
                data: data,
                priority: options.priority || 1,
                state: options.state,
                description: options.description,
                success: options.success,
                error: options.error,
                context: options.context,
                headers: options.headers,
                suppressGlobal: options.suppressGlobal,
                timeout: options.timeout,
                tag: options.tag,
                failureCount: 0,
                isCancelled: false,
                failedDueToUnauthorized: false
            };

            _queue.add(httpRequest);

            _kickQueue();

            return httpRequest.id;
        };


        // Run the Appsecute Api constructor, this must always be the last line of code
        // executed before the return statement.
        _initialize();

        return {

            /**
             * @description An event that is raised when an http request sent
             * through the Appsecute Api fails.
             * This event may be suppressed on an individual request by setting
             * suppressGlobal to true.
             */
            httpRequestFailed: _httpRequestFailed,


            /**
             * @description An event that is raised when the number of items in
             * the queue changes.
             */
            queueSizeChanged: _queue.queueSizeChanged,


            /**
             * @description An event that is raised when a request for a resource results in the server
             * returning a 401 Unauthorized. This event should be used to trigger a login screen
             * which would then call the login method on the AppSnap Api. This event differs from
             * authenticationStatusChanged in that it is specifically used to start the login process.
             */
            authenticationRequired: _authenticationRequired,


            /**
             * @description Sets the start document uri of an Appsecute application.
             * This must be set for the Api to function.
             * @param {string} uri The uri to the Appsecute start document.
             */
            setStartDocumentUri: function (uri) {
                Start.setStartDocumentUri(uri);
            },


            /**
             * Sets the start document from a local object instead of fetching it from a remote server.
             * Very hacky but can be used as a workaround if the remote server doesn't support a start/root document.
             * @param {Object} start_document The local start document to set.
             */
            setLocalStartDocument: function (start_document) {
                Start.setLocalStartDocument(start_document);
            },


            /**
             * @description Gets a copy of all queued http requests.
             * This may be used to present a list of queued requests to an end user
             * to give them visibility of what is waiting to be sent.
             * This is extremely useful in offline applications.
             */
            getQueuedRequests: function () {

                var queuedRequests = [],
                    i = 0;

                for (i = 0; i < _queue.count(); i++) {
                    queuedRequests.push(_queue.peekAtIndex(i))
                }

                return queuedRequests;
            },


            /**
             * @description Cancels a single request submitted to the Appsecute.Api.
             * @param {String} id The unique id of the request to cancel.
             */
            cancelById: function (id) {

                if (_inProgressRequests[id]) {
                    // Cancel the request if it is in progress
                    _cancelRequest(_inProgressRequests[id]);
                } else {
                    // Cancel the request if it is sitting in the queue
                    var i;
                    for (i = 0; i < _queue.count(); i++) {

                        var request = _queue.peekAtIndex(i);

                        if (request.id === id) {
                            _cancelRequest(request);
                            _queue.removeAtIndex(i);
                            break;
                        }
                    }
                }
            },


            /**
             * @description Cancels a group of requests submitted to the Appsecute.Api.
             * @param {String} tag The tag that was assigned to the requests to cancel.
             */
            cancelByTag: function (tag) {

                // Cancel requests with this tag that are in progress
                var key;
                for (key in _inProgressRequests) {
                    if (_inProgressRequests.hasOwnProperty(key)) {

                        var inProgressRequest = _inProgressRequests[key];

                        if (inProgressRequest.tag === tag) {
                            _cancelRequest(inProgressRequest);
                        }
                    }
                }

                // Cancel requests with this tag that are sitting in the queue
                var i,
                    foundRequest = false;
                for (i = 0; i < _queue.count(); i++) {

                    var request = _queue.peekAtIndex(i);

                    if (request.tag === tag) {
                        _cancelRequest(request);
                        _queue.removeAtIndex(i);
                        foundRequest = true;
                        break;
                    }
                }

                // Go back around again until there are no more
                if (foundRequest) {
                    this.cancelByTag(tag);
                }
            },


            /**
             * @description Retries the provided HTTP request.
             * @param {Object} httpRequest The HTTP request to retry.
             */
            retry: function (httpRequest) {
                _retry(httpRequest);
            },


            /**
             * @description Restarts queue processing, used in cases where the queue has been paused (For example if authentication
             * was required).
             */
            restart: function () {
                _authenticated = true;
                _kickQueue();
            },


            get: function (url, options) {
                return _submitHttpRequest("GET", url, null, options);
            },


            put: function (url, data, options) {
                return _submitHttpRequest("PUT", url, data, options);
            },


            post: function (url, data, options) {
                return _submitHttpRequest("POST", url, data, options);
            },


            delete_: function (url, options) {
                return _submitHttpRequest("DELETE", url, null, options);
            }
        }
    }
);