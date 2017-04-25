"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var ts = require("typescript");
var node_js_1 = require("./environments/node_js");
var compiler_host_1 = require("./compiler_host");
var Config = (function () {
    function Config(args) {
        var _this = this;
        this.compilerOptions = _.defaults({}, args.compilerOptions, {
            module: ts.ModuleKind.CommonJS,
            noImplicitAny: true,
            target: ts.ScriptTarget.ES5
        });
        this.cwd = args.cwd || process.cwd();
        this.env = args.env || new node_js_1.default(this.cwd, args.plugin.newLine, this.compilerOptions.target || ts.ScriptTarget.ES3, this.compilerOptions.lib, args.defaultLibFileName);
        this.defaultLibFileName = this.env.defaultLibFileName;
        this.src = typeof args.src === 'string' ? [args.src] : args.src;
        this.src = this.src.map(function (s) { return _this.env.resolvePath(s); });
        this.dest = this.env.resolvePath(args.dest);
        this.cwd = this.env.resolvePath(this.cwd);
        this.typingDirectory = args.typingDirectory || this.getTypingDirectory(this.src);
        this.typingDirectory = this.env.resolvePath(this.typingDirectory);
        this.plugin = args.plugin;
        this.noWrite = args.noWrite || false;
        this.sourcesToRebind = args.sourcesToRebind || [/.*/];
        this.compilerHost = new compiler_host_1.default(this.env);
    }
    Config.prototype.getTypingDirectory = function (src) {
        var _this = this;
        var dirnames = src.map(function (s) {
            var resolvedPath = _this.env.resolvePath(s);
            return _this.env.dirname(resolvedPath).replace('\\', '/');
        });
        if (!dirnames.every(function (d) { return _.includes(d, _this.cwd); })) {
            return this.cwd;
        }
        var minDirCount = _.min(dirnames.map(function (d) { return d.split('/').length; }));
        var minDirnames = dirnames.filter(function (d) { return d.split('/').length === minDirCount; });
        return minDirnames.every(function (d) { return d === minDirnames[0]; }) ? minDirnames[0] : this.cwd;
    };
    return Config;
}());
exports.Config = Config;
