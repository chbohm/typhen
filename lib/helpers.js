"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var inflection = require("inflection");
function applyHelperToStringWithSeparator(str, helper) {
    str = str.toString();
    var separators = _.uniq(str.match(/[^a-z_0-9]+/gi) || []);
    if (separators.length === 1) {
        return str.split(separators[0]).map(function (s) { return helper(s); }).join(separators[0]);
    }
    else {
        return helper(str);
    }
}
function underscore(str) {
    return applyHelperToStringWithSeparator(str, inflection.underscore);
}
exports.underscore = underscore;
function upperCamel(str) {
    return applyHelperToStringWithSeparator(str, inflection.camelize);
}
exports.upperCamel = upperCamel;
function upperCamelCase(str) {
    return upperCamel(str);
}
exports.upperCamelCase = upperCamelCase;
function lowerCamelCase(str) {
    return lowerCamel(str);
}
exports.lowerCamelCase = lowerCamelCase;
function lowerCamel(str) {
    return applyHelperToStringWithSeparator(str, function (s) {
        return inflection.camelize(s, true);
    });
}
exports.lowerCamel = lowerCamel;
function pluralize(str) {
    return inflection.pluralize(str);
}
exports.pluralize = pluralize;
function singularize(str) {
    return inflection.singularize(str);
}
exports.singularize = singularize;
