define(["jquery","backbone","underscore","polyglot","jqueryvalidation","bootstrap-select","access/admin-access","appsecute-api/lib/logger","util/gravatar","util/activity-indicator","views/lists/typeahead-bar","util/random-id","text!views/store/deploy/templates/deploy.html"],function(e,t,a,o,p,i,n,l,s,r,c,d,m){return t.View.extend({events:{"click #deploy-app-btn":"deployButtonClicked","change #select-space":"selectedSpaceChanged"},logger:new l("AppStoreDeploy"),initialize:function(){e.validator.addMethod("pattern",function(e,t,a){return this.optional(t)||a.test(e)}),this.options.activity.close(),this.render(),this.getAppDetails(),this.deployComplete=!1},render:function(){var t=a.template(e(m).filter("#deploy-template").html().trim(),{polyglot:window.polyglot,store_id:this.options.store_id,app_id:this.options.app_id});e(t).appendTo(this.el)},getAppDetails:function(){var e=this,t=new r(this.$("#store-apps"));sconsole.cf_api.app_stores.get(this.options.store_id,{queries:{"inline-relations-depth":1}},function(o,p){o||sconsole.cf_api.spaces.list({queries:{"inline-relations-depth":1}},function(o,i){if(t.close(),!o){var l=p.entity.content.store,s=p.entity.content.apps,r=s[e.options.app_id],c=i.data.resources,m=sconsole.user.summary.entity.spaces.concat(sconsole.user.summary.entity.managed_spaces),u=a.pluck(a.pluck(m,"metadata"),"guid");c=a.filter(c,function(e){return 0===e.entity.domains.length?!1:n.isAdmin()?!0:a.contains(u,e.metadata.guid)}),"default"!==r.icon&&r.icon||(r.icon="img/"+(r.runtime||r.framework)+".png");var y=r.id+"-"+d.make_random_id(5);e.renderAppDetails(l,r,y,c)}})})},applyFormValidation:function(){e("#app-deploy-form").validate({rules:{name:{required:!0,pattern:/^[A-Za-z0-9_-]+$/},space:{required:!0}},messages:{name:{required:polyglot.t("store.deploy.warn_name_required"),pattern:polyglot.t("store.deploy.warn_name_invalid")},space:{required:polyglot.t("store.deploy.warn_space_required")}}})},renderAppDetails:function(t,o,p,i){var n=a.template(e(m).filter("#app-details-template").html().trim(),{polyglot:window.polyglot,store:t,random_app_id:p,app:o,space_resources:i});e("#section-title").append(" "+o.name),e(n).appendTo(e("#deploy-app")),this.deploy_app_zone_type_ahead=new c({el:this.$("#input-placement-zone"),collection:sconsole.cf_api.zones,search_property:"name",placeholder:polyglot.t("store.app_placement_zone")});var l=this;this.deploy_app_zone_type_ahead.on("resource_selected",function(e){e&&l.$("#input-placement-zone").removeClass("has-error")}),this.applyFormValidation();var s=!0;i&&0!==i.length?a.each(i,function(t){var o=a.template(e(m).filter("#select-space-options-template").html().trim(),{polyglot:window.polyglot,space_resource:t});e(o).data("space",t).appendTo(e("#select-space")),s&&(e("#select-domain",l.el).selectpicker(),l.populateDomainSelect(t.entity.domains),s=!1)}):(e(".deploy-app-form, .deploy-app-details").addClass("hide"),e(".no-spaces-available").removeClass("hide")),e("#select-space",this.el).selectpicker()},selectedSpaceChanged:function(t){var a=e(t.target).context.selectedIndex,o=e("#select-space option")[a],p=e(o).data("space").entity.domains;this.populateDomainSelect(p)},populateDomainSelect:function(t){e("#select-domain").empty(),a.each(t,function(t){var o=a.template(e(m).filter("#select-domain-options-template").html().trim(),{polyglot:window.polyglot,domain_resource:t});e(o).data("domain",t).appendTo(e("#select-domain"))}),e("#select-domain",this.el).selectpicker("refresh")},deployButtonClicked:function(t){if(t.preventDefault(),e("#app-deploy-form").valid()){this.$(".error").remove();var a=this,o=this.$(".deploy-app-form"),p=e("#input-name",o).val(),i=e("#select-space",o).val(),n=e("#input-autostart",o).is(":checked"),l=o.data("app-src"),s=o.data("app-commit"),r=(o.data("app-display-name"),p+"."+e("#select-domain",o).val()),c=this.deploy_app_zone_type_ahead.getSelectedResource();this.$("#deploy-app-btn").button("loading");var d={app_name:p,space_guid:i};c&&(d.zone=c.metadata.guid),sconsole.cf_api.app_store.create(d,{global:!0},function(t,o){if(t)return a.$("#deploy-app-btn").button("reset"),void e("pre").hide();e("#deploy-app").slideToggle({complete:function(){e("#deploy-log").removeClass("hide"),e("#deploy-app").remove()}});var c=o.app_guid,m={app_name:p,url:r,space_guid:i,from:l,commit:s,autostart:n};d.zone&&(m.zone=d.zone),sconsole.cf_api.app_store.update(c,m,{timeout:6e4},function(e){e&&a.logger.error(e.message)}),sconsole.routers.application.showApplicationLogs(c)})}},close:function(){this.deployComplete=!0,this.remove(),this.unbind()}})});
//# sourceMappingURL=deploy.js.map