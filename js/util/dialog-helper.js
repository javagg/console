//
// Copyright (c) Appsecute 2013 - ALL RIGHTS RESERVED.
//

define([
    'appsecute-api/lib/utils'],
    function (Utils) {
        return {
            showDialog: function (dialogView, params, closed, context) {
                require([dialogView], function (Dialog) {

                    var dialog = new Dialog(params);

                    dialog.on('hide', function (result) {
                        if (Utils.isFunction(closed)) {
                            if (context) {
                                closed.call(context, result);
                            } else {
                                closed(result);
                            }
                        }
                    });
                });
            }
        }
    }
);