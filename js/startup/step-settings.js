/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'util/settings'],
    function (Settings) {

        return {
            run: function (done) {
                Settings.refreshServerSettings(function (err) {
                    if (err) {return done(err);}

                    var settings = Settings.getSettings();

                    // Use the product name to set the window title
                    document.title = (settings.product_name + ' - ' + settings.company_name);

                    // Set the favicon
                    $("#favicon").attr("href", settings.product_logo_favicon_url);

                    // NOTE: apply additional theme colors in this statement
                    $("head").append("<style type=\"text/css\" charset=\"utf-8\"> body{background-color:" + settings.background_color + "}</style>");

                    // This must be the last theme/styling to be applied
                    if (settings.style) {
                        $("head").append("<style type=\"text/css\" charset=\"utf-8\">" + settings.style + "</style>");
                    }

                    done(null);
                });
            }
        }
    }
);