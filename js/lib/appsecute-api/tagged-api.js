define(["appsecute-api/lib/cclass","appsecute-api/api","appsecute-api/lib/utils"],function(t,e,n){return t.create(function(){var t=n.getGuid();return{cancel:function(){e.cancelByTag(t)},get:function(n,a){a=a||{},a.tag=t,e.get(n,a)},put:function(n,a,c){c=c||{},c.tag=t,e.put(n,a,c)},post:function(n,a,c){c=c||{},c.tag=t,e.post(n,a,c)},delete_:function(n,a){a=a||{},a.tag=t,e.delete_(n,a)}}})});
//# sourceMappingURL=tagged-api.js.map