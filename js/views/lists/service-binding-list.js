/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'access/access-control',
    'async',
    'views/lists/list-view',
    'text!views/lists/templates/service-binding-resource.ejs'],
    function ($, Backbone, _, AccessControl, Async, ListView, ServiceBindingResourceTemplate) {

        return ListView.extend({

            initialize: function () {

                if (!this.options.collection) {
                    this.options.collection = sconsole.cf_api.service_bindings;
                }

                if (!this.options.collection_options) {
                    this.options.collection_options = {'queries': {'inline-relations-depth': 2}};
                }

                // Don't show search bar.
                this.options.disable_search_bar = true;

                ListView.prototype.initialize.apply(this);
            },

            makeResourceEl: function (resource) {
                return  _.template(ServiceBindingResourceTemplate, {resource: resource});
            },

            mutatePage: function (page, done) {
                Async.each(
                    page.data.resources,
                    function (service_binding, done) {
                        var service_plan_guid = service_binding.entity.service_instance.entity.service_plan_guid;
                        sconsole.cf_api.service_plans.get(service_plan_guid, {'queries': {'inline-relations-depth': 2}}, function(err, res) { 
                            service_binding.service_name = res.entity.service.entity.label;
                            service_binding.service_version = res.entity.service.entity.version;
                            done(); 
                        }); 
                    },
                    function () {
                        done(null, page);
                    }
                );
            }
        });
    }
);