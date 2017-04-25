"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var Plugin = (function () {
    function Plugin(args) {
        this.newLine = '\n';
        this.namespaceSeparator = '.';
        this.customPrimitiveTypes = [];
        this.disallow = {};
        this.handlebarsOptions = {};
        _.assign(this, args);
    }
    Plugin.Empty = function () {
        return new Plugin({ pluginDirectory: '', generate: function () { } });
    };
    Plugin.prototype.rename = function (symbol, name) {
        return name;
    };
    Plugin.prototype.generate = function (generator, types, modules) {
        throw new Error('The plugin does not implement the generate function');
    };
    return Plugin;
}());
exports.Plugin = Plugin;
