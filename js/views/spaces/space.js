/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'access/access-control',
    'appsecute-api/lib/logger',
    'views/stream/stream',
    'views/lists/list-view',
    'views/lists/application-table-view',
    'views/lists/service-table-view',
    'views/lists/space-user-membership-table-view',
    'text!util/templates/alert.html',
    'text!views/spaces/templates/space.ejs'],
    function ($, Backbone, _, Polyglot, AccessControl, Logger, StreamView, ListView, ApplicationTableView, ServiceTableView, UserTableView, AlertTemplate, SpaceTemplate) {

        return Backbone.View.extend({

            logger: new Logger('Space'),

            events: {
                "click .btn-delete": "deleteSpaceClicked",
                "click .btn-rename": "renameSpaceClicked",
                "click .btn-save": "saveSpaceNameClicked",
                "click .btn-cancel": "cancelSpaceRenameClicked",
                "click .btn-set-as-default": "setAsDefaultClicked",
                "click .btn-unset-as-default": "unsetAsDefaultClicked",
                "click #space_tabs li a": "spaceTabClicked",
                "click .btn-add-manager-to-space": "addManagerClicked",
                "click .btn-add-developer-to-space": "addDeveloperClicked",
                "click .btn-add-auditor-to-space": "addAuditorClicked"
            },

            initialize: function () {
                this.getSpace();
                this.options.sub_view = this.options.sub_view || 'applications';
            },

            render: function () {

                var template = _.template(SpaceTemplate, {space: this.space.entity });

                $(template)
                    .appendTo(this.el);

                this.options.sub_view = this.options.sub_view || 'applications';
                this.$('#space_tabs li a[href=#tab_' + this.options.sub_view + ']').click();
                sconsole.routers.spaces.navigate('spaces/' + this.options.space_guid + '/' + this.options.sub_view, {trigger: false});

                this.renderRestrictedControls();
                this.renderStreamView();
                this.renderApps();
                this.renderServices();
                this.renderManagersTable();
                this.renderDevelopersTable();
                this.renderAuditorsTable();

                this.$('#space_tabs li a[href=#tab_' + this.options.sub_view + ']').click();
            },

            spaceTabClicked: function (e) {
                e.preventDefault();
                $(this).tab('show');
                var sub_view = $(e.target).attr('href').substring(5);
                sconsole.routers.spaces.navigate('spaces/' + this.options.space_guid + '/' + sub_view, {trigger: false});

            },

            renderRestrictedControls: function () {

                var self = this;

                if (AccessControl.isAdmin()) {
                    if (self.space.entity.is_default) {
                        self.$('.btn-unset-as-default').show();
                    }
                    else {
                        self.$('.btn-set-as-default').show();
                    }
                }

                AccessControl.isAllowed(
                    this.options.space_guid,
                    AccessControl.resources.space,
                    AccessControl.actions.update,
                    function () {
                        self.$('.btn-rename').show();
                        self.$('.tab-pane .tab-actions').show();
                    });

                AccessControl.isAllowed(
                    this.options.space_guid,
                    AccessControl.resources.space,
                    AccessControl.actions.delete,
                    function () {
                        self.$('.btn-delete').show();
                    });
            },

            renderStreamView: function () {
                this.stream_view = new StreamView({el: this.$('.stream'), space_guid: this.options.space_guid});
            },

            renderApps: function () {

                var self = this;

                this.apps_list = new ApplicationTableView({
                    el: $('<div class="apps-table-view">').appendTo(this.$('.apps-table')),
                    context: this,
                    paging_style: 'replace',
                    collection: sconsole.cf_api.apps,
                    collection_options: {
                        filter: {name: 'space_guid', value: this.options.space_guid}
                    },
                    resource_clicked: function (app, e) {
                        e.preventDefault();
                        self.applicationClicked.call(self, app);
                    },
                    makeNoResourceMessageEl: function () {
                        return $('<div>', {'class': 'text-muted', html: polyglot.t('space.no_apps')});
                    }
                });
            },

            renderServices: function () {
                var that = this;

                this.service_instances = new ServiceTableView({
                    el: $('<div class="services-table-view">').appendTo(this.$('.services-table')),
                    context: this,
                    paging_style: 'replace',
                    disable_search_bar: true, // TODO /v2/service_instances doesn't seem to have picked up the wildcard search functionality
                    collection: sconsole.cf_api.service_instances,
                    collection_options: {filter: {name: 'space_guid', value: this.options.space_guid}, queries: {'inline-relations-depth': 2}},
                    resource_clicked: that.serviceClicked,
                    makeNoResourceMessageEl: function () {
                        return $('<div>', {'class': 'text-muted', html: polyglot.t('space.no_services')});
                    }
                });
            },

            renderManagersTable: function () {
                // must pass space_guid or roles will not be populated
                var space_guid = this.space.metadata.guid;
                var that = this;
                sconsole.cf_api.spaces.managers(space_guid).list({}, function (err, users_page) {
                    that.manager_table = new UserTableView({
                        space_guid: space_guid,
                        user_type: 'managers',
                        page: users_page,
                        el: $('<div>').appendTo(that.$('.managers-table')),
                        resource_clicked: that.userClicked,
                        click_handlers: {removeUserClicked: that.removeManagerClicked},
                        context: that
                    });
                });
            },

            renderDevelopersTable: function () {
                // must pass space_guid or roles will not be populated
                var space_guid = this.space.metadata.guid;
                var that = this;
                sconsole.cf_api.spaces.developers(space_guid).list({}, function (err, users_page) {
                    that.developer_table = new UserTableView({
                        space_guid: space_guid,
                        user_type: 'developers',
                        page: users_page,
                        el: $('<div>').appendTo(that.$('.developers-table')),
                        resource_clicked: that.userClicked,
                        click_handlers: {removeUserClicked: that.removeDeveloperClicked},
                        context: that
                    });
                });
            },

            renderAuditorsTable: function () {
                // must pass space_guid or roles will not be populated
                var space_guid = this.space.metadata.guid;
                var that = this;
                sconsole.cf_api.spaces.auditors(space_guid).list({}, function (err, users_page) {
                    that.auditor_table = new UserTableView({
                        space_guid: space_guid,
                        user_type: 'auditors',
                        page: users_page,
                        el: $('<div>').appendTo(that.$('.auditors-table')),
                        resource_clicked: that.userClicked,
                        click_handlers: {removeUserClicked: that.removeAuditorClicked},
                        context: that
                    });
                });
            },

            getSpace: function () {

                var self = this;
                sconsole.cf_api.spaces.get(this.options.space_guid, {queries: {'inline-relations-depth': 1}}, function (err, space) {
                    if (err) {
                        return self.logger.error(err);
                    }
                    self.options.activity.close();
                    self.space = space;
                    self.render();
                });
            },

            setAsDefaultClicked: function () {
                var self = this;
                sconsole.routers.spaces.showSetAsDefaultDialog(
                    this.space,
                    function (result) {
                        if (result && result.set_successfully) {
                            // replace sidebar link
                            self.$('.btn-set-as-default').hide();
                            self.$('.btn-unset-as-default').show();
                        }
                    },
                    this);
            },

            unsetAsDefaultClicked: function () {
                sconsole.routers.spaces.showUnsetAsDefaultDialog(
                    this.space,
                    function (result) {
                        if (result && result.unset_successfully) {
                            // replace sidebar link
                            self.$('.btn-unset-as-default').hide();
                            self.$('.btn-set-as-default').show();
                        }
                    },
                    this);
            },

            applicationClicked: function (app) {
                sconsole.routers.application.showApplication(app.metadata.guid);
            },

            userClicked: function (user, event) {
                if (AccessControl.isAdmin()) {
                    sconsole.routers.users.showUser(user.metadata.guid);
                }
            },

            serviceClicked: function (service_instance, e) {
                e.preventDefault();
                sconsole.routers.services.showService(service_instance.metadata.guid);
            },

            addManagerClicked: function () {

                var that = this;
                sconsole.routers.spaces.showAddUserDialog(
                    this.space.metadata.guid,
                    'manager',
                    function (result) {
                        if (result && result.added && result.new_user_guid) {
                            that.manager_table.close();
                            that.renderManagersTable()
                        }
                    },
                    this);

                return false;
            },

            removeManagerClicked: function (user, event) {
                var that = this;
                sconsole.routers.spaces.showRemoveUserDialog(
                    this.space.metadata.guid,
                    user,
                    'manager',
                    function (result) {
                        if (result && result.removed) {
                            that.manager_table.close();
                            that.renderManagersTable()
                        }
                    },
                    this);

                return false;
            },

            addDeveloperClicked: function () {
                var that = this;
                sconsole.routers.spaces.showAddUserDialog(
                    this.space.metadata.guid,
                    'developer',
                    function (result) {
                        if (result && result.added && result.new_user_guid) {
                            that.developer_table.close();
                            that.renderDevelopersTable()
                        }
                    },
                    this);

                return false;
            },

            removeDeveloperClicked: function (user, event) {
                var that = this;
                sconsole.routers.spaces.showRemoveUserDialog(
                    this.space.metadata.guid,
                    user,
                    'developer',
                    function (result) {
                        if (result && result.removed) {
                            that.developer_table.close();
                            that.renderDevelopersTable()
                        }
                    },
                    this);

                return false;
            },

            addAuditorClicked: function () {
                var that = this;
                sconsole.routers.spaces.showAddUserDialog(
                    this.space.metadata.guid,
                    'auditor',
                    function (result) {
                        if (result && result.added && result.new_user_guid) {
                            that.auditor_table.close();
                            that.renderAuditorsTable()
                        }
                    },
                    this);

                return false;
            },

            removeAuditorClicked: function (user, event) {
                var that = this;
                sconsole.routers.spaces.showRemoveUserDialog(
                    this.space.metadata.guid,
                    user,
                    'auditor',
                    function (result) {
                        if (result && result.removed) {
                            that.auditor_table.close();
                            that.renderAuditorsTable();
                        }
                    },
                    this);

                return false;
            },

            deleteSpaceClicked: function () {

                var organization_guid = this.space.entity.organization_guid;

                sconsole.routers.spaces.showDeleteSpaceDialog(
                    this.space.metadata.guid,
                    function (result) {
                        if (result && result.deleted) {
                            sconsole.routers.organizations.showOrganization(organization_guid);
                        }
                    },
                    this);
            },

            renameSpaceClicked: function () {

                var name_input = $('<input>', {'class': 'space-name-input', value: this.space.entity.name});

                if (!this.$('.btn-rename').attr('disabled')) {
                    this.$('.btn-rename').attr('disabled', true);

                    $('<button>', {'class': 'btn btn-primary btn-save', html: polyglot.t('space.rename.save')})
                        .appendTo(this.$('.space-buttons'));

                    $('<button>', {'class': 'btn btn-default btn-cancel', html: polyglot.t('space.rename.cancel')})
                        .appendTo(this.$('.space-buttons'));

                    this.$('.space-name').html(name_input);
                    this.$('.space-name-input').focus();
                }
            },

            resetRenameButtons: function () {

                this.$('.btn-rename').attr('disabled', false);
                this.$('.btn-save').remove();
                this.$('.btn-cancel').remove();

                this.renderRestrictedControls();
            },

            saveSpaceNameClicked: function () {

                var self = this,
                    new_name = this.$('.space-name-input').val();

                this.resetRenameButtons();

                this.$('.space-name').html($('<div>').text(new_name).html());

                sconsole.cf_api.spaces.update(this.space.metadata.guid, {name: new_name}, {}, function (err, space) {
                    if (err) {
                        self.$('.space-name').html($('<div>').text(self.space.entity.name).html());
                        return self.logger.error(err);
                    }

                    self.space = space;
                    self.$('.space-name-crumb').html($('<div>').text(new_name).html());
                });
            },

            cancelSpaceRenameClicked: function () {
                this.resetRenameButtons();
                this.$('.space-name').html($('<div>').text(this.space.entity.name).html());
            },

            close: function () {

                if (this.stream_view) {
                    this.stream_view.close();
                }

                if (this.apps_list) {
                    this.apps_list.close();
                }

                if (this.service_instance_list) {
                    this.service_instance_list.close();
                }

                this.remove();
                this.unbind();
            }
        });
    }
);
