/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'views/domains/domain-table',
    'text!views/domains/templates/domain-admin.ejs'],
    function ($, Backbone, _, Polyglot, DomainTable, DomainAdminTemplate) {

        return Backbone.View.extend({

            events: {
                "click .create-domain": "createDomainClicked"
            },

            initialize: function () {
                this.options.activity.close();
                this.render();
            },

            render: function () {

                var template = _.template(DomainAdminTemplate, {});

                $(template)
                    .appendTo(this.el);

                this.renderDomains();
            },

            renderDomains: function () {

                this.domain_table = new DomainTable({
                    el: $('<div>').appendTo(this.$('.domains')),
                    resource_clicked: this.domainClicked,
                    click_handlers: {
                        domainOrganizationClicked: this.domainOrganizationClicked,
                        deleteDomainClicked: this.deleteDomainClicked,
                        updateDomainClicked: this.updateDomainClicked},
                    context: this
                });
            },

            createDomainClicked: function (e) {

                e.preventDefault();

                sconsole.routers.domains.showCreateDomainDialog(
                    null,
                    function (result) {
                        if (result && result.created) {
                            this.domain_table.close();
                            this.renderDomains();
                        }
                    },
                    this);
            },

            domainClicked: function (domain, click_event) {
                this.updateDomainClicked(domain, click_event);
            },

            updateDomainClicked: function (domain, e) {

                e.preventDefault();

                sconsole.routers.domains.showUpdateDomainDialog(
                    domain,
                    function (result) {
                        if (result && result.updated) {
                            this.domain_table.close();
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
                            this.domain_table.close();
                            this.renderDomains();
                        }
                    },
                    this);
            },

            domainOrganizationClicked: function (domain, e) {

                e.preventDefault();

                if (domain && domain.entity.owning_organization_guid) {
                    sconsole.routers.organizations.showOrganization(domain.entity.owning_organization_guid);
                }
            },

            close: function () {

                if (this.domain_table) {
                    this.domain_table.close();
                }

                this.remove();
                this.unbind();
            }
        });
    }
);