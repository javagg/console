/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */



define([
    'jquery',
    'util/base-dialog',
    'text!views/spaces/templates/space-dialogs.html'],
    function ($, BaseDialog, SpaceDialogsTemplate) {

        return BaseDialog.extend({

                headerText: polyglot.t('space.remove_user'),

                dialogId: "remove-user-dialog",

                render: function () {

                    var that = this;
                    var bodyTemplate = _.template($(SpaceDialogsTemplate).filter('#remove-user-dialog-body').html().trim(), {});
                    this.el.html(bodyTemplate);
                    this.buttonContainer.prepend(_.template($(SpaceDialogsTemplate).filter('#remove-user-dialog-footer').html().trim(), {}));

                    var modal_header = this.el.prev();
                    $(".modal-title", modal_header).html(this.headerText + " " + $('<div>').text(this.options.user.entity.username).html());

                    $(".btn-remove", this.buttonContainer).click(function (event) {
                        that.removeClicked();
                    });

                    that.getSpace();
                },

                getSpace: function() {

                },

                removeClicked: function () {

                    var that = this;
                    this.$('.btn-remove').button('loading');

                    var space_guid = that.options.space_guid;
                    sconsole.cf_api.spaces.get(space_guid, {queries: {'inline-relations-depth': 2}}, function (err, space) {
                        if (err) {
                            that.$('.alert-danger').html(err);
                            return;
                        }
                        that.space = space;

                        var data = {};

                        if (that.options.user_type == 'manager') {
                            var managers = _.pluck(that.space.entity.managers, 'metadata');
                            var manager_guids = _.without(_.pluck(managers, 'guid'), that.options.user.metadata.guid);

                            data = {manager_guids: manager_guids};
                        }

                        if (that.options.user_type == 'developer') {
                            var developers = _.pluck(that.space.entity.developers, 'metadata');
                            var developer_guids = _.without(_.pluck(developers, 'guid'), that.options.user.metadata.guid);

                            data = {developer_guids: developer_guids};
                        }

                        if (that.options.user_type == 'auditor') {
                            var auditors = _.pluck(that.space.entity.auditors, 'metadata');
                            var auditor_guids = _.without(_.pluck(auditors, 'guid'), that.options.user.metadata.guid);

                            data = {auditor_guids: auditor_guids};
                        }

                        sconsole.cf_api.spaces.update(that.space.metadata.guid, data, {}, function(err, space){
                            if (err) {
                                that.$('.alert-danger').html(err);
                                return;
                            }

                            that.closeWithResult({ 'removed': true });
                        });

                    });



                    /* sconsole.cf_api.spaces.delete_(this.options.space_guid, {queries: {recursive: true}}, function (err, done) {

                        if (err) {
                            self.$('.alert-danger').html(err);
                            self.$('.btn-delete').remove();
                            return;
                        }

                        self.closeWithResult({deleted: true});
                    }); */
                }
            }
        );
    }
);
