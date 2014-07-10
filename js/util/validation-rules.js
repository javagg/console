/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'jqueryvalidation'],
    function ($) {

        return {
            loadRules: function () {
                // Validation rule to ensure an item has been selected from a typeahead bar
                $.validator.addMethod("typeaheadSelected", function (value, element) {
                    return this.optional(element) || /^[a-z0-9\-]+$/i.test(value);
                }, "Please select an item.");

                $.validator.addMethod("positiveInt", function (value, element) {
                    return this.optional(element) || (/^\d+$/.test(value) && Number(value) > 0)
                }, polyglot.t('validation.positive_int'));
            }
        }
    }
);