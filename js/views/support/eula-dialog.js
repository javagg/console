/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */



define([
    'jquery',
    'util/base-dialog',
    'util/settings'],
    function ($, BaseDialog, Settings) {

        return BaseDialog.extend({

                headerText: polyglot.t('support.eula'),

                dialogId: "eula-dialog",

                render: function () {

                    var eula_template = Settings.getSetting('eula_template'),
                        bodyTemplate = _.template(eula_template, {settings: Settings.getSettings()});

                    this.el.html(bodyTemplate);
                }
            }
        );
    }
);