/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */



define([
    'jquery',
    'polyglot',
    'jqueryvalidation',
    'util/base-dialog',
    'text!views/store/templates/store.html'],
    function ($, Polyglot, Validation, BaseDialog, StoreTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('store.deploy_app'),

                dialogId: "deploy-app-dialog",

                render: function () {

                    var bodyTemplate = _.template($(StoreTemplate).filter('#deploy-app-dialog-body').html().trim(),
                        { app_id: this.options.app_id,
                            app_name: this.options.app_name,
                            app_desc: this.options.app_desc,
                            app_img: this.options.app_img,
                            repo_src: this.options.repo_src,
                            repo_branch: this.options.repo_branch
                        });
                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(StoreTemplate).filter('#deploy-app-dialog-footer').html().trim(), {}));
                }
            }
        );
    }
);
