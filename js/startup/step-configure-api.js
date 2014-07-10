/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'stackato-client-extension/stackato-client',
    'util/settings',
    'cloud-foundry-client/api',
    'appsecute-api/lib/utils',
    'appsecute-api/lib/logger',
    'views/errors/error-dialog'],
    function (StackatoClient, Settings, CFApi, Utils, Logger, ErrorDialog) {

        var makeErrorMessage = function (res, options) {

            var response_body = res.body;
            if (res.status_code == 0) {
                // show nice timeout message
                return polyglot.t('error.code.timeout', { product: Settings.getSettings().product_name });
            }
            if (typeof response_body !== 'string') {
                try {
                    if ("error_code" in response_body) {
                        var key = "error.code." + response_body.error_code;
                        var message = polyglot.t(key, {body: res.body, _: ""});
                        if (message && message != key) {
                            return message;
                        }
                    }
                } catch (e) {
                    /* the response is really odd? too bad. */
                }
                try {
                    response_body = JSON.stringify(response_body);
                } catch (e) {
                    /* eat it */
                }
            }

            return '<strong>Path:</strong> ' + $('<div>').text(options.path).html() +
                '<br><strong>Status:</strong> ' + parseInt(res.status_code, 10) +
                '<br><strong>Response:</strong> ' + $('<div>').text(response_body).html();
        };

        return {
            run: function (done) {

                var api_endpoint = '',
                    origin = window.location.origin;

                if (!origin) {
                    // not supported in all browsers (i.e. IE)
                    origin = window.location.protocol + "//"
                        + window.location.hostname
                        + (window.location.port ? ':' + window.location.port : '');
                }

                // If running from the filesystem then allow overriding API endpoint via a cookie
                if (origin.substring(0, 4) == "file" ||
                    origin.substring(0, 16) == "http://127.0.0.1") {
                    api_endpoint = Utils.getCookie("STACKATO_CONSOLE_API_ENDPOINT") || origin;
                }
                // Otherwise automatically determine the start document url
                else {
                    api_endpoint = origin;
                }

                var path = window.location.pathname,
                    path_no_html = path.replace('index.html', ''),
                    path_with_slash = Utils.strEndsWith(path_no_html, '/') ? path_no_html : (path_no_html + '/');

                StackatoClient.extendCloudFoundryClient();

                window.sconsole.cf_api = new CFApi(
                    api_endpoint, {
                        token: Utils.getCookie('cf_token'),
                        redirect_uri: origin + path_with_slash + 'oauth.html',
                        authorization_endpoint: api_endpoint + '/aok/uaa'
                    });

                window.sconsole.cf_api.on('http_error', function (err, res, options) {

                    var error = res ? new Error(makeErrorMessage(res, options)) : err;

                    if (!window.sconsole.error_dialog) {
                        window.sconsole.error_dialog = new ErrorDialog({error: error});
                        window.sconsole.error_dialog.on('hide', function (result) {
                            window.sconsole.error_dialog = null;
                        });
                    } else {
                        window.sconsole.error_dialog.showError(error);
                    }
                });

                sconsole.api_endpoint = api_endpoint;

                $.ajaxSetup({
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', sconsole.cf_api.makeAuthorizationHeader());
                    }
                });

                done(null);
            }
        }
    }
);
