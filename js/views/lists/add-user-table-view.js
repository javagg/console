/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'appsecute-api/lib/utils',
    'views/lists/table-view',
    'text!views/lists/templates/add-user-table-view-resource.ejs',
    'text!views/lists/templates/add-user-table-view-page-container.ejs'],
    function ($, Backbone, _, Utils, TableView, TableResourceTemplate, TablePageContainerTemplate) {

        return TableView.extend({

            initialize: function () {

                if (!this.options.collection) {
                    this.options.collection = sconsole.cf_api.users;
                }

                // We don't yet support searching against users
                this.options.disable_search_bar = true;

                TableView.prototype.initialize.apply(this);
            },

            renderPageContainer: function () {

                var template = _.template(TablePageContainerTemplate, {});

                this.$('.page')
                    .append(template);
            },

            makeResourceEl: function (resource) {
                return _.template(TableResourceTemplate, {resource: resource});
            },

            mutatePage: function (page, done) {

                var user_guids = [];
                _.each(page.data.resources, function (user) {
                    user_guids.push(user.metadata.guid);
                });

                sconsole.cf_api.users.guidExchange(user_guids, 'id,userName,emails', function (err, user_attributes) {
                    if (err) {
                        return done(err);
                    }

                    // TODO: Use some better data structures...
                    _.each(user_attributes.resources, function (user_attribute) {
                        var page_index = 0;
                        _.each(page.data.resources, function (user) {
                            if (user.metadata.guid == user_attribute.id) {
                                user.entity.username = user_attribute.userName;
                                user.entity.email = user_attribute.emails.length > 0 ? user_attribute.emails[0].value : '';
                            }

                            if (user.metadata.guid == 'legacy-api') {
                                delete page.data.resources[page_index];
                            }

                            page_index++;
                        });
                    });

                    done(null, page);
                });
            }
        });
    }
);
