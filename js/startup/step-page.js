/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'util/validation-rules',
    'util/maintenance-mode',
    'views/layout/header',
    'views/layout/footer'],
    function (ValidationRules, MaintenanceMode, HeaderView, FooterView) {

        return {
            run: function (done, setup_pending) {
                ValidationRules.loadRules();
                new HeaderView({el: $('#header-container'), setup_pending: setup_pending});
                new FooterView({el: $('#footer-container')});
                MaintenanceMode.startMaintenanceModeCheck();
                done(null);
            }
        }
    }
);
