"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var Promise = require("bluebird");
var logger = require("./logger");
var generator_1 = require("./generator");
var typescript_parser_1 = require("./typescript_parser");
var Runner = (function () {
    function Runner(config) {
        this.config = config;
    }
    Runner.prototype.parse = function () {
        var _this = this;
        logger.log(logger.underline('Parsing TypeScript files'));
        var parser = new typescript_parser_1.default(this.config.src, this.config);
        parser.parse();
        parser.validate();
        parser.sourceFiles.forEach(function (sourceFile) {
            var relative = _this.config.env.relativePath(sourceFile.fileName);
            logger.info('Parsed', logger.cyan(relative));
        });
        return {
            types: parser.types,
            modules: parser.modules
        };
    };
    Runner.prototype.run = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            logger.log(logger.underline('Parsing TypeScript files'));
            var parser = new typescript_parser_1.default(_this.config.src, _this.config);
            parser.parse();
            parser.validate();
            parser.sourceFiles.forEach(function (sourceFile) {
                var relative = _this.config.env.relativePath(sourceFile.fileName);
                logger.info('Parsed', logger.cyan(relative));
            });
            logger.log(logger.underline('Generating files'));
            var generator = new generator_1.default(_this.config.env, _this.config.dest, _this.config.plugin.pluginDirectory, _this.config.plugin.handlebarsOptions);
            var generateResult = _this.config.plugin.generate(generator, parser.types, parser.modules);
            var afterGenerate = function () {
                generator.files.forEach(function (file) {
                    if (file.contents === null) {
                        return;
                    }
                    if (!_this.config.noWrite) {
                        _this.config.env.writeFile(file.path, file.contents.toString());
                    }
                    var relative = _this.config.env.relativePath(file.path);
                    logger.info('Generated', logger.cyan(relative));
                });
                parser.types.forEach(function (t) { return t.destroy(true); });
                parser.modules.forEach(function (m) { return m.destroy(true); });
                logger.log('\n' + logger.green('✓'), 'Finished successfully!');
                resolve(generator.files);
            };
            if (_.isObject(generateResult) && typeof generateResult.then === 'function') {
                generateResult.then(afterGenerate).catch(reject);
            }
            else {
                afterGenerate();
            }
        });
    };
    return Runner;
}());
exports.Runner = Runner;
