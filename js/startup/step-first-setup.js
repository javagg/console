/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'routers/setup',
    'routers/support',
    'startup/step-page',
    'startup/step-routing',
    'util/settings'],
    function (SetupRouter, SupportRouter, StepPage, StepRouting, Settings) {

        return {
            run: function (done) {

                sconsole.cf_api.get('/v2/info', {}, function (err, res) {

                    // Need to hijack startup if setup hasn't been completed, don't call done()
                    if (!res.body.stackato.license_accepted) {
                        window.location.hash = '#setup';
                        window.sconsole.routers.setup = new SetupRouter();
                        window.sconsole.routers.support = new SupportRouter();
                        StepPage.run(function (err) {if (err) {done(err);}}, true);
                        StepRouting.run(function (err) {if (err) {done(err);}});
                        sconsole.startup_dialog.close();
                        // Note that at this point it's only default settings; in the logged-in case
                        // we'll pick up the server settings in the next step.
                        var settings = Settings.getSettings();
                        // Use the product name to set the window title
                        document.title = (settings.product_name + ' - ' + settings.company_name);
                    } else {
                        done(null);
                    }
                });
            }
        }
    }
);