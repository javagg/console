define([],function(){var e=function(e){this.api=e};return e.prototype={keys:{cloud_controller:"cloud_controller_ng",stager:"stager",dea:"dea_ng",logyard:"logyard",filesystem_node:"filesystem_node",filesystem_gateway:"filesystem_gateway",harbor_node:"harbor_node",memcached_node:"memcached_node",memcached_gateway:"memcached_gateway",mongodb_node:"mongodb_node",mongodb_gateway:"mongodb_gateway",mysql_node:"mysql_node",mysql_gateway:"mysql_gateway",postgresql_node:"postgresql_node",postgresql_gateway:"postgresql_gateway",rabbit_node:"rabbit_node",rabbit_gateway:"rabbit_gateway",rabbit3_node:"rabbit3_node",rabbit3_gateway:"rabbit3_gateway",redis_node:"redis_node",redis_gateway:"redis_gateway"},getComponentList:function(e,t){"function"==typeof e&&"undefined"==typeof t&&(t=e,e=null),e=e||{},e.status_code=200,this.api.get("/v2/stackato/config/components",e,function(e,o){return e?t(e):void t(null,o.body)})},getComponentConfig:function(e,t,o){"function"==typeof t&&"undefined"==typeof o&&(o=t,t=null),t=t||{},t.status_code=200,this.api.get(e,t,function(e,t){return e?o(e):void o(null,t.body)})},updateComponentConfig:function(e,t,o,n){"function"==typeof o&&"undefined"==typeof n&&(n=o,o=null),o=o||{},o.status_codes=[200,204],o.data=t,this.api.put(e,o,function(e,t){return e?n(e):void n(null,t.body)})},getConfig:function(e,t,o){"function"==typeof t&&"undefined"==typeof o&&(o=t,t=null),t=t||{},t.status_code=200;var n="/v2/stackato/config?name="+encodeURIComponent(e);this.api.get(n,t,function(e,t){return e?o(e):void o(null,t.body)})},updateConfig:function(e,t,o,n){"function"==typeof o&&"undefined"==typeof n&&(n=o,o=null),o=o||{},o.status_codes=[200,204],o.data=t;var i="/v2/stackato/config?name="+encodeURIComponent(e);this.api.put(i,o,function(e,t){return e?n(e):void n(null,t.body)})},updateConfigValue:function(e,t,o,n,i){var a={};a[t]=o,this.updateConfig(e,a,n,i)},updateNodeConfig:function(e,t,o,n){"function"==typeof o&&"undefined"==typeof n&&(n=o,o=null),o=o||{},o.status_codes=[200,204],o.data=t;var i="/v2/stackato/cluster/roles/"+encodeURIComponent(e);this.api.put(i,o,function(e,t){n(e,t.body)})},getCloudControllerConfig:function(e,t){this.getConfig(this.keys.cloud_controller,e,t)},getStagerConfig:function(e,t){this.getConfig(this.keys.stager,e,t)},getDeaConfig:function(e,t){this.getConfig(this.keys.dea,e,t)},getFileSystemNodeConfig:function(e,t){this.getConfig(this.keys.filesystem_node,e,t)},getFileSystemGatewayConfig:function(e,t){this.getConfig(this.keys.filesystem_gateway,e,t)},getHarborNodeConfig:function(e,t){this.getConfig(this.keys.harbor_node,e,t)},getMemCachedNodeConfig:function(e,t){this.getConfig(this.keys.memcached_node,e,t)},getMemCachedGatewayConfig:function(e,t){this.getConfig(this.keys.memcached_gateway,e,t)},getMongoDbNodeConfig:function(e,t){this.getConfig(this.keys.mongodb_node,e,t)},getMongoDbGatewayConfig:function(e,t){this.getConfig(this.keys.mongodb_gateway,e,t)},getMySQLNodeConfig:function(e,t){this.getConfig(this.keys.mysql_node,e,t)},getMySQLGatewayConfig:function(e,t){this.getConfig(this.keys.mysql_gateway,e,t)},getPostgresNodeConfig:function(e,t){this.getConfig(this.keys.postgresql_node,e,t)},getPostgresGatewayConfig:function(e,t){this.getConfig(this.keys.postgresql_gateway,e,t)},getRabbitNodeConfig:function(e,t){this.getConfig(this.keys.rabbit_node,e,t)},getRabbitGatewayConfig:function(e,t){this.getConfig(this.keys.rabbit_gateway,e,t)},getRabbit3NodeConfig:function(e,t){this.getConfig(this.keys.rabbit3_node,e,t)},getRabbit3GatewayConfig:function(e,t){this.getConfig(this.keys.rabbit3_gateway,e,t)},getRedisNodeConfig:function(e,t){this.getConfig(this.keys.redis_node,e,t)},getRedisGatewayConfig:function(e,t){this.getConfig(this.keys.redis_gateway,e,t)},updateCloudControllerConfigValue:function(e,t,o,n){this.updateConfigValue(this.keys.cloud_controller,e,t,o,n)},updateStagerConfigValue:function(e,t,o,n){this.updateConfigValue(this.keys.stager,e,t,o,n)},updateDeaConfigValue:function(e,t,o,n){this.updateConfigValue(this.keys.dea,e,t,o,n)},updateFileSystemNodeConfigValue:function(e,t,o,n){this.updateConfigValue(this.keys.filesystem_node,e,t,o,n)},updateFileSystemGatewayConfigValue:function(e,t,o,n){this.updateConfigValue(this.keys.filesystem_gateway,e,t,o,n)},updateHarborNodeConfigValue:function(e,t,o,n){this.updateConfigValue(this.keys.harbor_node,e,t,o,n)},updateMemCachedNodeConfigValue:function(e,t,o,n){this.updateConfigValue(this.keys.memcached_node,e,t,o,n)},updateMemCachedGatewayConfigValue:function(e,t,o,n){this.updateConfigValue(this.keys.memcached_gateway,e,t,o,n)},updateMongoDbNodeConfigValue:function(e,t,o,n){this.updateConfigValue(this.keys.mongodb_node,e,t,o,n)},updateMongoDbGatewayConfigValue:function(e,t,o,n){this.updateConfigValue(this.keys.mongodb_gateway,e,t,o,n)},updateMySQLNodeConfigValue:function(e,t,o,n){this.updateConfigValue(this.keys.mysql_node,e,t,o,n)},updateMySQLGatewayConfigValue:function(e,t,o,n){this.updateConfigValue(this.keys.mysql_gateway,e,t,o,n)},updatePostgresNodeConfigValue:function(e,t,o,n){this.updateConfigValue(this.keys.postgresql_node,e,t,o,n)},updatePostgresGatewayConfigValue:function(e,t,o,n){this.updateConfigValue(this.keys.postgresql_gateway,e,t,o,n)},updateRabbitNodeConfigValue:function(e,t,o,n){this.updateConfigValue(this.keys.rabbit_node,e,t,o,n)},updateRabbitGatewayConfigValue:function(e,t,o,n){this.updateConfigValue(this.keys.rabbit_gateway,e,t,o,n)},updateRabbit3NodeConfigValue:function(e,t,o,n){this.updateConfigValue(this.keys.rabbit3_node,e,t,o,n)},updateRabbit3GatewayConfigValue:function(e,t,o,n){this.updateConfigValue(this.keys.rabbit3_gateway,e,t,o,n)},updateRedisNodeConfigValue:function(e,t,o,n){this.updateConfigValue(this.keys.redis_node,e,t,o,n)},updateRedisGatewayConfigValue:function(e,t,o,n){this.updateConfigValue(this.keys.redis_gateway,e,t,o,n)}},e});
//# sourceMappingURL=config.js.map