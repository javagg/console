/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([],
    function () {

        var config = function (api) {
            this.api = api;
        };

        config.prototype = {

            keys: {
                cloud_controller: 'cloud_controller_ng',
                stager: 'stager',
                dea: 'dea_ng',
                logyard: 'logyard',
                filesystem_node: 'filesystem_node',
                filesystem_gateway: 'filesystem_gateway',
                harbor_node: 'harbor_node',
                memcached_node: 'memcached_node',
                memcached_gateway: 'memcached_gateway',
                mongodb_node: 'mongodb_node',
                mongodb_gateway: 'mongodb_gateway',
                mysql_node: 'mysql_node',
                mysql_gateway: 'mysql_gateway',
                postgresql_node: 'postgresql_node',
                postgresql_gateway: 'postgresql_gateway',
                rabbit_node: 'rabbit_node',
                rabbit_gateway: 'rabbit_gateway',
                rabbit3_node: 'rabbit3_node',
                rabbit3_gateway: 'rabbit3_gateway',
                redis_node: 'redis_node',
                redis_gateway: 'redis_gateway'
            },

            getComponentList: function (options, done) {

                if (typeof options === 'function' && typeof done === 'undefined') {
                    done = options;
                    options = null;
                }

                options = options || {};
                options.status_code = 200;

                this.api.get('/v2/stackato/config/components', options, function (err, res) {
                    if (err) {return done(err);}
                    done(null, res.body);
                });
            },

            getComponentConfig: function (component_url, options, done) {

                if (typeof options === 'function' && typeof done === 'undefined') {
                    done = options;
                    options = null;
                }

                options = options || {};
                options.status_code = 200;

                this.api.get(component_url, options, function (err, res) {
                    if (err) {return done(err);}
                    done(null, res.body);
                });
            },

            updateComponentConfig: function (component_url, config, options, done) {

                if (typeof options === 'function' && typeof done === 'undefined') {
                    done = options;
                    options = null;
                }

                options = options || {};
                options.status_codes = [200, 204];
                options.data = config;

                this.api.put(component_url, options, function (err, res) {
                    if (err) {return done(err);}
                    done(null, res.body);
                });
            },

            getConfig: function (component, options, done) {

                if (typeof options === 'function' && typeof done === 'undefined') {
                    done = options;
                    options = null;
                }

                options = options || {};
                options.status_code = 200;

                var config_url = '/v2/stackato/config?name=' + encodeURIComponent(component);

                this.api.get(config_url, options, function (err, res) {
                    if (err) {return done(err);}
                    done(null, res.body);
                });
            },

            updateConfig: function (component, config, options, done) {

                if (typeof options === 'function' && typeof done === 'undefined') {
                    done = options;
                    options = null;
                }

                options = options || {};
                options.status_codes = [200, 204];
                options.data = config;

                var config_url = '/v2/stackato/config?name=' + encodeURIComponent(component);

                this.api.put(config_url, options, function (err, res) {
                    if (err) {return done(err);}
                    done(null, res.body);
                });
            },

            updateConfigValue: function (component, key, value, options, done) {

                var config = {};
                config[key] = value;

                this.updateConfig(component, config, options, done);
            },

            updateNodeConfig: function (node_ip, config, options, done) {

                if (typeof options === 'function' && typeof done === 'undefined') {
                    done = options;
                    options = null;
                }

                options = options || {};
                options.status_codes = [200, 204];
                options.data = config;

                var config_url = '/v2/stackato/cluster/roles/' + encodeURIComponent(node_ip);

                this.api.put(config_url, options, function (err, res) {
                    done(err, res.body);
                });
            },

            getCloudControllerConfig: function (options, done) {
                this.getConfig(this.keys.cloud_controller, options, done);
            },

            getStagerConfig: function (options, done) {
                this.getConfig(this.keys.stager, options, done);
            },

            getDeaConfig: function (options, done) {
                this.getConfig(this.keys.dea, options, done);
            },

            getFileSystemNodeConfig: function (options, done) {
                this.getConfig(this.keys.filesystem_node, options, done);
            },

            getFileSystemGatewayConfig: function (options, done) {
                this.getConfig(this.keys.filesystem_gateway, options, done);
            },

            getHarborNodeConfig: function (options, done) {
                this.getConfig(this.keys.harbor_node, options, done);
            },

            getMemCachedNodeConfig: function (options, done) {
                this.getConfig(this.keys.memcached_node, options, done);
            },

            getMemCachedGatewayConfig: function (options, done) {
                this.getConfig(this.keys.memcached_gateway, options, done);
            },

            getMongoDbNodeConfig: function (options, done) {
                this.getConfig(this.keys.mongodb_node, options, done);
            },

            getMongoDbGatewayConfig: function (options, done) {
                this.getConfig(this.keys.mongodb_gateway, options, done);
            },

            getMySQLNodeConfig: function (options, done) {
                this.getConfig(this.keys.mysql_node, options, done);
            },

            getMySQLGatewayConfig: function (options, done) {
                this.getConfig(this.keys.mysql_gateway, options, done);
            },

            getPostgresNodeConfig: function (options, done) {
                this.getConfig(this.keys.postgresql_node, options, done);
            },

            getPostgresGatewayConfig: function (options, done) {
                this.getConfig(this.keys.postgresql_gateway, options, done);
            },

            getRabbitNodeConfig: function (options, done) {
                this.getConfig(this.keys.rabbit_node, options, done);
            },

            getRabbitGatewayConfig: function (options, done) {
                this.getConfig(this.keys.rabbit_gateway, options, done);
            },

            getRabbit3NodeConfig: function (options, done) {
                this.getConfig(this.keys.rabbit3_node, options, done);
            },

            getRabbit3GatewayConfig: function (options, done) {
                this.getConfig(this.keys.rabbit3_gateway, options, done);
            },

            getRedisNodeConfig: function (options, done) {
                this.getConfig(this.keys.redis_node, options, done);
            },

            getRedisGatewayConfig: function (options, done) {
                this.getConfig(this.keys.redis_gateway, options, done);
            },

            updateCloudControllerConfigValue: function (key, value, options, done) {
                this.updateConfigValue(this.keys.cloud_controller, key, value, options, done);
            },

            updateStagerConfigValue: function (key, value, options, done) {
                this.updateConfigValue(this.keys.stager, key, value, options, done);
            },

            updateDeaConfigValue: function (key, value, options, done) {
                this.updateConfigValue(this.keys.dea, key, value, options, done);
            },

            updateFileSystemNodeConfigValue: function (key, value, options, done) {
                this.updateConfigValue(this.keys.filesystem_node, key, value, options, done);
            },

            updateFileSystemGatewayConfigValue: function (key, value, options, done) {
                this.updateConfigValue(this.keys.filesystem_gateway, key, value, options, done);
            },

            updateHarborNodeConfigValue: function (key, value, options, done) {
                this.updateConfigValue(this.keys.harbor_node, key, value, options, done);
            },

            updateMemCachedNodeConfigValue: function (key, value, options, done) {
                this.updateConfigValue(this.keys.memcached_node, key, value, options, done);
            },

            updateMemCachedGatewayConfigValue: function (key, value, options, done) {
                this.updateConfigValue(this.keys.memcached_gateway, key, value, options, done);
            },

            updateMongoDbNodeConfigValue: function (key, value, options, done) {
                this.updateConfigValue(this.keys.mongodb_node, key, value, options, done);
            },

            updateMongoDbGatewayConfigValue: function (key, value, options, done) {
                this.updateConfigValue(this.keys.mongodb_gateway, key, value, options, done);
            },

            updateMySQLNodeConfigValue: function (key, value, options, done) {
                this.updateConfigValue(this.keys.mysql_node, key, value, options, done);
            },

            updateMySQLGatewayConfigValue: function (key, value, options, done) {
                this.updateConfigValue(this.keys.mysql_gateway, key, value, options, done);
            },

            updatePostgresNodeConfigValue: function (key, value, options, done) {
                this.updateConfigValue(this.keys.postgresql_node, key, value, options, done);
            },

            updatePostgresGatewayConfigValue: function (key, value, options, done) {
                this.updateConfigValue(this.keys.postgresql_gateway, key, value, options, done);
            },

            updateRabbitNodeConfigValue: function (key, value, options, done) {
                this.updateConfigValue(this.keys.rabbit_node, key, value, options, done);
            },

            updateRabbitGatewayConfigValue: function (key, value, options, done) {
                this.updateConfigValue(this.keys.rabbit_gateway, key, value, options, done);
            },

            updateRabbit3NodeConfigValue: function (key, value, options, done) {
                this.updateConfigValue(this.keys.rabbit3_node, key, value, options, done);
            },

            updateRabbit3GatewayConfigValue: function (key, value, options, done) {
                this.updateConfigValue(this.keys.rabbit3_gateway, key, value, options, done);
            },

            updateRedisNodeConfigValue: function (key, value, options, done) {
                this.updateConfigValue(this.keys.redis_node, key, value, options, done);
            },

            updateRedisGatewayConfigValue: function (key, value, options, done) {
                this.updateConfigValue(this.keys.redis_gateway, key, value, options, done);
            }
        };

        return config;
    }
);