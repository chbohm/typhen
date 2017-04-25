"use strict";
var path = require("path");
var _ = require("lodash");
var ts = require("typescript");
var plugin = require("./plugin");
var config = require("./config");
var symbol = require("./symbol");
var typhenLogger = require("./logger");
var typhenHelpers = require("./helpers");
var runner = require("./runner");
var Typhen;
(function (Typhen) {
    Typhen.SymbolKind = symbol.SymbolKind;
    Typhen.logger = typhenLogger;
    Typhen.helpers = typhenHelpers;
    function run(configArgs) {
        var runningConfig = new config.Config(configArgs);
        return new runner.Runner(runningConfig).run();
    }
    Typhen.run = run;
    function runByTyphenfile(fileName) {
        return require(fileName)(Typhen);
    }
    Typhen.runByTyphenfile = runByTyphenfile;
    function runByTSConfig(fileName) {
        if (fileName.match(/tsconfig.json$/) === null) {
            throw new Error('No tsconfig file: ' + fileName);
        }
        var tsconfig = require(fileName);
        if (!_.isObject(tsconfig.typhen)) {
            throw new Error('tsconfig.json does not have typhen property');
        }
        var basePath = fileName.replace(/tsconfig.json$/, '');
        var _a = ts.convertCompilerOptionsFromJson(tsconfig.compilerOptions, basePath), compilerOptions = _a.options, errors = _a.errors;
        if (errors.length > 0) {
            throw new Error('Failed to convert the compiler options: ' + errors);
        }
        var promises = _.map(tsconfig.typhen, function (config) {
            return Typhen.run({
                plugin: Typhen.loadPlugin(config.plugin, config.pluginOptions),
                src: config.files || tsconfig.files,
                dest: config.outDir,
                compilerOptions: compilerOptions,
                cwd: fileName.replace(/tsconfig.json$/, ''),
                typingDirectory: config.typingDirectory,
                defaultLibFileName: config.defaultLibFileName,
                sourcesToRebind: config.sourcesToRebind ? config.sourcesToRebind.map(function (srcRegex) { return new RegExp(srcRegex); }) : [/.*/]
            });
        });
        return promises.reduce(function (p, fn) { return p.then(fn); });
    }
    Typhen.runByTSConfig = runByTSConfig;
    function parse(src, compilerOptions) {
        var parsingConfig = new config.Config({
            plugin: plugin.Plugin.Empty(),
            src: src,
            dest: '',
            compilerOptions: compilerOptions,
            noWrite: true,
            sourcesToRebind: [/.*/]
        });
        return new runner.Runner(parsingConfig).parse();
    }
    Typhen.parse = parse;
    function createPlugin(pluginArgs) {
        return new plugin.Plugin(pluginArgs);
    }
    Typhen.createPlugin = createPlugin;
    function loadPlugin(pluginName, options) {
        if (options === void 0) { options = {}; }
        try {
            return require(pluginName)(Typhen, options);
        }
        catch (e) {
            var resolvedPath = path.resolve(pluginName);
            return require(resolvedPath)(Typhen, options);
        }
    }
    Typhen.loadPlugin = loadPlugin;
})(Typhen || (Typhen = {}));
module.exports = Typhen;
