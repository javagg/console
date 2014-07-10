//
// Copyright (c) Appsecute 2013 - ALL RIGHTS RESERVED.
//

/**
 * @description Sets up the global CClass object (Closure Class).
 * See http://www.ruzee.com/blog/2008/12/javascript-inheritance-via-prototypes-and-closures
 */
define([], function(){

    (function() {
        this.CClass = function() {
        };
        this.CClass.create = function(constructor) {
            var k = this;
            var c = function() {
                this._super = k;
                var pubs = constructor.apply(this, arguments),self = this;
                var key;
                var copyPrototype = function(fn, sfn) {
                    self[key] = typeof fn !== "function" || typeof sfn !== "function" ? fn : function() {
                        this._super = sfn;
                        return fn.apply(this, arguments)
                    }
                };
                for (key in pubs) {
                    copyPrototype(pubs[key], self[key])
                }
            };
            c.prototype = new this;
            c.prototype.constructor = c;
            c.extend = this.extend || this.create;
            return c
        }
    }());

    return window.CClass;
});