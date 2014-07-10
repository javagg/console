/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'appsecute-api/lib/utils',
    'access/access-control',
    'jquery-feedek',
    'jquery-equalheights',
    'util/settings',
    'text!util/templates/alert.html',
    'text!views/cluster/templates/cluster.html',
    'text!views/welcome/templates/updates.html'],
    function ($, Backbone, _, Polyglot, Utils, AccessControl, FeedEk, EqualHeights, Settings, AlertTemplate, ClusterTemplate, UpdatesTemplate) {

        return Backbone.View.extend({

            events: {
                'click #dismiss-getting-started': 'dismissGettingStarted'
            },

            initialize: function () {
                this.options.activity.close();
                this.render();
            },

            render: function () {

                var self = this;
                var is_admin = AccessControl.isAdmin();

                sconsole.cf_api.users.getCurrentUserInfo(function (err, user_info) {
                    if (err) {return self.logger.error(err);}

                    var template = _.template(Settings.getSetting('welcome_template'), {settings: Settings.getSettings(), username: $('<div>').text(user_info.user_name).html(), is_admin: is_admin});

                    $(template)
                        .appendTo(self.el);

                    var hide_getting_started = Utils.getCookie('hide_getting_started');
                    if (!hide_getting_started) {
                        $('.getting_started').removeClass('hidden');
                    }

                    $('.account_details_block_link').attr('href', '#users/' + user_info.user_id);

                    if (is_admin) {
                        $('.admin_only').removeClass('hidden');
                    } else {
                        $('.admin_only').remove();
                    }

                    $('.welcome_content .thumbnail').equalHeights();

                    self.getSpaces();
                    self.getStackatoInfo();
                    self.renderBlogPosts();
                });
            },

            getSpaces: function () {

                var self = this;
                sconsole.cf_api.spaces.list({}, function (err, spaces) {
                    if (err) {return self.logger.error(err);}

                    if (!spaces.data.resources.length) {
                        // Can't deploy apps if there are no spaces set up
                        var template = _.template($(AlertTemplate).filter('#alert-danger').html().trim(), {'message': "<strong>" + polyglot.t('action_required') + ":</strong> " + polyglot.t('welcome.no_spaces_alert') });

                        $(template)
                            .appendTo($('.messages'));
                    }
                })

            },

            getStackatoInfo: function () {

                sconsole.cf_api.getStackatoInfo(function (err, info) {
                    if (err) {return;}

                    // display stackato info
                    var info_template = _.template($(ClusterTemplate).filter('#cluster-info-template').html().trim(), { settings: Settings.getSettings(), info: info });

                    $(info_template)
                        .appendTo($('#about'));

                    // get the welcome message
                    var version = info.vendor_version;
                    var uuid = info.stackato.UUID;
                    var url = "https://stackato.activestate.com/welcome/" +
                        encodeURIComponent(version) + '/' + encodeURIComponent(uuid) + '/';
                    $.ajax({
                        'url': url,
                        'dataType': 'jsonp',
                        'crossDomain': true,
                        'success': function (data) {

                            var template = _.template($(UpdatesTemplate).filter('#updates-template').html().trim(), {"html": data.html});

                            $(template)
                                .appendTo($('#version_status'));

                            $('#update_info .welcome').attr('style', '');
                            $('#update_info .welcome a').attr('style', '');
                        }
                    });
                });
            },

            renderBlogPosts: function () {

                $('#blog_posts').FeedEk({
                    FeedUrl: 'https://www.activestate.com/taxonomy/term/639/0/feed',
                    MaxCount: 5,
                    ShowDesc: false
                });
            },

            dismissGettingStarted: function () {
                $('.getting_started').addClass('hidden');
                Utils.setCookie('hide_getting_started', true);
            },

            close: function () {
                this.remove();
                this.unbind();
            }
        });
    }
);
