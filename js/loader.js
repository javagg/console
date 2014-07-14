require.config({
    shim: {
        bootstrap: {
            deps: ["jquery"],
            exports: "Bootstrap"
        },
        backbone: {
            deps: ["underscore", "jquery"],
            exports: "Backbone"
        },
        console: {
            deps: ["backbone", "bootstrap"]
        },
        datatables: {
            deps: ["jquery"]
        },
        "datatables-bootstrap": {
            deps: ["datatables"]
        },
        "datatables-column-filter-widgets": {
            deps: ["datatables"]
        },
        select: {
            deps: ["bootstrap", "jquery"]
        },
        "bootstrap-select": {
            deps: ["bootstrap", "jquery"]
        },
        "bootstrap-color-picker": {
            deps: ["bootstrap", "jquery"]
        },
        typeahead: {
            deps: ["bootstrap", "jquery"]
        },
        jqueryui: {
            deps: ["jquery"]
        },
        jqueryvalidation: {
            deps: ["jquery"],
            exports: "jQuery.validator"
        },
        flot: {
            deps: ["jquery"],
            exports: "flot"
        },
        "flot-time": {
            deps: ["flot"],
            exports: "flot-time"
        },
        growl: {
            deps: ["jquery"],
            exports: "growl"
        },
        "jquery-mousewheel": {
            deps: ["jquery"],
            exports: "jQuery.fn.mousewheel"
        },
        "jquery-equalheights": {
            deps: ["jquery"],
            exports: "jQuery.equalHeights"
        },
        "jquery-fittext": {
            deps: ["jquery"],
            exports: "jQuery.fitText"
        },
        "jquery-feedek": {
            deps: ["jquery"],
            exports: "jQuery.FeedEk"
        },
        "jquery-ltruncate": {
            deps: ["jquery"],
            exports: "jQuery.lTruncate"
        },
        "jquery-linkify": {
            deps: ["jquery"],
            exports: "jQuery.fn.linkify"
        },
        "jquery-toggles": {
            deps: ["jquery"]
        },
        "tag-it": {
            deps: ["jqueryui"],
            exports: "jQuery.ui.tagit"
        },
        polyglot: {
            exports: "Polyglot"
        },
        raphael: {
            deps: ["jquery"],
            exports: "raphael"
        }
    },
    baseUrl: "js/",
    paths: {
        jwt: "lib/jwt/jwt",
        ace: "lib/ace/ace",
        text: "lib/requirejs/text",
        domready: "lib/requirejs/domready",
        moment: "lib/moment/moment-2.4.0.min",
        "socket.io": "lib/socket.io/socket.io.min",
        underscore: "lib/underscore/underscore-1.4.4.min",
        jquery: "lib/jquery/jquery-1.10.1.min",
        jqueryui: "lib/jquery-ui/jquery-ui-1.10.4.custom.min",
        "tag-it": "lib/tag-it/js/tag-it.min",
        "jquery-mousewheel": "lib/jquery-mousewheel/jquery.mousewheel.min",
        jqueryvalidation: "lib/jquery-validation/jquery.validate.min",
        growl: "lib/jquery-growl/jquery.growl",
        flot: "lib/flot/jquery.flot.min",
        "flot-time": "lib/flot/jquery.flot.time.min",
        bootstrap: "lib/bootstrap/js/bootstrap.min",
        "bootstrap-select": "lib/bootstrap-select/bootstrap-select.min",
        "bootstrap-color-picker": "lib/bootstrap-color-picker/js/bootstrap-colorpicker.min",
        backbone: "lib/backbone/backbone-1.0.0.min",
        "appsecute-api": "lib/appsecute-api",
        crypto: "lib/crypto-js",
        "stackato-client-extension": "lib/stackato-client-extension",
        "cloud-foundry-client": "lib/cloud-foundry-client",
        datatables: "lib/datatables/datatables-1.9.4.min",
        "datatables-bootstrap": "lib/datatables/datatables-bootstrap",
        "datatables-column-filter-widgets": "lib/datatables/datatables-column-filter-widgets",
        "jquery-equalheights": "lib/jquery-equalheights/jquery.equalheights",
        "jquery-fittext": "lib/jquery-fittext/jquery.fittext",
        "jquery-feedek": "lib/jquery-feedek/jquery.feedek",
        "jquery-ltruncate": "lib/jquery-ltruncate/jquery.ltruncate",
        "jquery-linkify": "lib/jquery-linkify/jquery.linkify.min",
        "jquery-toggles": "lib/jquery-toggles/toggles.min",
        polyglot: "lib/polyglot/polyglot.min",
        async: "lib/async/async",
        "event-emitter": "lib/event-emitter/event-emitter.4.0.3.min",
        raphael: "lib/justgage/raphael.2.1.0.min",
        justgage: "lib/justgage/justgage.1.0.1.min",
        chartjs: "lib/chartjs/chartjs.0.2.min",
        typeahead: "lib/typeahead/typeahead.min",
        select: "lib/select2/select2.min"
    }
});

require(["domready", "console", "startup/startup-manager", "startup/step-register-namespace", "startup/step-localize", "startup/step-wait-auth", "startup/step-wait-cc", "startup/step-wait-srest", "startup/step-first-setup", "startup/step-settings", "startup/step-get-user", "startup/step-pingback", "startup/step-routers", "startup/step-page", "startup/step-routing", "cloud-foundry-client/api", "stackato-client-extension/stackato-client", "access/access-control"], function (domReady, console) {
    domReady(function () {
        console.initialize()
    })
});