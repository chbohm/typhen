"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var Vinyl = require("vinyl");
var symbol = require("./symbol");
var logger = require("./logger");
var localHandlebars = require("./local_handlebars");
var helpers = require("./helpers");
var Generator = (function () {
    function Generator(env, outputDirectory, pluginDirectory, handlebarsOptions) {
        this.env = env;
        this.outputDirectory = outputDirectory;
        this.pluginDirectory = pluginDirectory;
        this.handlebarsOptions = handlebarsOptions;
        this.fileDataCache = {};
        this.templateCache = {};
        this.files = [];
        this.outputDirectory = this.env.resolvePath(this.outputDirectory);
    }
    Generator.prototype.generateFiles = function (cwd, pattern, dest) {
        var _this = this;
        var resolvedCwd = this.env.resolvePath(this.pluginDirectory, cwd);
        var resolvedDest = this.env.resolvePath(this.outputDirectory, dest);
        this.env.glob(pattern, resolvedCwd).forEach(function (path) {
            _this.generate(_this.env.resolvePath(resolvedCwd, path), _this.env.resolvePath(resolvedDest, path));
        });
    };
    Generator.prototype.generateUnlessExist = function (src, dest, context) {
        if (context === void 0) { context = null; }
        return this.generate(src, dest, context, false);
    };
    Generator.prototype.generate = function (src, dest, context, overwrite) {
        if (typeof context === 'boolean') {
            overwrite = context;
            context = null;
        }
        if (context instanceof symbol.Symbol) {
            dest = this.replaceStars(dest, context);
        }
        var resolvedDest = this.env.resolvePath(this.outputDirectory, dest);
        var data;
        if (context !== null && /^.+\.hbs$/.test(src)) {
            logger.debug('Rendering: ' + src + ', ' + context);
            try {
                data = this.getTemplate(src)(context, this.handlebarsOptions);
            }
            catch (e) {
                logger.error("Failed to generate a file: src: " + src + ", dest: " + dest + "," +
                    ("resolvedDest: " + resolvedDest + ", context: " + (context ? context.name : '')));
                throw e;
            }
        }
        else {
            data = this.getFileFromPluginDirectory(src);
        }
        if (overwrite !== false || (!this.env.exists(resolvedDest) && this.files.every(function (f) { return f.path !== resolvedDest; }))) {
            var file = this.createFile({
                cwd: this.env.currentDirectory,
                base: this.outputDirectory,
                path: resolvedDest,
                contents: data
            });
            this.files.push(file);
            return file;
        }
        return null;
    };
    Generator.prototype.createFile = function (options) {
        if (typeof options.contents === 'string') {
            options.contents = new Buffer(options.contents);
        }
        return new Vinyl(options);
    };
    Generator.prototype.replaceStars = function (str, symbol, separator) {
        if (separator === void 0) { separator = '/'; }
        var matches = str.match(/(underscore|upperCamelCase|lowerCamelCase)?:?(.*\*.*)/);
        if (matches === null) {
            return str;
        }
        var inflectionType = matches[1] || '';
        var targetText = matches[2] || '';
        var inflect = function (name, inflectionType) {
            if (_.includes(name, '/')) {
                return name;
            }
            switch (inflectionType) {
                case 'underscore': return helpers.underscore(name);
                case 'upperCamelCase': return helpers.upperCamelCase(name);
                case 'lowerCamelCase': return helpers.lowerCamelCase(name);
                default: return name;
            }
        };
        return targetText
            .replace('**', symbol.ancestorModules.map(function (s) { return inflect(s.name, inflectionType); }).join(separator))
            .replace('*', inflect(symbol.name, inflectionType))
            .replace(/^\//, ''); // Avoid making an absolute path
    };
    Generator.prototype.getFileFromPluginDirectory = function (fileName) {
        var filePath = this.env.resolvePath(this.pluginDirectory, fileName);
        if (!this.fileDataCache[filePath]) {
            this.fileDataCache[filePath] = this.env.readFile(filePath);
        }
        return this.fileDataCache[filePath];
    };
    Generator.prototype.getTemplate = function (templateName) {
        var filePath = this.env.resolvePath(this.pluginDirectory, templateName);
        if (!this.templateCache[filePath]) {
            var templateSource = this.getFileFromPluginDirectory(filePath);
            logger.debug('Compiling the Template: ' + templateName);
            this.templateCache[filePath] = localHandlebars.handlebars.compile(templateSource);
        }
        return this.templateCache[filePath];
    };
    return Generator;
}());
exports.default = Generator;
