/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'appsecute-api/lib/utils',
    'text!util/templates/role-count.html'],
    function ($, TaggedAPI, RoleCountTemplate) {

        return {

            renderNodeCount: function (role, containing_el) {
                sconsole.cf_api.getStackatoStatus(function (err, res) {
                    var node_count = res.roles_stats[role].node_ids.length;
                    var template = _.template($(RoleCountTemplate).filter('#role-badge').html().trim(), { polyglot: window.polyglot, node_count: node_count });

                    $(template)
                        .appendTo($(containing_el));

                    if (node_count > 0) {
                        this.$('.node-count').addClass("badge-success");
                    }
                });
            }
        }
    }
);
