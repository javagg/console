/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([],
    function () {
        return {

            make_random_id: function (id_length) {
                var text = "";
                var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

                for( var i=0; i < id_length; i++ )
                    text += possible.charAt(Math.floor(Math.random() * possible.length));

                return text;
            }
        }
    }
);