define([],function(){var t=function(t){this.api=t};return t.prototype={getEvents:function(t,n,e){"function"==typeof n&&"undefined"==typeof e&&(e=n,n=null),n=n||{},n.status_code=200;var o="/v2/stackato/cloudevents";t&&(o+="?since_md5="+t),this.api.get(o,n,function(t,n){return t?e(t):void e(null,n.body)})}},t});
//# sourceMappingURL=cloud-events.js.map