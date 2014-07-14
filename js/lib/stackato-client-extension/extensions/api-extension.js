/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'underscore',
    'cloud-foundry-client/api',
    'stackato-client-extension/lib/cluster',
    'stackato-client-extension/lib/config',
    'stackato-client-extension/lib/export',
    'stackato-client-extension/lib/app-store',
    'stackato-client-extension/lib/app-stores',
    'stackato-client-extension/lib/settings',
    'stackato-client-extension/lib/stream',
    'stackato-client-extension/lib/cloud-events',
    'stackato-client-extension/lib/zones',
    'stackato-client-extension/lib/availability-zones'],
    function (_, Api, Cluster, Config, Export, AppStore, AppStores, Settings, Stream, CloudEvents, Zones, AvailabilityZones) {

        return  {

            extend: function () {

                Api.prototype.initialize = function () {
                    this.cluster = new Cluster(this);
                    this.config = new Config(this);
                    this.export = new Export(this);
                    this.app_store = new AppStore(this);
                    this.app_stores = new AppStores(this);
                    this.settings = new Settings(this);
                    this.cloud_events = new CloudEvents(this);
                    this.stream = new Stream(this);
                    this.zones = new Zones(this);
                    this.availability_zones = new AvailabilityZones(this);
                };

                Api.prototype.getStackatoInfo = function (options, done) {

                    if (typeof options === 'function' && typeof done === 'undefined') {
                        done = options;
                        options = null;
                    }

                    options = options || {};
                    options.status_code = 200;

                    this.get('/v2/stackato/info', options, function (err, res) {
                        done(err, res ? res.body : null);
                    });
                };

                Api.prototype.getStackatoStatus = function (options, done) {

                    if (typeof options === 'function' && typeof done === 'undefined') {
                        done = options;
                        options = null;
                    }

                    options = options || {};
                    options.status_code = 200;

                    this.get('/v2/stackato/status', options, function (err, res) {
                        done(err, res ? res.body : null);
                    });
                };

                Api.prototype.logout = function (options, done) {

                    if (typeof options === 'function' && typeof done === 'undefined') {
                        done = options;
                        options = null;
                    }

                    options = options || {};
                    options.status_code = 204;

                    var self = this;
                    this.getAuthorizationEndpoint(function (err, authorization_endpoint) {
                        if (err) {return done(err);}

                        var logout_url = authorization_endpoint + '/oauth/token';

                        self.delete_(logout_url, options, function (err, res) {
                            if (err) {return done(err);}
                            done(null, res.body);
                        });
                    });
                };

                Api.prototype.marshalRequest = function (path, options, done) {

                    if (options.query && options.query.indexOf('inline-relations-depth') !== -1) {
                        options.query = options.query + '&orphan-relations=1';
                    }

                    done(null, path, options);
                };

                Api.prototype.marshalResponse = function (options, res, done) {

                    if (!options.query || options.query.indexOf('orphan-relations=1') === -1 || !res.body.relations || res.body.relations.length <= 0) {
                        var self = this;
                        return setTimeout(function () {
                            done.call(self, null, res);
                        }, 1);
                    }

                    var orphans = [].concat(res.body.resources, _.toArray(res.body.relations));

                    _.each(orphans, function (resource) {

                        var key,
                            entity = resource.entity;

                        for (key in entity) {
                            if (entity.hasOwnProperty(key)) {

                                // One to one...
                                var guid_match = key.match(/(.+)_guid$/);
                                if (guid_match && guid_match.length === 2) {

                                    var relation_name = guid_match[1],
                                        relation_guid = entity[key],
                                        relation = res.body.relations[relation_guid];

                                    if (relation) {
                                        entity[relation_name] = relation;
                                    }
                                }

                                // One to many...
                                var url_match = key.match(/(.+)_url/);
                                if (url_match && url_match.length === 2) {

                                    var relations_name = url_match[1],
                                        relations_collection = entity[relations_name];

                                    if (relations_collection && relations_collection.length > 0) {
                                        var inlined_relations = [];
                                        _.each(relations_collection, function (relation_guid) {
                                            var relation = res.body.relations[relation_guid];
                                            if (relation) {
                                                inlined_relations.push(relation);
                                            }
                                        });
                                        entity[relations_name] = inlined_relations;
                                    }
                                }
                            }
                        }
                    });

                    done(null, res);
                };
            }
        }
    }
);