/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */



define([
    'jquery',
    'bootstrap-select',
    'util/base-dialog',
    'async',
    'views/lists/typeahead-bar',
    'views/lists/add-user-table-view',
    'text!views/spaces/templates/space-dialogs.html'],
    function ($, BootstrapSelect, BaseDialog, Async, TypeAheadBar, UserTableView, SpaceDialogsTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('space.add_user'),

                dialogId: "add-user-dialog",

                users: false,

                render: function () {

                    var that = this;
                    var bodyTemplate = _.template($(SpaceDialogsTemplate).filter('#add-user-dialog-body').html().trim(), {});
                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(SpaceDialogsTemplate).filter('#add-user-dialog-footer').html().trim(), {}));

                    var modal_header = this.el.prev();
                    $(".modal-title", modal_header).html(this.headerText + " " + polyglot.t('space.role.' + this.options.user_type));

                    $(".role-description", this.el).html(polyglot.t('space.role.' + this.options.user_type + ".help"));

                    $(".btn-add-user", this.buttonContainer).click(function (event) {
                        that.addUserClicked();
                    });

                    this.getSpace();
                },

                getSpace: function () {
                    var self = this;
                    var space_guid = self.options.space_guid;
                    sconsole.cf_api.spaces.get(space_guid, {queries: {'inline-relations-depth': 2}}, function (err, space) {
                        if (err) {
                            self.$('.alert-danger').html(err);
                            return;
                        }
                        self.space = space;
                        self.renderUsersTypeAhead();
                    });
                },

                renderUsersTypeAhead: function () {

                    this.user_type_ahead = new TypeAheadBar({
                        el: this.$('.user-select'),
                        collection: sconsole.cf_api.organizations.users(this.space.entity.organization_guid),
                        search_property: 'username',
                        placeholder: 'User'});

                    this.user_type_ahead.on('resource_selected', function (resource) {
                        if (resource) {
                            self.$('.user-select').removeClass('has-error');
                        }
                    });
                },

                addUserClicked: function () {

                    var self = this,
                        new_user = this.user_type_ahead.getSelectedResource();

                    if (!new_user) {return this.$('.user-select').addClass('has-error');}

                    $('.btn-add-user', this.buttonContainer).button('loading');

                    var data = {};

                    if (this.options.user_type == 'manager') {
                        var managers = _.pluck(self.space.entity.managers, 'metadata');
                        var manager_guids = _.pluck(managers, 'guid');
                        manager_guids.push(new_user.metadata.guid);

                        data = {manager_guids: manager_guids};
                    }

                    if (this.options.user_type == 'developer') {
                        var developers = _.pluck(self.space.entity.developers, 'metadata');
                        var developer_guids = _.pluck(developers, 'guid');
                        developer_guids.push(new_user.metadata.guid);

                        data = {developer_guids: developer_guids};
                    }

                    if (this.options.user_type == 'auditor') {
                        var auditors = _.pluck(self.space.entity.auditors, 'metadata');
                        var auditor_guids = _.pluck(auditors, 'guid');
                        auditor_guids.push(new_user.metadata.guid);

                        data = {auditor_guids: auditor_guids};
                    }

                    sconsole.cf_api.spaces.update(self.space.metadata.guid, data, {}, function (err, space) {
                        if (err) {
                            self.$('.alert-danger').html(err);
                            return;
                        }

                        self.closeWithResult({ 'added': true, 'new_user_guid': new_user.metadata.guid });
                    });
                }
            }
        );
    }
);
