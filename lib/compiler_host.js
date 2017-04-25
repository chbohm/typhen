"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var logger = require("./logger");
var CompilerHost = (function () {
    function CompilerHost(env) {
        this.env = env;
        this.cachedSources = {};
        this.version = 0;
    }
    CompilerHost.prototype.getSourceFile = function (fileName, languageVersion, onError) {
        if (this.cachedSources[fileName] === undefined) {
            var text = '';
            try {
                text = this.env.readFile(fileName);
            }
            catch (e) {
                throw new Error('Failed to read the file: fileName: ' + fileName + ' Error: ' + e);
            }
            this.cachedSources[fileName] = ts.createSourceFile(fileName, text, this.version, false);
        }
        return this.cachedSources[fileName];
    };
    CompilerHost.prototype.getDefaultLibFileName = function () {
        return this.env.defaultLibFileName;
    };
    CompilerHost.prototype.fileExists = function (fileName) {
        return this.env.exists(fileName);
    };
    CompilerHost.prototype.readFile = function (fileName) {
        return this.env.readFile(fileName);
    };
    CompilerHost.prototype.writeFile = function (fileName, data, writeByteOrderMark, onError) {
        logger.debug('Skip to write: ' + fileName);
    };
    CompilerHost.prototype.getCurrentDirectory = function () {
        return this.env.currentDirectory;
    };
    CompilerHost.prototype.getDirectories = function (path) {
        return this.env.getDirectories(path);
    };
    CompilerHost.prototype.useCaseSensitiveFileNames = function () {
        return this.env.useCaseSensitiveFileNames;
    };
    CompilerHost.prototype.getCanonicalFileName = function (fileName) {
        return this.useCaseSensitiveFileNames() ? fileName : fileName.toLowerCase();
    };
    CompilerHost.prototype.getNewLine = function () {
        return this.env.newLine;
    };
    return CompilerHost;
}());
exports.default = CompilerHost;
