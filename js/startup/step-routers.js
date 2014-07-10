/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'access/admin-access',
    'routers/setup',
    'routers/stream',
    'routers/spaces',
    'routers/application',
    'routers/services',
    'routers/events',
    'routers/support',
    'routers/organizations',
    'routers/users',
    'routers/dashboard',
    'routers/eventlog',
    'routers/store',
    'routers/cluster',
    'routers/settings',
    'routers/welcome',
    'routers/domains',
    'routers/routes'],
    function (AdminAccess, SetupRouter, StreamRouter, SpacesRouter, ApplicationRouter, ServicesRouter, EventRouter, SupportRouter, OrganizationRouter, UsersRouter, DashboardRouter, EventLogRouter, StoreRouter, ClusterRouter, SettingsRouter, WelcomeRouter, DomainsRouter, RoutesRouter) {

        return {
            run: function (done) {

                window.sconsole.routers = {
                    stream: new StreamRouter(),
                    spaces: new SpacesRouter(),
                    application: new ApplicationRouter(),
                    events: new EventRouter(),
                    support: new SupportRouter(),
                    organizations: new OrganizationRouter(),
                    users: new UsersRouter(),
                    store: new StoreRouter(),
                    welcome: new WelcomeRouter(),
                    services: new ServicesRouter(),
                    domains: new DomainsRouter(),
                    routes: new RoutesRouter()
                };

                if (AdminAccess.isAdmin()) {
                    window.sconsole.routers.dashboard = new DashboardRouter();
                    window.sconsole.routers.eventlog = new EventLogRouter();
                    window.sconsole.routers.cluster = new ClusterRouter();
                    window.sconsole.routers.settings = new SettingsRouter();
                }

                done(null);
            }
        }
    }
);