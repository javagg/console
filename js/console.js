/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */
define([
        'jquery',
        'underscore',
        'bootstrap',
        'backbone',
        'startup/startup-manager',
        'appsecute-api/lib/logger'
    ],
    function ($, _, Bootstrap, Backbone, StartupManager, Logger) {

        return {

            logger: new Logger('Console'),

            initialize: function () {

                var self = this;
                StartupManager.doStartup(function (err) {
                    if (err) {
                        return self.logger.error('A fatal error occurred during startup: ' + err.message)
                    }
                    self.logger.info('Startup complete.')
                });
            }
        };
    }
);
