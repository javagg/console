//
// Copyright (c) Appsecute 2013 - ALL RIGHTS RESERVED.
//

/**
 * @description Provides on-demand handling of a start document.
 */
define([
    'jquery',
    'underscore',
    'appsecute-api/lib/event',
    'appsecute-api/lib/logger',
    'appsecute-api/lib/utils',
    'appsecute-api/lib/settings'],
    function ($, _, Event, Logger, Utils, Settings) {

        /**
         * @description The uri of the start document.
         */
        var _startDocumentUri = null;


        /**
         * @description The cached start document.
         */
        var _startDocument = null;


        /**
         * @description A logger used for logging within the DocumentPath object.
         */
        var _logger = new Logger("Start");


        /**
         * @description An event that is raised when the uri to the start document has
         * been set.
         */
        var _startDocumentUriSet = new Event("Start Document Uri Set", this);


        /**
         * @description Keep track of if we have refreshed the start
         * document. This is used if an attempt is made to retrieve
         * a start document uri that doesn't exist on the cache document.
         */
        var _haveRefreshedStartDocument = false;


        /**
         * @description A state variable used to track if the retrieval of the start document is in progress.
         */
        var _fetchingStartDocument = false;


        /**
         * @description An array of callbacks that are waiting on the start document to be retrieved.
         */
        var _queuedCallbacks = [];


        /**
         * @description Gets an array of all callbacks that are queued waiting on the start document.
         */
        var _getQueuedCallbacks = function () {

            var callbacks = _queuedCallbacks.slice(0);

            _queuedCallbacks = [];

            return callbacks;
        };


        /**
         * @description Retrieves the specified uri from the start document.
         * @param {string} name The name of the uri on the start document to retrieve.
         * @param {function} success A function that will be called when the uri has successfully
         * been retrieved.
         * @param {function} error A function that will be called if there is an error
         * retrieving the uri from the start document.
         */
        var _getUri = function (name, success, error) {

            var shouldFetchStartDocument = true;

            if (_startDocument) {
                if (_startDocument.hasOwnProperty(name)) {

                    shouldFetchStartDocument = false;

                    if (Utils.isFunction(success)) {
                        success(_startDocument[name]);
                    }
                } else {
                    if (!_haveRefreshedStartDocument) {
                        _startDocument = null;
                        _haveRefreshedStartDocument = true;
                    } else {
                        shouldFetchStartDocument = false;

                        if (Utils.isFunction(error)) {
                            _logger.error("Unable to find start document uri with name '" + name + "'.");
                            error("NOT_FOUND");
                        }
                    }
                }
            }

            if (shouldFetchStartDocument) {

                if (!_startDocumentUri) {
                    throw("Unable to read Start Document because _startDocumentUri not set");
                }

                _queuedCallbacks.push({
                    name: name,
                    success: success,
                    error: error
                });

                if (!_fetchingStartDocument) {

                    _fetchingStartDocument = true;

                    require(['appsecute-api/lib/http-client'], function (HttpClient) {

                            var httpRequest = {
                                url: _startDocumentUri,
                                verb: "GET",
                                data: null
                            };

                            HttpClient.executeHttpRequest(
                                httpRequest,
                                Settings.httpRequestTimeOut,
                                function (req, res) {

                                    _fetchingStartDocument = false;
                                    _startDocument = res.body;

                                    var callbacks = _getQueuedCallbacks();

                                    $.each(callbacks, function (index, item) {
                                        _getUri(item.name, item.success, item.error);
                                    });
                                },
                                function (req, res) {

                                    _fetchingStartDocument = false;

                                    var callbacks = _getQueuedCallbacks();

                                    $.each(callbacks, function (index, item) {
                                        if (Utils.isFunction(item.error)) {
                                            item.error("START_DOCUMENT_FAILED", httpRequest, res);
                                        }
                                    });
                                }
                            );
                        }
                    )
                    ;
                }
            }
        };

        return {

            /**
             * @description An event that is raised when the uri to the start document has
             * been set.
             */
            startDocumentUriSet: _startDocumentUriSet,


            /**
             * @description Sets the uri to the start document.
             * @param {string} startDocumentUri The uri to the start document.
             */
            setStartDocumentUri: function (startDocumentUri) {
                _startDocumentUri = startDocumentUri;
                _startDocumentUriSet.trigger({uri: _startDocumentUri});
            },


            /**
             * Sets the start document from a local object instead of fetching it from a remote server.
             * Very hacky but can be used as a workaround if the remote server doesn't support a start/root document.
             * @param {Object} start_document The local start document to set.
             */
            setLocalStartDocument: function (start_document) {
                _startDocument = start_document;
                _startDocumentUriSet.trigger({uri: null});
            },


            /**
             * @description Retrieves the specified uri from the start document.
             * @param {string} name The name of the uri on the start document to retrieve.
             * @param {function} success A function that will be called when the uri has successfully
             * been retrieved.
             * @param {function} error A function that will be called if there is an error
             * retrieving the uri from the start document.
             */
            getUri: function (name, success, error) {
                _getUri(name, success, error);
            },


            /**
             * Gets the Uri of the start document itself, or null if the start document Uri has not yet been set.
             */
            getStartDocumentUri: function () {
                return _startDocumentUri;
            }
        }
    }
)
;