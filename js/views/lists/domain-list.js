/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'access/access-control',
    'views/lists/list-view',
    'text!views/lists/templates/domain-resource.ejs'],
    function ($, Backbone, _, AccessControl, ListView, DomainResourceTemplate) {

        return ListView.extend({

            makeResourceEl: function (resource) {
                return  _.template(DomainResourceTemplate, {resource: resource});
            },

            resourceRendered: function (resource, resource_el) {

                // If we're listing domains for a space we don't want to show the update/delete buttons below
                if (this.options.space_guid) {
                    return;
                }

                // Don't show edit/delete buttons against shared domains when looking at a list of domains for an org
                // Admins should have to go to the admin/domains view to see these buttons so they understand that
                // using them will affect all orgs.
                if (!resource.entity.owning_organization_guid && this.options.organization_guid) {
                    $('.label-shared', resource_el).show();
                    return;
                }

                // Don't show edit/delete buttons against shared domains unless user is an admin
                if (!resource.entity.owning_organization_guid && !AccessControl.isAdmin()) {
                    $('.label-shared', resource_el).show();
                    return;
                }

                AccessControl.isAllowed(
                    resource.metadata.guid,
                    AccessControl.resources.domain,
                    AccessControl.actions.update,
                    function () {
                        $('.btn-update-domain', resource_el).show();
                    }
                );

                AccessControl.isAllowed(
                    resource.metadata.guid,
                    AccessControl.resources.domain,
                    AccessControl.actions.delete,
                    function () {
                        $('.btn-delete-domain', resource_el).show();
                    }
                );
            }
        });
    }
);