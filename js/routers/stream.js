/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'backbone',
    'util/dialog-helper',
    'util/view-controller'],
    function (Backbone, DialogHelper, ViewController) {

        return Backbone.Router.extend({

            routes: {

            },

            viewController: new ViewController('.content'),

            showDeleteStreamContentDialog: function (closed, context) {
                DialogHelper.showDialog("views/stream/delete-stream-content-dialog", null, closed, context);
            }
        });
    }
);