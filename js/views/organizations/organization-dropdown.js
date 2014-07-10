/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'appsecute-api/lib/logger',
    'text!views/organizations/templates/organization-dropdown.html'],
    function ($, Backbone, _, Polyglot, Logger, OrganizationDropdownTemplate) {

        return Backbone.View.extend({

            logger: new Logger('OrganizationDropdown'),

            initialize: function () {
                this.render();
                this.getOrganizations();
            },

            render: function () {

                var template = _.template($(OrganizationDropdownTemplate).filter('#organization-dropdown-template').html().trim(), {});

                $(template)
                    .appendTo(this.el);
            },

            getOrganizations: function () {

                var self = this;

                sconsole.cf_api.organizations.list({}, function (err, orgs) {
                    if (err) {return self.logger.error(err);}

                    _.each(orgs.data.resources, function (org) {

                        $('<li>', {role: 'presentation'})
                            .append($('<a>', {role: 'menuitem', 'href': '#', html: org.entity.name}))
                            .click(function (e) {
                                e.preventDefault();
                                self.orgClicked(org);
                            })
                            .appendTo('.org-dropdown .dropdown-menu');
                    });

                    if (self.options.organization) {
                        self.updateCurrentOrg(self.options.organization);
                    } else if (orgs.data.resources.length > 0) {
                        self.updateCurrentOrg(orgs.data.resources[0]);
                    }
                });
            },

            updateCurrentOrg: function (org) {
                this.current_org = org;
                this.$('.selected-org').html(org.entity.name);
                this.trigger('org-changed', org);
            },

            orgClicked: function (org) {
                this.updateCurrentOrg(org);
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
