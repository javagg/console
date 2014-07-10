/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define(['jquery'],
    function ($) {
        return {
            // enable, switch to enabled style
            activate: function(button) {
                button.removeClass("disabled").removeAttr("disabled");
                button.removeClass("btn-default").addClass("btn-primary");
            },
            
            // disable, switch to data-loading-text
            saving: function(button) {
                button.addClass("disabled").attr("disabled", "disabled");
                button.data('initialText', button.html());
                button.html(button.data('loadingText'));
            },
            
            // leave disabled; show success text for a second, then revert
            // to original text and disabled style
            saveSuccess: function(button) {
                button.html(button.data('doneText'));
                
                setTimeout(function() {
                    button.html(button.data('initialText'));
                    button.removeClass("btn-primary").addClass("btn-default");
                }, 1000);
            },
            
            // re-enable, revert to original text
            saveFailure: function(button) {
                button.removeClass("disabled").removeAttr("disabled");
                button.html(button.data('initialText'));
            }
        }
    }
)