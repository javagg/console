/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'appsecute-api/lib/utils',
    'access/access-control',
    'views/lists/table-view',
    'text!views/lists/templates/space-user-membership-table-view-resource.ejs',
    'text!views/lists/templates/space-user-membership-table-view-page-container.ejs'],
    function ($, Backbone, _, Utils, AccessControl, TableView, TableResourceTemplate, TablePageContainerTemplate) {

        return TableView.extend({

            initialize: function () {

                if (!this.options.collection) {
                    this.options.collection = sconsole.cf_api.spaces;
                }

                // We don't yet support searching against users
                this.options.disable_search_bar = true;

                TableView.prototype.initialize.apply(this);
            },

            renderPageContainer: function () {

                var template = _.template(TablePageContainerTemplate, {user_type: this.options.user_type});

                this.$('.page')
                    .append(template);
            },

            makeResourceEl: function (resource) {
                return _.template(TableResourceTemplate, {resource: resource, is_admin: AccessControl.isAdmin() });
            },

            resourceRendered: function (resource, resource_el) {

                AccessControl.isAllowed(
                    this.options.space_guid,
                    AccessControl.resources.space,
                    AccessControl.actions.update,
                    function () {
                        $('.remove-user', resource_el).show();
                    }
                )
            },

            mutatePage: function (page, done) {
                var that = this;
                var user_guids = [];
                _.each(page.data.resources, function (user) {
                    user_guids.push(user.metadata.guid);
                });

                sconsole.cf_api.users.guidExchange(user_guids, 'id,userName,emails', function (err, user_attributes) {
                    if (err) {
                        return done(err);
                    }

                    sconsole.cf_api.get('/v2/spaces/' + that.options.space_guid + '?inline-relations-depth=1', {status_code: 200}, function (err, res) {
                        if (err) {return done(err);}

                        var auditor_guids = _.pluck(_.pluck(res.body.entity.auditors, 'metadata'), 'guid');
                        var developer_guids = _.pluck(_.pluck(res.body.entity.developers, 'metadata'), 'guid');
                        var manager_guids = _.pluck(_.pluck(res.body.entity.managers, 'metadata'), 'guid');

                        // TODO: Use some better data structures...
                        _.each(user_attributes.resources, function (user_attribute) {

                            _.each(page.data.resources, function (user) {
                                // set roles
                                var roles = [];
                                var is_auditor = false;
                                var is_developer = false;
                                var is_manager = false;
                                if (_.contains(auditor_guids, user.metadata.guid)) {
                                    roles.push(polyglot.t('space.role.auditor'));
                                    is_auditor = true;
                                }
                                if (_.contains(developer_guids, user.metadata.guid)) {
                                    roles.push(polyglot.t('space.role.developer'));
                                    is_billing_manager = true;
                                }
                                if (_.contains(manager_guids, user.metadata.guid)) {
                                    roles.push(polyglot.t('space.role.manager'));
                                    is_manager = true;
                                }

                                user.entity.roles = roles;
                                user.entity.is_auditor = is_auditor;
                                user.entity.is_developer = is_developer;
                                user.entity.is_manager = is_manager;

                                if (user.metadata.guid == user_attribute.id) {
                                    user.entity.username = user_attribute.userName;
                                    user.entity.email = user_attribute.emails.length > 0 ? user_attribute.emails[0].value : '';
                                }
                            });
                        });

                        done(null, page);
                    });
                });
            }
        });
    }
);
