/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'async',
    'appsecute-api/lib/logger'],
    function (Async, Logger) {

        var logger = new Logger('Startup'),
            startup_dialog = null;

        /*
         * At minimum define the path to the step-*.js file that exposes a run(done) function. Steps will be run in
         * order. To have a step exposed in the startup dialog UI define a start and finish text string.
         */
        var steps = [
            {path: 'startup/step-register-namespace'},
            {path: 'startup/step-localize'},
            {path: 'startup/step-configure-api'},
            {path: 'startup/step-wait-auth', start: 'layout.bootstrap.auth', finish: 'layout.bootstrap.auth_done'},
            {path: 'startup/step-wait-cc', start: 'layout.bootstrap.cc', finish: 'layout.bootstrap.cc_done'},
            {path: 'startup/step-wait-srest', start: 'layout.bootstrap.rest', finish: 'layout.bootstrap.rest_done'},
            {path: 'startup/step-first-setup', start: 'layout.bootstrap.license', finish: 'layout.bootstrap.license_done'},
            {path: 'startup/step-settings', start: 'layout.bootstrap.settings', finish: 'layout.bootstrap.settings_done'},
            {path: 'startup/step-get-user', start: 'layout.bootstrap.user', finish: 'layout.bootstrap.user_done'},
            {path: 'startup/step-pingback'},
            {path: 'startup/step-routers'},
            {path: 'startup/step-page'},
            {path: 'startup/step-routing'}
        ];

        var showStartupDialog = function (done) {

            require(['views/startup/startup-dialog'], function (StartupDialog) {
                startup_dialog = new StartupDialog({steps: steps});
                done();
            });
        };

        var runStep = function (step, done) {

            logger.debug('Running startup step at "' + step.path + '"');

            require([step.path], function (step_runner) {
                try {

                    if (startup_dialog) {
                        startup_dialog.startStep(step);
                    }

                    step_runner.run(function (err) {
                        if (startup_dialog) {
                            if (err) {
                                startup_dialog.failStep(step, err);
                            } else {
                                startup_dialog.finishStep(step);
                            }
                        }
                        done(err);
                    });

                } catch (e) {

                    if (startup_dialog) {
                        startup_dialog.failStep(step, e);
                    }

                    done(e);
                }
            });
        };

        return {

            doStartup: function (done) {

                /*
                 Note we can't show the startup dialog until we've applied localization.
                 */
                var localized = false;

                Async.eachSeries(
                    steps,
                    function (step, done) {

                        if (localized && !startup_dialog) {
                            showStartupDialog(function () {
                                runStep(step, done);
                            });
                        } else {
                            runStep(step, done);
                        }

                        if (step.path.indexOf('localize') !== -1) {
                            localized = true;
                        }
                    },
                    function (err) {
                        // Leave the dialog open (displaying the error) if there is an error
                        if (!err) {
                            startup_dialog.close();
                        }
                        done(err);
                    });
            }
        }
    }
);