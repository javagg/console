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

                headerText: polyglot.t('store.clone_repo'),

                dialogId: "clone-app-dialog",

                render: function () {
                    var bodyTemplate = _.template($(StoreTemplate).filter('#clone-app-dialog-body').html().trim(), {repo_src: this.options.repo_src, repo_name: this.options.repo_name, repo_branch: this.options.repo_branch});
                    this.el.html(bodyTemplate);
                }
            }
        );
    }
);
