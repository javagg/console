//
// Copyright (c) Appsecute 2013 - ALL RIGHTS RESERVED.
//

/**
 * @description A class that wraps the HTTP functions of the AppSnap.Api, tagging every request with a unique id and
 * allowing all requests submitted through an instance of this class to be cancelled.
 */
define([
    'appsecute-api/lib/cclass',
    'appsecute-api/api',
    'appsecute-api/lib/utils'],
    function (CClass, Api, Utils) {

        return CClass.create(

            function () {

                var _tag = Utils.getGuid();

                return {

                    cancel:function () {
                        Api.cancelByTag(_tag);
                    },


                    get:function (url, options) {

                        options = options || {};
                        options.tag = _tag;

                        Api.get(url, options);
                    },


                    put:function (url, data, options) {

                        options = options || {};
                        options.tag = _tag;

                        Api.put(url, data, options);
                    },


                    post:function (url, data, options) {

                        options = options || {};
                        options.tag = _tag;

                        Api.post(url, data, options);
                    },


                    delete_:function (url, options) {

                        options = options || {};
                        options.tag = _tag;

                        Api.delete_(url, options);
                    }
                };
            }
        );
    }
);