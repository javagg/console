/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'jqueryui',
    'backbone',
    'underscore',
    'async',
    'access/access-control',
    'views/stream/content-editor-simple',
    'views/stream/create-discussion',
    'moment',
    'tag-it',
    'sockets/stream-socket-2',
    'views/stream/stream-cache',
    'util/current-user',
    'util/settings',
    'util/gravatar',
    'text!views/stream/templates/stream.html'],
    function ($, $UI, Backbone, _, Async, AccessControl, ContentEditor, CreateDiscussion, Moment, TagIt, StreamSocket, StreamCache, CurrentUserUtils, Settings, Gravatar, StreamTemplate) {

        return Backbone.View.extend({

            events: {
                'click .event-star': 'eventStarClicked',
                'click .event-reply': 'replyToEventClicked',
                'click .event-delete': 'deleteEventClicked',
                'click .event-edit': 'editEventClicked',
                'click .post-edit': 'editPostClicked',
                'click .post-delete': 'deletePostClicked',
                'click .app-link': 'applicationLinkClicked',
                'click .app-icon': 'applicationIconClicked',
                'click .event-filter-discussion': 'eventFilterDiscussionClicked',
                'click .event-filter-starred': 'eventFilterStarredClicked',
                'click .event-filter-tagged': 'eventFilterTaggedClicked',
                'click .event-filter-clear': 'eventFilterClearClicked',
                'click .event-source': 'eventSourceClicked'
            },

            streamSocket: null,

            apps: {},

            users: {},

            time_stamp_update_interval: null,

            eventStatusNames: {
                info: 'info',
                outstanding: 'outstanding',
                cleared: 'cleared'
            },

            initialize: function () {

                _.bindAll(this);

                this.render();

                this.streamSocket = new StreamSocket();

                var that = this;
                this.streamSocket.on('ready', function () {
                    if (!that.options.application_guid) {
                        that.subscribeToGlobalStream();
                    } else {
                        that.subscribeToApplicationStream();
                    }
                });
            },

            render: function () {

                var template = _.template($(StreamTemplate).filter('#stream-template').html().trim(), {});

                $(template)
                    .appendTo(this.el);

                this.$('.btn').tooltip();

                $(window).scroll(this.handleWindowScroll);
            },

            subscribeToApplicationStream: function () {
                this.streamSocket.joinApplicationStream(this.options.application_guid);
                this.registerStreamEventHandlers();
                this.populateStreamFromInitialSearch();
                this.renderCreateDiscussion();
            },

            subscribeToGlobalStream: function () {

                var filter = null;
                if (this.options.space_guid) {
                    filter = {name: 'space', value: this.options.space_guid}
                }
                if (this.options.organization_guid) {
                    filter = {name: 'organization', value: this.options.organization_guid}
                }

                this.streamSocket.joinGlobalStream(filter);
                this.registerStreamEventHandlers();
                this.populateStreamFromInitialSearch();
                this.renderCreateDiscussion();
            },

            startTimeStampUpdateInterval: function () {

                var that = this;
                this.time_stamp_update_interval = setInterval(function () {

                        var event_els = that.$('.event');
                        var post_els = that.$('.post');

                        _.each(event_els, function (event_el) {
                            var event = $(event_el).data('event');
                            if (event) {
                                var dateString = Moment(event.created_at).fromNow();
                                $('.event-created-at', event_el).html(dateString);
                            }
                        });

                        _.each(post_els, function (post_el) {
                            var post = $(post_el).data('post');
                            if (post) {
                                var dateString = Moment(post.created_at).fromNow();
                                $('.post-created-at', post_el).html(dateString);
                            }
                        });
                    },
                    60000
                );
            },

            renderCreateDiscussion: function () {

                // Don't show create discussion on org for now...
                if (this.options.organization_guid) {return;}

                new CreateDiscussion({
                    el: $('<div>').prependTo(this.$('.new-discussion')),
                    application_guid: this.options.application_guid,
                    space_guid: this.options.space_guid});
            },

            registerStreamEventHandlers: function () {
                this.streamSocket.on('event_created', this.handleEventCreated);
                this.streamSocket.on('event_updated', this.handleEventUpdated);
                this.streamSocket.on('event_removed', this.handleEventRemoved);
                this.streamSocket.on('post_created', this.handlePostCreated);
                this.streamSocket.on('post_updated', this.handlePostUpdated);
                this.streamSocket.on('post_removed', this.handlePostRemoved);
            },

            handleWindowScroll: function () {
                if ($(window).scrollTop() == $(document).height() - $(window).height()) {
                    this.loadOlderEvents();
                }
            },

            loadOlderEvents: function () {

                // Don't do anything if there is no next chunk
                if (!this.older_events_url) {
                    return;
                }

                // Don't do anything if we're already loading older events
                if (this.$('.loading-older-events').length > 0) {
                    return;
                }

                var loading_el = $('<div>', {'class': 'alert alert-info center loading-older-events'})
                    .append($('<span>', {'class': 'loading-older-events-message', html: polyglot.t('stream.loading_events')}))
                    .insertAfter($('.stream-inner', this.el));

                var self = this;
                sconsole.cf_api.get(
                    this.older_events_url,
                    {},
                    function (err, res) {
                        loading_el.remove();
                        if (!err) {
                            self.older_events_url = res.body.next_url;
                            self.renderEventsFromSearch(res.body, true);
                        }
                    }
                );
            },

            toggleEventFilter: function (filter_button_class) {

                this.$(filter_button_class).hasClass('active') ?
                    this.$(filter_button_class).removeClass('active') :
                    this.$(filter_button_class).addClass('active');

                this.populateStreamFromInitialSearch();
                this.$('.stream-inner').empty();
            },

            eventFilterDiscussionClicked: function () {
                this.toggleEventFilter('.event-filter-discussion');
            },

            eventFilterStarredClicked: function () {
                this.toggleEventFilter('.event-filter-starred');
            },

            eventFilterTaggedClicked: function () {
                this.toggleEventFilter('.event-filter-tagged');
            },

            eventFilterClearClicked: function () {
                this.clearSearchFilters();
                this.populateStreamFromInitialSearch();
                this.$('.stream-inner').empty();
            },

            clearSearchFilters: function () {
                this.$('.stream-search-filters .btn').removeClass('active');
            },

            getSearchFilters: function () {

                return {
                    tagged: this.$('.event-filter-tagged').hasClass('active') ? true : false,
                    starred: this.$('.event-filter-starred').hasClass('active') ? true : false,
                    tags: this.$('.event-filter-discussion').hasClass('active') ? ['discussion'] : null
                }
            },

            filterOutEvent: function (event, event_starred_by_user) {

                var current_filters = this.getSearchFilters();

                if (current_filters.starred && !event_starred_by_user) {return true;}
                if (current_filters.tags && !_.contains(event.tags, 'discussion')) {return true;}

                // TODO Tagged

                return false;
            },

            getEventElOrNull: function (event_id) {

                var event_el = this.$("#event-" + event_id);

                if (event_el.length > 0) {
                    return event_el;
                } else {
                    return null;
                }
            },

            getPostElOrNull: function (post_id) {

                var post_el = this.$("#post-" + post_id);

                if (post_el.length > 0) {
                    return post_el;
                } else {
                    return null;
                }
            },

            populateStreamFromInitialSearch: function () {

                var self = this,
                    search_url = '';

                if (this.options.application_guid) {
                    search_url = '/srest/applications/' + this.options.application_guid + '/events/search';
                }

                if (this.options.space_guid) {
                    search_url = '/srest/spaces/' + this.options.space_guid + '/events/search';
                }

                if (this.options.organization_guid) {
                    search_url = '/srest/organizations/' + this.options.organization_guid + '/events/search';
                }

                sconsole.cf_api.stream.searchEvents(
                    search_url,
                    this.getSearchFilters(),
                    {},
                    function (err, events) {
                        if (err) {return;}

                        self.older_events_url = events.next_url;
                        self.renderEventsFromSearch(events, false);

                        if (!self.time_stamp_update_interval) {
                            self.startTimeStampUpdateInterval();
                        }

                        if (events.links.length === 0) {
                            self.renderEmptyStreamMessage();
                        }
                    });
            },

            renderEmptyStreamMessage: function () {

                var template = _.template($(StreamTemplate).filter('#empty-stream-template').html().trim(), {
                    settings: Settings
                });

                this.no_events_el = $(template)
                    .prependTo(this.$('.stream-inner'));
            },

            warmEventCache: function (events, done) {

                Async.each(
                    events,
                    function (event, done) {
                        Async.parallel({
                                current_user: function (done) {
                                    StreamCache.getCurrentUser(function (err, user) {
                                        done(err, user);
                                    });
                                },
                                event_user: function (done) {
                                    StreamCache.getUser(event.user_guid, function (err, user) {
                                        done(err, user);
                                    });
                                },
                                event_app: function (done) {
                                    StreamCache.getApplication(event.application_guid, function (err, app) {
                                        done(err, app);
                                    });
                                },
                                post_users: function (done) {
                                    Async.each(
                                        event.posts,
                                        function (post, done) {
                                            StreamCache.getUser(post.user_guid, function (err, user) {
                                                done(err, user);
                                            });
                                        },
                                        done);
                                }
                            },
                            function (err, results) {
                                done(err);
                            });
                    },
                    done);
            },

            warmPostCache: function (posts, done) {

                Async.each(
                    posts,
                    function (post, done) {
                        Async.parallel({
                                current_user: function (done) {
                                    StreamCache.getCurrentUser(function (err, user) {
                                        done(err, user);
                                    });
                                },
                                post_user: function (done) {
                                    StreamCache.getUser(post.user_guid, function (err, user) {
                                        done(err, user);
                                    });
                                }
                            },
                            function (err, results) {
                                done(err);
                            });
                    },
                    done);
            },

            renderEventsFromSearch: function (search_results, append) {

                var that = this;
                var events = search_results.links || [];

                events.reverse();

                this.warmEventCache(events, function (err) {
                    _.each(events, function (event) {
                        that.renderEvent(event, append);
                    });
                });
            },

            renderLoadOlderPosts: function (event, event_el) {

                var that = this;
                var load_older_posts_el = $('<div>', {'class': 'load-older-posts clickable alert alert-info center'})
                    .append($('<span>', {'class': 'load-older-posts-message', html: polyglot.t('stream.show_comments')}))
                    .prependTo($('.media-posts', event_el));

                load_older_posts_el.click(function () {
                    that.loadOlderPosts(event, event_el, load_older_posts_el)
                });
            },

            loadOlderPosts: function (event, event_el, load_older_posts_el) {

                // Don't do anything if we're already loading older posts
                if ($(load_older_posts_el).hasClass('loading')) {
                    return;
                }

                if (event.posts_next_url) {

                    $(load_older_posts_el).addClass('loading');
                    $('.load-older-posts-message', load_older_posts_el).html(polyglot.t('loading'));

                    var self = this;
                    sconsole.cf_api.get(event.posts_next_url, {}, function (err, res) {
                        if (err) {
                            $(load_older_posts_el).removeClass('loading');
                            $('.load-older-posts-message', load_older_posts_el).html(polyglot.t('stream.show_posts'));
                        } else {
                            $(load_older_posts_el).remove();

                            var posts = res.body.links || [];

                            this.warmPostCache(posts, function (err) {

                                _.each(res.body.links || [], function (post) {
                                    self.handlePostCreated({data: {post: post}}, true);
                                });

                                event.posts_next_url = res.body.next_url;
                                $(event_el).data('event', event);

                                if (event.posts_next_url) {
                                    self.renderLoadOlderPosts(event, event_el);
                                }
                            });
                        }
                    });
                }
            },

            applicationLinkClicked: function (click_event) {
                var application = $(click_event.currentTarget).closest('.app-link').data('application');
                sconsole.routers.application.showApplication(application.metadata.guid);
            },

            applicationIconClicked: function (click_event) {
                var application = $(click_event.currentTarget).closest('.app-icon').data('application');
                sconsole.routers.application.showApplication(application.metadata.guid);
            },

            getApplicationImageUrl: function (app) {

                var image_dir = 'img/buildpacks/',
                    default_url = image_dir + 'default.png',
                    build_pack = app.entity.buildpack || app.entity.detected_buildpack;

                switch (build_pack) {
                    case "Node.js":
                        return image_dir + 'nodejs.png';

                    default:
                        return default_url;
                }
            },

            renderEvent: function (event, append) {

                var self = this;

                if (this.no_events_el) {
                    $(this.no_events_el).remove();
                }

                Async.parallel({
                        current_user: function (done) {
                            StreamCache.getCurrentUser(function (err, user) {
                                done(err, user);
                            });
                        },
                        event_user: function (done) {
                            StreamCache.getUser(event.user_guid, function (err, user) {
                                done(err, user);
                            });
                        },
                        event_app: function (done) {
                            StreamCache.getApplication(event.application_guid, function (err, app) {
                                done(err, app);
                            });
                        }
                    },
                    function (err, results) {
                        if (err) {return;}

                        var current_user = results.current_user,
                            event_user = results.event_user,
                            event_app = results.event_app;

                        var starred_by_current_user = _.find(event.starred_by, function (user) {
                            return user.user_guid === current_user.user_id;
                        });

                        // See if we should ignore the event based on client-side filters
                        // We could move this logic to the server but it would introduce some overhead and complexity to the socket layer
                        if (self.filterOutEvent(event, starred_by_current_user)) {
                            return;
                        }

                        event_user.email = event_user.emails.length > 0 ? event_user.emails[0].value : '';
                        event_user.image_url = Gravatar.getGravatarImageUrl(event_user.email);

                        var template = _.template($(StreamTemplate).filter('#event-template').html().trim(), {
                            event: event,
                            user: event_user,
                            app: event_app,
                            created_at_pretty: Moment(event.updated_at || event.created_at).fromNow(),
                            can_edit: (current_user.user_id === event.user_guid) && !event.is_from_stackato,
                            starred: starred_by_current_user ? true : false});

                        if (!append) {
                            $(template)
                                .prependTo(self.$('.stream-inner'));
                        } else {
                            $(template)
                                .appendTo(self.$('.stream-inner'));
                        }

                        var event_el = self.getEventElOrNull(event.id);

                        if (event_el) {
                            $(event_el).data('event', event);
                            $('.event-created-at', event_el).tooltip({title: Moment(event.created_at).format('LLLL')});
                            $('.event-source .user-icon', event_el).tooltip({title: event_user.username || event_user.email});

                            // Only show app info if we're on the global stream
                            if (!self.options.application_guid) {

                                var app_image_url = self.getApplicationImageUrl(event_app);

                                var app_image = $('<img>', {'class': 'media-object app-icon img-circle', src: app_image_url})
                                    .data('application', event_app)
                                    .appendTo($('.event-source', event_el));
                                $(app_image).tooltip({title: event_app.entity.name });

                                $('<a>', {'class': 'clickable app-link', html: _.escape(event_app.entity.name)})
                                    .data('application', event_app)
                                    .appendTo($('.event-applications', event_el));

                                $('.media-heading', event_el).text($('.media-heading', event_el).text() + ": ");
                                $('<a>', {'class': 'clickable app-link event-app-name', html: _.escape(event_app.entity.name) })
                                    .data('application', event_app)
                                    .appendTo($('.media-heading', event_el));

                                $('.event-applications', event_el).show();
                            }

                            self.updateEventStatusColor(event_el, event.status);

                            if (event.posts) {

                                if (event.posts_next_url) {
                                    self.renderLoadOlderPosts(event, event_el);
                                }

                                _.each(event.posts, function (post) {
                                    self.handlePostCreated({data: {post: post}});
                                });
                            }

                            if (_.contains(event.tags, 'discussion')) {
                                self.renderReplyBoxForDiscussion(event);
                            }
                        }
                    });
            },

            handleEventCreated: function (event_data) {
                this.renderEvent(event_data.data.event, false);
            },

            handleEventUpdated: function (event_data) {

                var event = event_data.data.event;
                var event_el = this.getEventElOrNull(event.id);

                if (event_el) {
                    $(event_el).data('event', event);
                    $('.event-name', event_el).html(event.name);
                    $('.event-status', event_el).html(event.status);
                    $('.event-content', event_el).html(event.compiled_content);
                    $('.event-is-edited', event_el).show();
                    this.updateEventStatusColor(event_el, event.status);
                }
            },

            handleEventRemoved: function (event_data) {

                var event_el = this.getEventElOrNull(event_data.data.event.id);

                if (event_el) {
                    $(event_el).remove();
                }
            },

            handlePostCreated: function (event_data, prepend) {

                var that = this;
                var post = event_data.data.post;
                var event_el = this.getEventElOrNull(post.event_id);

                if (event_el) {

                    Async.parallel({
                            current_user: function (done) {
                                StreamCache.getCurrentUser(function (err, user) {
                                    done(err, user);
                                });
                            },
                            post_user: function (done) {
                                StreamCache.getUser(post.user_guid, function (err, user) {
                                    done(err, user);
                                });
                            }
                        },
                        function (err, results) {
                            if (err) {return}

                            var current_user = results.current_user,
                                post_user = results.post_user;

                            post_user.email = post_user.emails.length > 0 ? post_user.emails[0].value : '';
                            post_user.image_url = Gravatar.getGravatarImageUrl(post_user.email);

                            var template = _.template($(StreamTemplate).filter('#post-template').html().trim(), {
                                post: post,
                                user: post_user,
                                created_at_pretty: Moment(post.updated_at || post.created_at).fromNow(),
                                can_edit: current_user.user_id === post.user_guid});

                            if (prepend) {
                                $(template)
                                    .prependTo($('.media-posts', event_el));
                            } else {
                                $(template)
                                    .appendTo($('.media-posts', event_el));
                            }

                            var post_el = that.getPostElOrNull(post.id);

                            if (post_el) {
                                $(post_el).data('post', post);
                                $('.post-created-at', post_el).tooltip({title: Moment(post.created_at).format('LLLL')});
                                $('.post-source', post_el).tooltip({title: post_user.username || post_user.email});
                            }
                        });
                }
            },

            handlePostUpdated: function (event_data) {

                var post = event_data.data.post;
                var post_el = this.getPostElOrNull(post.id);

                if (post_el) {
                    $(post_el).data('post', post);
                    $('.post-content', post_el).html(post.compiled_content);
                    $('.post-is-edited', post_el).show();
                }
            },

            handlePostRemoved: function (event_data) {

                var post_el = this.getPostElOrNull(event_data.data.post.id);

                if (post_el) {
                    $(post_el).remove();
                }
            },

            updateEventStatusColor: function (event_el, status) {

                $('.event-status', event_el).removeClass('label-info label-success label-important');

                switch (status) {

                    case this.eventStatusNames.info:
                        $('.event-status', event_el).addClass('label-info');
                        break;

                    case this.eventStatusNames.cleared:
                        $('.event-status', event_el).addClass('label-success');
                        break;

                    case this.eventStatusNames.outstanding:
                        $('.event-status', event_el).addClass('label-danger');
                        break;
                }
            },

            eventStarClicked: function (click_event) {

                var event_el = $(click_event.currentTarget).closest('.event');
                var event = $(event_el).data('event');

                var is_event_starred = $('.event-star', event_el).hasClass('glyphicon-star');

                // Unstar the event
                if (is_event_starred) {
                    $('.event-star', event_el).addClass('glyphicon-star-empty');
                    $('.event-star', event_el).removeClass('glyphicon-star');

                    sconsole.cf_api.delete_(event.stars_url, {status_code: 200}, function (err) {
                        if (err) {
                            // Roll back UI changes on error
                            $('.event-star', event_el).addClass('glyphicon-star');
                            $('.event-star', event_el).removeClass('glyphicon-star-empty');
                        }
                    });
                }
                // Star the event
                else {
                    $('.event-star', event_el).addClass('glyphicon-star');
                    $('.event-star', event_el).removeClass('glyphicon-star-empty');

                    sconsole.cf_api.post(event.stars_url, {status_code: 200}, function (err) {
                        if (err) {
                            // Roll back UI changes on error
                            $('.event-star', event_el).addClass('glyphicon-star-empty');
                            $('.event-star', event_el).removeClass('glyphicon-star');
                        }
                    });
                }
            },

            replyToEventClicked: function (click_event) {

                var event = $(click_event.currentTarget).closest('.event').data('event');

                this.renderEventReplyBox(event);
            },

            renderReplyBoxForDiscussion: function (event) {

                var that = this;
                var event_el = this.getEventElOrNull(event.id);

                if (event_el) {

                    var editor = new ContentEditor({el: $('<div>').appendTo($('.editor-box', event_el)), save_text: polyglot.t('stream.content_editor.reply'), hide_cancel: true});

                    editor.on('save', function (event_data) {

                        if (event_data.editor_content.length >= 1) {
                            that.submitPostClicked(event, event_data.editor_content, event_data.editor, false);
                        }
                    });
                }
            },

            renderEventReplyBox: function (event) {

                var that = this;
                var event_el = this.getEventElOrNull(event.id);

                if (event_el) {

                    $('.event-reply', event_el).hide();

                    var editor = new ContentEditor({el: $('<div>').appendTo($('.editor-box', event_el))});

                    editor.on('save', function (event_data) {
                        that.submitPostClicked(event, event_data.editor_content, event_data.editor, false);
                    });

                    editor.on('cancel', function (event_data) {
                        that.cancelPostClicked(event, event_el, event_data.editor);
                    });

                    $('.editor-content', editor.el).focus();
                }
            },

            submitPostClicked: function (event, content, editor, close_editor) {

                $('.editor-content', editor.el).attr('disabled', 'disabled');
                $('.editor-save', editor.el).button('loading');

                sconsole.cf_api.post(
                    event.posts_url,
                    {data: {content: content}},
                    function (err) {
                        if (err) {
                            $('.editor-content', editor.el).removeAttr('disabled');
                            $('.editor-save', editor.el).button('reset');
                        } else {
                            if (close_editor) {
                                editor.close();
                            } else {
                                editor.resetContent();
                                $('.editor-content', editor.el).removeAttr('disabled');
                                $('.editor-save', editor.el).button('reset');
                            }
                        }
                    }
                );
            },

            cancelPostClicked: function (event, event_el, editor) {
                $('.event-reply', event_el).show();
                editor.close();
            },

            deleteStreamContent: function (content_url, content_el) {

                content_el.hide();

                sconsole.cf_api.delete_(content_url, {}, function (err) {
                    if (err) {
                        content_el.show();
                    } else {
                        content_el.remove();
                    }
                });
            },

            deleteEventClicked: function (click_event) {

                var event_el = $(click_event.currentTarget).closest('.event');
                var event = event_el.data('event');

                sconsole.routers.stream.showDeleteStreamContentDialog(
                    function (result) {
                        if (result && result.delete) {
                            this.deleteStreamContent(event.url, event_el);
                        }
                    },
                    this);
            },

            deletePostClicked: function (click_event) {

                var post_el = $(click_event.currentTarget).closest('.post');
                var post = post_el.data('post');

                sconsole.routers.stream.showDeleteStreamContentDialog(
                    function (result) {
                        if (result && result.delete) {
                            this.deleteStreamContent(post.url, post_el);
                        }
                    },
                    this);
            },

            editEventClicked: function (click_event) {

                var that = this;
                var event_el = $(click_event.currentTarget).closest('.event');
                var event = event_el.data('event');

                $('.event-wrap', event_el).hide();
                $('.event-content', event_el).hide();
                $('.event-links', event_el).hide();

                var editor = new ContentEditor({
                    el: $('<div class=well>').prependTo($('.media-posts', event_el)),
                    content: event.content,
                    save_text: polyglot.t('save')});

                editor.on('save', function (event_data) {
                    that.saveEventEditClicked(event_el, event, event_data.editor_content, event_data.editor);
                });

                editor.on('cancel', function (event_data) {
                    that.cancelEventEditClicked(event_el, event, event_data.editor);
                });

                $('.editor-content', editor.el).focus();
            },

            saveEventEditClicked: function (event_el, event, content, editor) {

                $('.editor-content', editor.el).attr('disabled', 'disabled');
                $('.editor-cancel', editor.el).attr('disabled', 'disabled');
                $('.editor-save', editor.el).button('loading');

                sconsole.cf_api.put(
                    event.url,
                    {
                        data: {
                            name: event.name,
                            status: event.status,
                            content: content
                        }
                    },
                    function (err) {
                        if (err) {
                            $('.editor-content', editor.el).removeAttr('disabled');
                            $('.editor-cancel', editor.el).removeAttr('disabled');
                            $('.editor-save', editor.el).button('reset');
                        } else {
                            editor.close();
                            $('.event-wrap', event_el).show();
                            $('.event-content', event_el).show();
                            $('.event-links', event_el).show();
                        }
                    }
                );
            },

            cancelEventEditClicked: function (event_el, event, editor) {
                $('.event-wrap', event_el).show();
                $('.event-content', event_el).show();
                $('.event-links', event_el).show();
                editor.close();
            },

            editPostClicked: function (click_event) {

                var that = this,
                    post_el = $(click_event.currentTarget).closest('.post'),
                    post = post_el.data('post');

                $('.post-content', post_el).hide();
                $('.post-links', post_el).hide();
                $('.time-info', post_el).hide();

                var editor = new ContentEditor({
                    el: $('<div>').prependTo($('.post-editor', post_el)),
                    content: post.content,
                    save_text: polyglot.t('save')});

                editor.on('save', function (event_data) {
                    that.savePostEditClicked(post_el, post, event_data.editor_content, event_data.editor);
                });

                editor.on('cancel', function (event_data) {
                    that.cancelPostEditClicked(post_el, post, event_data.editor);
                });

                $('.editor-content', editor.el).focus();
            },

            savePostEditClicked: function (post_el, post, content, editor) {

                $('.editor-content', editor.el).attr('disabled', 'disabled');
                $('.editor-cancel', editor.el).attr('disabled', 'disabled');
                $('.editor-save', editor.el).button('loading');

                sconsole.cf_api.put(
                    post.url,
                    {
                        data: {content: content}
                    },
                    function (err) {
                        if (err) {
                            $('.editor-content', editor.el).removeAttr('disabled');
                            $('.editor-cancel', editor.el).removeAttr('disabled');
                            $('.editor-save', editor.el).button('reset');
                        } else {
                            editor.close();
                            $('.post-content', post_el).show();
                            $('.post-links', post_el).show();
                            $('.time-info', post_el).show();
                        }
                    }
                );
            },

            cancelPostEditClicked: function (post_el, post, editor) {
                $('.post-content', post_el).show();
                $('.post-links', post_el).show();
                $('.time-info', post_el).show();
                editor.close();
            },

            eventSourceClicked: function (click_event) {
                if (AccessControl.isAdmin()) {
                    return true;
                }

                click_event.preventDefault();
            },

            close: function () {

                this.streamSocket.off('event_created', this.handleEventCreated);
                this.streamSocket.off('event_updated', this.handleEventUpdated);
                this.streamSocket.off('event_removed', this.handleEventRemoved);
                this.streamSocket.off('post_created', this.handlePostCreated);
                this.streamSocket.off('post_updated', this.handlePostUpdated);
                this.streamSocket.off('post_removed', this.handlePostRemoved);

                if (this.options.application_guid) {
                    this.streamSocket.leaveApplicationStream(this.options.application_guid);
                } else {
                    this.streamSocket.leaveGlobalStream();
                }

                this.remove();
                this.unbind();
            }
        });
    }
);
