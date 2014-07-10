/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'appsecute-api/lib/logger',
    'util/activity-indicator',
    'access/access-control',
    'views/domains/domain-table',
    'views/lists/space-table-view',
    'views/lists/org-user-membership-table-view',
    'text!util/templates/alert.html',
    'text!views/organizations/templates/organization-usage.html',
    'text!views/organizations/templates/organization.ejs'],
    function ($, Backbone, _, Polyglot, Logger, Activity, AccessControl, DomainTable, SpaceTableView, UserTableView, AlertTemplate, OrgUsageTemplate, OrganizationTemplate) {

        return Backbone.View.extend({

            logger: new Logger('Organization'),

            events: {
                "click .btn-rename": "renameOrgClicked",
                "click .btn-save-rename": "saveOrgNameClicked",
                "click .btn-cancel-rename": "cancelOrgRenameClicked",
                "click .btn-set-as-default": "setAsDefaultClicked",
                "click .btn-unset-as-default": "unsetAsDefaultClicked",
                "click #organization_tabs li a": "organizationTabClicked",
                "click .btn-add-space": "createSpaceClicked",
                "click .btn-add-user-to-org": "addUserClicked",
                "click .btn-edit-quota": "editQuotaClicked",
                "click .btn-create-domain": "createDomainClicked",
                "click .btn-delete": "deleteOrganizationClicked"
            },

            initialize: function () {
                this.options.sub_view = this.options.sub_view || 'spaces';
                this.getOrg();
            },

            getOrg: function () {

                var self = this;
                sconsole.cf_api.organizations.get(this.options.organization_guid, {queries: {'inline-relations-depth': 1, 'include-relations': 'quota_definition'}}, function (err, organization) {
                    if (err) {
                        return self.logger.error(err);
                    }
                    self.options.activity.close();
                    self.organization = organization;
                    self.render();
                    self.getOrgSummary();
                });
            },

            getOrgSummary: function () {

                var self = this,
                    activity = new Activity(this.$('.activity'));

                sconsole.cf_api.organizations.getSummary(this.options.organization_guid, {}, function (err, organization_summary) {
                    if (err) {
                        return self.logger.error(err);
                    }
                    activity.close();
                    self.organization_summary = organization_summary;
                    if (!self.organization_summary.spaces.length) {
                        // Can't deploy apps if there are no spaces set up
                        var callback = function (allowed) {
                            var msg = allowed ? 'organization.no_spaces_alert' : 'organization.no_spaces_need_admin_alert';

                            var template = _.template($(AlertTemplate).filter('#alert-danger').html().trim(), {'message': polyglot.t(msg) });

                            $(template)
                                .appendTo($('.messages'));
                        };
                        AccessControl.isAllowed(
                            self.options.organization_guid,
                            AccessControl.resources.space,
                            AccessControl.actions.create,
                            _.bind(callback, self, true),
                            _.bind(callback, self, false));
                    }
                    self.renderQuotaUsage();
                    self.renderSpaceTable();
                    self.renderUserTable();
                    self.renderDomains();
                });
            },

            render: function () {

                var template = _.template(OrganizationTemplate, {organization: this.organization });

                $(template)
                    .appendTo(this.el);

                this.$('#organization_tabs li a[href=#tab_' + this.options.sub_view + ']').click();

                this.renderRestrictedControls();
            },

            organizationTabClicked: function (e) {
                e.preventDefault();
                $(this).tab('show');
                var sub_view = $(e.target).attr('href').substring(5);
                sconsole.routers.organizations.navigate('organizations/' + this.options.organization_guid + '/' + sub_view, {trigger: false});
            },

            renderRestrictedControls: function () {

                var self = this;

                if (AccessControl.isAdmin()) {
                    self.$('.btn-edit-quota').show();
                }

                AccessControl.isAllowed(
                    self.options.organization_guid,
                    AccessControl.resources.organization,
                    AccessControl.actions.update,
                    function () {
                        self.$('.btn-rename').show();

                        // Technically org managers can add users to the org, so the access control check will pass
                        // but currently we don't have a way to add users that doesn't involve enumerating all existing
                        // ones. So we require admin.
                        if (AccessControl.isAdmin()) {
                            self.$('.btn-add-user-to-org').show();

                            if (self.organization.entity.is_default) {
                                self.$('.btn-unset-as-default').show();
                            }
                            else {
                                self.$('.btn-set-as-default').show();
                            }

                        }
                    });

                AccessControl.isAllowed(
                    self.options.organization_guid,
                    AccessControl.resources.organization,
                    AccessControl.actions.delete,
                    function () {
                        self.$('.btn-delete').show();
                    });

                AccessControl.isAllowed(
                    self.options.organization_guid,
                    AccessControl.resources.space,
                    AccessControl.actions.create,
                    function () {
                        self.$('.btn-add-space').show();
                    });

                AccessControl.isAllowed(
                    self.options.organization_guid,
                    AccessControl.resources.domain,
                    AccessControl.actions.create,
                    function () {
                        self.$('.btn-create-domain').show();
                    });
            },

            renderQuotaUsage: function () {

                var total_memory_usage = 0,
                    total_service_usage = 0;
                _.each(this.organization_summary.spaces, function (space_summary) {
                    total_memory_usage += space_summary.mem_dev_total;
                    total_memory_usage += space_summary.mem_prod_total;
                    total_service_usage += space_summary.service_count;
                });

                var usage_bar_width = total_memory_usage / this.organization.entity.quota_definition.entity.memory_limit * 100;
                var caption = Math.round(total_memory_usage / 1024 * 100) / 100 + " / " + this.organization.entity.quota_definition.entity.memory_limit / 1024 + " GB";
                var mem_template = _.template(OrgUsageTemplate, { title: polyglot.t('organization.memory'), usage_value: total_memory_usage, usage_bar_width: usage_bar_width, caption: caption });

                $(mem_template)
                    .appendTo($('.quota-usage'));


                usage_bar_width = total_service_usage / this.organization.entity.quota_definition.entity.total_services * 100;
                caption = total_service_usage + " / " + this.organization.entity.quota_definition.entity.total_services;
                var services_template = _.template(OrgUsageTemplate, { title: polyglot.t('organization.services'), usage_value: total_service_usage, usage_bar_width: usage_bar_width, caption: caption });

                $(services_template)
                    .appendTo($('.quota-usage'));
            },

            renderSpaceTable: function () {

                this.space_table = new SpaceTableView({
                    collection_options: {filter: {name: 'organization_guid', value: this.options.organization_guid}},
                    el: $('<div>').appendTo(this.$('.spaces-table')),
                    resource_clicked: this.spaceClicked,
                    click_handlers: {deleteSpaceClicked: this.deleteSpaceClicked},
                    context: this
                });
            },

            renderUserTable: function () {

                // must pass org_guid or roles will not be populated
                var org_guid = this.options.organization_guid;
                var that = this;
                sconsole.cf_api.organizations.users(org_guid).list({}, function (err, users_page) {
                    that.user_table = new UserTableView({
                        org_guid: org_guid,
                        page: users_page,
                        el: $('<div>').appendTo(that.$('.users-table')),
                        resource_clicked: that.userClicked,
                        click_handlers: {editUserClicked: that.editUserClicked, removeUserClicked: that.removeUserClicked},
                        context: that
                    });
                });
            },

            renderDomains: function () {

                this.domain_list = new DomainTable({
                    el: $('<div>').appendTo(this.$('.domain-list')),
                    collection: sconsole.cf_api.organizations.domains(this.options.organization_guid),
                    context: this,
                    paging_style: 'replace',
                    organization_guid: this.options.organization_guid,
                    click_handlers: {
                        deleteDomainClicked: this.deleteDomainClicked,
                        updateDomainClicked: this.updateDomainClicked},
                    resource_clicked: this.domainClicked
                });
            },


            domainClicked: function (domain, e) {

                e.preventDefault();

                // Don't let shared domains be edited via this orgs view, admins must go to the admin/orgs view
                if (!domain.entity.owning_organization_guid) {return;}

                var self = this;
                AccessControl.isAllowed(
                    domain.metadata.guid,
                    AccessControl.resources.domain,
                    AccessControl.actions.update,
                    function () {
                        self.updateDomainClicked(domain, e);
                    });
            },

            updateDomainClicked: function (domain, e) {

                e.preventDefault();

                sconsole.routers.domains.showUpdateDomainDialog(
                    domain,
                    function (result) {
                        if (result && result.updated) {
                            this.domain_list.close();
                            this.renderDomains();
                        }
                    },
                    this);
            },

            deleteDomainClicked: function (domain, e) {

                e.preventDefault();

                sconsole.routers.domains.showDeleteDomainDialog(
                    domain,
                    function (result) {
                        if (result && result.deleted) {
                            this.domain_list.close();
                            this.renderDomains();
                        }
                    },
                    this);
            },

            createDomainClicked: function (e) {

                e.preventDefault();

                sconsole.routers.domains.showCreateDomainDialog(
                    this.options.organization_guid,
                    function (result) {
                        if (result && result.created) {
                            this.domain_list.close();
                            this.renderDomains();
                        }
                    },
                    this);
            },

            renameOrgClicked: function () {

                var name_input = $('<input>', {'class': 'org-name-input form-control sane', value: this.organization.entity.name});

                if (!this.$('.btn-rename').attr("disabled")) {
                    this.$('.btn-rename').attr("disabled", true);

                    $('<button>', {'class': 'btn btn-primary btn-save-rename', html: polyglot.t('space.rename.save')})
                        .appendTo(this.$('.org-buttons'));

                    $('<button>', {'class': 'btn btn-default btn-cancel-rename', html: polyglot.t('space.rename.cancel')})
                        .appendTo(this.$('.org-buttons'));

                    this.$('.org-name').html(name_input);
                    this.$('.org-name-input').focus();
                }
            },

            resetRenameButtons: function () {

                this.$('.btn-rename').attr("disabled", false);
                this.$('.btn-save-rename').remove();
                this.$('.btn-cancel-rename').remove();

                this.renderRestrictedControls();
            },

            saveOrgNameClicked: function () {

                var self = this,
                    new_name = this.$('.org-name-input').val();

                this.resetRenameButtons();

                this.$('.org-name').html($('<div>').text(new_name).html());

                sconsole.cf_api.organizations.update(this.organization.metadata.guid, {name: new_name}, {}, function (err, org) {
                    if (err) {
                        self.$('.org-name').html( $('<div>').text(self.organization.entity.name).html());
                        return self.logger.error(err);
                    }

                    self.organization = org;
                    self.$('.org-name-crumb').html( $('<div>').text(new_name).html());
                });
            },

            cancelOrgRenameClicked: function () {
                this.resetRenameButtons();
                this.$('.org-name').html( $('<div>').text(this.organization.entity.name).html() );
            },

            setAsDefaultClicked: function () {
                var self = this;
                sconsole.routers.organizations.showSetAsDefaultDialog(
                    this.organization,
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
                sconsole.routers.organizations.showUnsetAsDefaultDialog(
                    this.organization,
                    function (result) {
                        if (result && result.unset_successfully) {
                            // replace sidebar link
                            self.$('.btn-unset-as-default').hide();
                            self.$('.btn-set-as-default').show();
                        }
                    },
                    this);
            },

            spaceClicked: function (space, click_event) {
                sconsole.routers.spaces.showSpace(space.metadata.guid);
            },

            createSpaceClicked: function (event) {
                event.preventDefault();
                sconsole.routers.organizations.showCreateSpaceDialog(
                    this.options.organization_guid,
                    function (result) {
                        if (result && result.guid) {
                            sconsole.routers.spaces.showSpace(result.guid);
                        }
                    },
                    this);
            },

            deleteSpaceClicked: function (space, event) {
                event.preventDefault();

                var that = this;
                sconsole.routers.spaces.showDeleteSpaceDialog(
                    space.metadata.guid,
                    function (result) {
                        if (result && result.deleted) {
                            that.space_table.close();
                            that.renderSpaceTable()
                        }
                    },
                    this);
            },

            userClicked: function (user, event) {
                if (AccessControl.isAdmin()) {
                    sconsole.routers.users.showUser(user.metadata.guid);
                }
            },

            addUserClicked: function (event) {
                event.preventDefault();
                var that = this;
                sconsole.routers.organizations.showAddUserDialog(
                    that.organization,
                    function (result) {
                        if (result && result.added) {
                            that.user_table.close();
                            that.renderUserTable();
                        }
                    },
                    that);
            },

            editUserClicked: function (user, event) {
                event.preventDefault();
                var that = this;
                sconsole.routers.organizations.showEditUserDialog(
                    user,
                    that.organization,
                    function (result) {
                        if (result && result.updated) {
                            that.user_table.close();
                            that.renderUserTable();
                        }
                    },
                    that);
            },

            removeUserClicked: function (user, event) {
                event.preventDefault();
                var that = this;
                sconsole.routers.organizations.showRemoveUserDialog(
                    user,
                    this.organization,
                    function (result) {
                        if (result && result.removed) {
                            that.user_table.close();
                            that.renderUserTable();
                        }
                    },
                    this);
            },

            editQuotaClicked: function (e) {

                var that = this;

                sconsole.routers.organizations.showEditQuotaDialog(
                    this.organization,
                    function (result) {
                        if (result && result.updated) {
                            sconsole.cf_api.organizations.get(this.options.organization_guid, {queries: {'inline-relations-depth': 1}}, function (err, organization) {
                                if (err) {
                                    return that.logger.error(err);
                                }

                                that.organization = organization;
                                that.$('.usage').remove();
                                that.renderQuotaUsage();
                            });
                        }
                    },
                    this);

                e.preventDefault();
            },

            deleteOrganizationClicked: function () {

                sconsole.routers.organizations.showDeleteOrganizationDialog(
                    this.organization,
                    function (result) {
                        if (result && result.deleted) {
                            sconsole.routers.organizations.showOrganizations();
                        }
                    },
                    this);
            },

            close: function () {

                if (this.stream_view) {
                    this.stream_view.close();
                }

                if (this.space_table) {
                    this.space_table.close();
                }

                if (this.user_table) {
                    this.user_table.close();
                }

                if (this.domain_list) {
                    this.domain_list.close();
                }

                this.remove();
                this.unbind();
            }
        });
    }
);
