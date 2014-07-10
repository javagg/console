/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'appsecute-api/lib/utils',
    'appsecute-api/lib/logger',
    'util/activity-indicator',
    'views/lists/search-bar',
    'text!views/lists/templates/list-view.ejs',
    'text!views/lists/templates/list-view-resource.ejs',
    'text!views/lists/templates/list-view-no-resources.ejs',
    'text!views/lists/templates/list-view-page-error.ejs',
    'text!views/lists/templates/list-view-page-container.ejs',
    'text!views/lists/templates/list-view-paging-controls.ejs'],
    function ($, Backbone, _, Utils, Logger, Activity, SearchBar, ListViewTemplate, ResourceTemplate, NoResourcesTemplate, PageErrorTemplate, PageContainerTemplate, PageControlsTemplate) {

        return Backbone.View.extend({

            logger: new Logger('List View'),

            events: {
                'click .page-load-next': 'nextPageClicked',
                'click .page-load-prev': 'prevPageClicked'
            },

            page: null,

            paging_style: null,

            paging_styles: {
                append: 'append',
                replace: 'replace'
            },

            parseOptions: function () {

                if (!this.options.page && !this.options.collection) {
                    throw 'CF Api page or collection to render must be provided.'
                }

                this.page = this.options.page || null;

                if (this.options.paging_style === this.paging_styles.append ||
                    this.options.paging_style === this.paging_styles.replace) {
                    this.paging_style = this.options.paging_style;
                } else {
                    this.paging_style = this.paging_styles.replace;
                }
            },

            initialize: function () {

                this.parseOptions();

                var self = this;
                if (this.page) {
                    this.mutatePage(this.page, function (err, page) {
                        if (err) {
                            return self.renderPageError.call(self, err, page);
                        }
                        self.page = page;
                        self.render.call(self);
                    });
                } else {
                    this.fetchAndRenderInitialPage();
                }
            },

            render: function () {

                var template = _.template(ListViewTemplate, {});

                $(this.el)
                    .append(template);

                if (!this.options.disable_search_bar) {
                    this.renderSearchBar();
                }
                this.renderPageContainer();
                this.renderPage();
                this.renderPagingControls();
            },

            renderSearchBar: function () {

                this.search_bar = new SearchBar({
                    el: this.$('.search-container'),
                    collection: (this.page ? this.page.collection : this.options.collection),
                    search_property: this.options.search_property || 'name',
                    search_complete: this.searchComplete,
                    search_options: this.options.collection_options ? this.options.collection_options : null,
                    context: this});
            },

            renderPageContainer: function () {

                var template = _.template(PageContainerTemplate, {});

                this.$('.page')
                    .append(template);
            },

            renderPagingControls: function () {

                if (this.page.data.total_pages <= 1) {
                    return;
                }

                var template = _.template(PageControlsTemplate, {});

                this.$('.paging-controls')
                    .append(template);

                if (this.paging_style === this.paging_styles.append && this.page.hasNextPage()) {
                    this.$('.paging-controls-append').show();
                } else if (this.paging_style === this.paging_styles.replace) {

                    this.$('.paging-controls-replace').show();

                    if (this.page.hasNextPage()) {
                        this.$('.page-load-next').removeClass('disabled');
                    }

                    if (this.page.hasPrevPage()) {
                        this.$('.page-load-prev').removeClass('disabled');
                    }
                }
            },

            clearPagingControls: function () {
                this.$('.paging-controls').empty();
            },

            renderPage: function () {

                if (this.page.data.resources.length === 0) {
                    return this.renderNoResourcesMessage();
                }

                var self = this;
                _.each(this.page.data.resources, function (resource) {
                    self.renderResource.call(self, resource);
                });

                this.pageRendered(this.$('.page'));
            },

            pageRendered: function (page_el) {

            },

            clearPage: function () {
                this.$('.page-container').empty();
            },

            renderNoResourcesMessage: function () {

                var self = this,
                    no_resource_message_maker = null;

                if (Utils.isFunction(this.options.makeNoResourceMessageEl)) {
                    no_resource_message_maker = function () {
                        return self.options.makeNoResourceMessageEl.call(self.options.context || self);
                    }
                } else {
                    no_resource_message_maker = this.makeNoResourceMessageEl;
                }

                var no_resources_el = no_resource_message_maker();

                $(no_resources_el)
                    .appendTo(this.$('.page-container'));
            },

            makeNoResourceMessageEl: function () {
                return _.template(NoResourcesTemplate, {});
            },

            makeResourceEl: function (resource) {
                return  _.template(ResourceTemplate, {resource: resource});
            },

            renderResource: function (resource) {

                var self = this,
                    resource_maker = null;

                if (Utils.isFunction(this.options.makeResourceEl)) {
                    resource_maker = function () {
                        return self.options.makeResourceEl.call(self.options.context || self, resource);
                    }
                } else {
                    resource_maker = this.makeResourceEl;
                }

                var resource_el = resource_maker(resource),
                    original_el = this.$('#' + resource.metadata.guid),
                    appended_el = null;

                if (original_el.length > 0) {
                    appended_el = $(original_el).replaceWith($(resource_el).click(function (event) {
                        self.resourceClicked.call(self, resource, event);
                    }));
                } else {
                    appended_el = $(resource_el).click(function (event) {
                        self.resourceClicked.call(self, resource, event);
                    }).appendTo(this.$('.page-container'));
                }

                this.resourceRendered(resource, appended_el);
            },

            resourceRendered: function (resource, resource_el) {

            },

            resourceClicked: function (resource, event) {

                /*
                 To enable resource elements to easily contain elements that have their own click behaviour
                 e.g buttons that are nested within the element, we allow those nested elements to define a 'data-click'
                 attribute which maps to a click handler method. When a click event fires on the resource element we
                 traverse the element hierarchy starting from the event source until we reach the top level resource
                 element. If along the way we find an element with the data-click attribute defined we attempt to
                 look up a matching click handler and call that instead of the normal resourceClicked method.
                 */
                var child_method = null,
                    inspect_el = $(event.target);

                while (true) {

                    // If we've reached the original resource element then break out of the traversal
                    if ($(inspect_el)[0] === $(event.currentTarget)[0]) {
                        break;
                    }

                    // Check if the current el in the chain has a 'data-click' attribute
                    var click_method = $(inspect_el).data("click");
                    if (click_method) {
                        child_method = click_method;
                        break;
                    }

                    // Move one link up the chain
                    inspect_el = $(inspect_el).parent();
                }

                // No child method found so call the top level resource clicked method, if it's been provided
                if (!child_method) {
                    if (Utils.isFunction(this.options.resource_clicked)) {
                        this.options.resource_clicked.call(this.options.context || this, resource, event);
                    }
                } else {
                    // If a child of the resource element has the 'data-click' attribute defined then attempt to
                    // look up a matching click method provided by the caller
                    if (this.options.click_handlers && Utils.isFunction(this.options.click_handlers[child_method])) {
                        this.options.click_handlers[child_method].call(this.options.context || this, resource, event);
                    } else {
                        this.logger.warn('Found data-click attribute on child element but no mapped function was found.');
                    }
                }
            },

            renderPageError: function (err, page) {

                var template = _.template(PageErrorTemplate, {error: {description: JSON.stringify(err)}});

                this.$('.page-container')
                    .append(template);
            },

            searchComplete: function (err, page) {

                if (err) {
                    return this.renderPageError(err, page);
                }

                var self = this;
                this.mutatePage(page, function (err, page) {
                    if (err) {
                        return self.renderPageError.call(self, err, page);
                    }
                    self.clearPage.call(self);
                    self.clearPagingControls.call(self);
                    self.page = page;
                    self.renderPage.call(self);
                    self.renderPagingControls.call(self);
                });
            },

            mutatePage: function (page, done) {
                setTimeout(function () {
                    done(null, page);
                }, 10);
            },

            fetchAndRenderInitialPage: function () {

                var self = this,
                    activity = new Activity(this.el);

                this.options.collection.list(
                    this.options.collection_options || {},
                    function (err, page) {
                        if (err) {
                            return self.renderPageError.call(self, err, page);
                        }

                        self.mutatePage(page, function (err, page) {
                            if (err) {
                                return self.renderPageError.call(self, err, page);
                            }
                            activity.close();
                            self.page = page;
                            self.render();
                        });
                    });
            },

            fetchAndRenderPage: function (direction) {

                this.clearPagingControls();

                if (this.paging_style === this.paging_styles.replace) {
                    this.clearPage();
                }

                var self = this,
                    activity = new Activity(this.$('.page-container')),
                    page_function = (direction === 'next' ? this.page.getNextPage : this.page.getPrevPage);

                page_function.call(this.page, function (err, page) {
                    if (err) {
                        return self.renderPageError.call(self, err, page);
                    }

                    self.mutatePage(page, function (err, page) {
                        if (err) {
                            return self.renderPageError.call(self, err, page);
                        }

                        activity.close();
                        self.page = page;
                        self.renderPage.call(self);
                        self.renderPagingControls.call(self);
                    });
                });
            },

            nextPageClicked: function (event) {

                event.preventDefault();

                if (this.page.hasNextPage()) {
                    this.fetchAndRenderPage('next');
                }
            },

            prevPageClicked: function (event) {

                event.preventDefault();

                if (this.page.hasPrevPage()) {
                    this.fetchAndRenderPage('prev');
                }
            },

            close: function () {

                if (this.search_bar) {
                    this.search_bar.close();
                }

                this.remove();
                this.unbind();
            }
        });
    }
);
