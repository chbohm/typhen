"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var pathExists = require("path-exists");
var mkdirp = require("mkdirp");
var _ = require("lodash");
var glob = require("glob");
var ts = require("typescript");
var Logger = require("../logger");
var NodeJsEnvironment = (function () {
    function NodeJsEnvironment(currentDirectory, newLine, scriptTarget, lib, defaultLibFileName) {
        this.newLine = newLine;
        this.useCaseSensitiveFileNames = false;
        this.defaultLibFileName = '@@__defaultLibFile.d.ts';
        this.libFilePattern = new RegExp('^lib\.[a-z0-9.]+\.d\.ts$');
        this.currentDirectory = path.resolve(currentDirectory);
        this.libFileNames = this.getLibFileNames(scriptTarget, defaultLibFileName, lib);
    }
    NodeJsEnvironment.prototype.readFile = function (fileName) {
        if (fileName === this.defaultLibFileName) {
            return this.getDefaultLibFileData();
        }
        if (this.libFilePattern.test(fileName)) {
            var resolvedTSLibPath = this.resolveTSLibPath(fileName);
            if (this.exists(resolvedTSLibPath)) {
                return fs.readFileSync(resolvedTSLibPath, 'utf-8');
            }
        }
        var resolvedPath = this.resolvePath(fileName);
        Logger.debug('Reading: ' + resolvedPath);
        return fs.readFileSync(resolvedPath, 'utf-8');
    };
    NodeJsEnvironment.prototype.writeFile = function (fileName, data) {
        var filePath = this.resolvePath(fileName);
        Logger.debug('Writing: ' + filePath);
        mkdirp.sync(path.dirname(filePath));
        fs.writeFileSync(filePath, data);
    };
    NodeJsEnvironment.prototype.resolvePath = function () {
        var pathSegments = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            pathSegments[_i] = arguments[_i];
        }
        var args = _.flatten([this.currentDirectory, pathSegments], true);
        return path.resolve.apply(null, args);
    };
    NodeJsEnvironment.prototype.relativePath = function (from, to) {
        if (to === undefined) {
            to = from;
            from = this.currentDirectory;
        }
        return path.relative(from, to);
    };
    NodeJsEnvironment.prototype.dirname = function (fileName) {
        return path.dirname(fileName);
    };
    NodeJsEnvironment.prototype.exists = function (fileName) {
        var filePath = this.resolvePath(fileName);
        return pathExists.sync(filePath);
    };
    NodeJsEnvironment.prototype.getDirectories = function (basePath) {
        return fs.readdirSync(basePath).map(function (d) { return path.join(basePath, d); })
            .filter(function (d) { return fs.statSync(d).isDirectory(); });
    };
    NodeJsEnvironment.prototype.getDefaultLibFileData = function () {
        Logger.debug('Reading dafaultLibFile data');
        return this.libFileNames.map(function (fileName) {
            return fs.readFileSync(fileName, 'utf-8');
        }).join('\n');
    };
    NodeJsEnvironment.prototype.glob = function (pattern, cwd) {
        if (cwd === void 0) { cwd = this.currentDirectory; }
        return glob.sync(pattern, {
            cwd: cwd,
            nodir: true
        });
    };
    NodeJsEnvironment.prototype.eval = function (code) {
        var sandbox = {};
        var resultKey = 'RESULT_' + Math.floor(Math.random() * 1000000);
        sandbox[resultKey] = {};
        vm.runInNewContext(resultKey + '=' + code, sandbox);
        return sandbox[resultKey];
    };
    NodeJsEnvironment.prototype.getLibFileNames = function (scriptTarget, defaultLibFileName, lib) {
        var _this = this;
        if (typeof defaultLibFileName === 'string' && defaultLibFileName.length > 0) {
            if (this.exists(this.defaultLibFileName)) {
                return [this.resolvePath(defaultLibFileName)];
            }
            else {
                return [this.resolveTSLibPath(defaultLibFileName)];
            }
        }
        if (_.isArray(lib)) {
            return lib.map(function (libName) {
                return _this.resolveTSLibPath('lib.' + libName + '.d.ts');
            });
        }
        switch (scriptTarget) {
            case ts.ScriptTarget.ES2015:
                return [this.resolveTSLibPath('lib.es2015.d.ts'), this.resolveTSLibPath('lib.dom.d.ts')];
            case ts.ScriptTarget.ES2016:
                return [this.resolveTSLibPath('lib.es2016.d.ts'), this.resolveTSLibPath('lib.dom.d.ts')];
            case ts.ScriptTarget.ES2017:
                return [this.resolveTSLibPath('lib.es2017.d.ts'), this.resolveTSLibPath('lib.dom.d.ts')];
            default:
                return [this.resolveTSLibPath('lib.d.ts')];
        }
    };
    NodeJsEnvironment.prototype.resolveTSLibPath = function (fileName) {
        return path.join(path.dirname(require.resolve('typescript')), fileName);
    };
    return NodeJsEnvironment;
}());
exports.default = NodeJsEnvironment;
