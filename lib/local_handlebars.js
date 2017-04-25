"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var Handlebars = require("handlebars");
var helpers = require("./helpers");
var HandlebarsHelpers;
(function (HandlebarsHelpers) {
    function and() {
        var valuesAndOptions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            valuesAndOptions[_i] = arguments[_i];
        }
        var options = _.last(valuesAndOptions);
        var values = valuesAndOptions.filter(function (i) { return i !== options; });
        if (_.every(values, function (v) { return !Handlebars.Utils.isEmpty(v); })) {
            return options.fn(this);
        }
        else {
            return options.inverse(this);
        }
    }
    HandlebarsHelpers.and = and;
    function or() {
        var valuesAndOptions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            valuesAndOptions[_i] = arguments[_i];
        }
        var options = _.last(valuesAndOptions);
        var values = valuesAndOptions.filter(function (i) { return i !== options; });
        if (_.every(values, function (v) { return Handlebars.Utils.isEmpty(v); })) {
            return options.inverse(this);
        }
        else {
            return options.fn(this);
        }
    }
    HandlebarsHelpers.or = or;
    function underscore(str) {
        return helpers.underscore(str);
    }
    HandlebarsHelpers.underscore = underscore;
    function upperCamel(str) {
        return helpers.upperCamelCase(str);
    }
    HandlebarsHelpers.upperCamel = upperCamel;
    function upperCamelCase(str) {
        return helpers.upperCamelCase(str);
    }
    HandlebarsHelpers.upperCamelCase = upperCamelCase;
    function lowerCamel(str) {
        return helpers.lowerCamelCase(str);
    }
    HandlebarsHelpers.lowerCamel = lowerCamel;
    function lowerCamelCase(str) {
        return helpers.lowerCamelCase(str);
    }
    HandlebarsHelpers.lowerCamelCase = lowerCamelCase;
    function pluralize(str) {
        return helpers.pluralize(str);
    }
    HandlebarsHelpers.pluralize = pluralize;
    function singularize(str) {
        return helpers.singularize(str);
    }
    HandlebarsHelpers.singularize = singularize;
    function defaultValue(value, defaultValue) {
        return value ? value : defaultValue;
    }
    HandlebarsHelpers.defaultValue = defaultValue;
})(HandlebarsHelpers = exports.HandlebarsHelpers || (exports.HandlebarsHelpers = {}));
function registerHelpers(handlebars) {
    _.forEach(HandlebarsHelpers, function (helper, helperName) {
        handlebars.registerHelper(helperName, helper);
    });
}
exports.registerHelpers = registerHelpers;
exports.handlebars = Handlebars.create();
registerHelpers(exports.handlebars);
