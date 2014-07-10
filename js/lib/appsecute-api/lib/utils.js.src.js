//
// Copyright (c) Appsecute 2013 - ALL RIGHTS RESERVED.
//

/**
 * @description A collection of static utility methods.
 */
define([
    'underscore',
    'moment'],
    function (_, moment) {

        return {

            /**
             * @description Determines if the provided object is a function.
             * @param {Function} object The object to check for being a function.
             * @return True if the provided object is a function.
             */
            isFunction: function (object) {
                return _.isFunction(object);
            },

            /**
             * @description Determines if the provided string is a url.
             * Supports full and relative urls.
             * @param {string} str The string to check.
             * @returns {Boolean} True if the string is a url.
             */
            isUrl: function (str) {

                if (!str) {
                    return false;
                }

                if (str.substring(0, 1) === "/") {
                    return true;
                }

                var regexp = new RegExp("(http|https){0,1}(:\/\/){0,1}w*(..\/)+([a-zA-Z0-9])+(.[A-Za-z]){0,1}", "i");

                return regexp.test(str);
            },

            /**
             * Douglas Crockford's code example for parsing a URL, taken from here:
             * http://www.coderholic.com/javascript-the-good-parts/
             * @param {string} url The URL string to parse
             * @returns {object} An object containing the parts of the URL as properties, with the following names:
             * 'url' (the full URL), 'scheme', 'slash', 'host', 'port', 'path', 'query', 'hash'
             */
            parseUrl: function (url) {
                var parse_url = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
                var resultMatches = parse_url.exec(url);

                // Go through the results setting properties with the specified names
                var names = ['url', 'scheme', 'slash', 'host', 'port', 'path', 'query', 'hash'];
                var i;
                var result = {};
                for (i = 0; i < names.length; i += 1) {
                    result[names[i]] = resultMatches[i];
                }
                return result;
            },

            /**
             * Reconstructs a server URL (to a resource on the server) from a path fragment taken from the route we are navigating to.
             * The scheme, host and port are taken from the start document, or failing that, the current window location.
             * @param {string} clientPath The path taken from a client-side route; all of this will be added to the server URL.
             * @returns {string} A full absolute URL to the resource on the server.
             */
            reconstructServerUrl: function (clientPath) {

                var result;
                var StartDocument = require('appsecute-api/lib/start');

                var startDocumentUri = StartDocument.getStartDocumentUri();

                if (startDocumentUri) {
                    // We have a start document Uri set, so find the start of the server URL from that
                    var urlParts = this.parseUrl(startDocumentUri);

                    // Only use this start document if it is absolute, i.e. it has the bits we need
                    if (urlParts.scheme && urlParts.slash && urlParts.host) {
                        result = urlParts.scheme + ":" + urlParts.slash + urlParts.host;

                        // Add the port if it's present
                        if (urlParts.port) {
                            result += ":" + urlParts.port;
                        }
                    }
                }

                if (!result) {
                    // We can't get the information from the start document URL;
                    // use the current window's URL as a guess at the server scheme, host and port.
                    // THIS WILL FAIL if the site on a different domain from the web services
                    // Note that window.location.protocol includes the ':' character, and window.location.host includes the port.
                    result = window.location.protocol + "//" + window.location.host;
                }

                // The entire path of the result should come from the client fragment
                result += "/" + clientPath;

                return result;
            },

            /**
             * @description Generates an RFC4122-compliant GUID.
             * See http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript.
             * @returns {String} A unique RFC4122-compliant GUID.
             */
            getGuid: function () {
                var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
                    function (c) {
                        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    }).toUpperCase();

                return guid;
            },

            /**
             * @description Processes a string of HTTP headers to a dictionary of key/values.
             * @param {string} httpHeaders The HTTP headers string to process.
             * @returns {Object} The HTTP headers as a dictionary of key/values.
             */
            processHttpHeaders: function (httpHeaders) {

                var headerRegex = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;
                var match;
                var headers = {};

                while (true) {

                    match = headerRegex.exec(httpHeaders);

                    if (!match) {
                        break;
                    } else {
                        headers[match[1].toLowerCase()] = match[2];
                    }
                }

                return headers;
            },

            /**
             * @description Gets the cookie with the specified name.
             * @param cookieName {String} The name of the cookie to retrieve.
             * @returns {String} The value of the specified cookie or null if it was not found.
             */
            getCookie: function (cookieName) {

                var i,
                    x,
                    y,
                    value = null,
                    allCookies = document.cookie.split(";");

                for (i = 0; i < allCookies.length; i++) {

                    x = allCookies[i].substr(0, allCookies[i].indexOf("="));
                    y = allCookies[i].substr(allCookies[i].indexOf("=") + 1);

                    x = x.replace(/^\s+|\s+$/g, "");

                    if (x === cookieName) {
                        value = unescape(y);
                        break;
                    }
                }

                return value;
            },

            /**
             * @description Sets the specified cookie.
             * @param {string} name The name of the cookie to set.
             * @param {string} value The value of the cookie.
             * @param {Date} expiry The expiry date of the cookie.
             * @param {string} path The path of the cookie, default is "/".
             * @param {string} domain The domain of the cookie. Default is current domain.
             * @param {Boolean} secure True if secure cookie.
             */
            setCookie: function (name, value, expiry, path, domain, secure) {
                document.cookie = name + "=" + escape(value) +
                    (expiry ? ";expires=" + expiry.toGMTString() : "" ) +
                    (path ? ";path=" + path : "" ) +
                    (domain ? ";domain=" + domain : "" ) +
                    (secure ? ";secure" : "" );
            },

            /**
             * @description Deletes the specified cookie.
             * @param {string} name The name of the cookie to delete.
             * @param {string} path The path of the cookie.
             * @param {string} domain The domain of the cookie.
             */
            deleteCookie: function (name, path, domain) {
                document.cookie = name + "=" +
                    ( ( path ) ? ";path=" + path : "") +
                    ( ( domain ) ? ";domain=" + domain : "" ) +
                    ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
            },

            /**
             * @description Formats a date to a human readable string.
             * @param {Date} date The date to format.
             * @param {Boolean} includeSeconds true to include seconds in the returned date string.
             * @returns {String} The supplied date as a human readable string.
             */
            getDateString: function (date, includeSeconds) {
                return moment(date).format('MM/DD/YYYY HH:mm' + (includeSeconds ? ':ss' : ''));
            },

            /**
             * @description Checks if the specified object is an array.
             * @param obj The object to check.
             * @return {Boolean} True if the object is an array.
             */
            isArray: function (obj) {
                return _.isArray(obj);
            },

            /**
             * Returns true if str ends with suffix.
             */
            strEndsWith: function (str, suffix) {
                return str.indexOf(suffix, str.length - suffix.length) !== -1;
            }
        };
    }
);