"use strict";
var chalk = require("chalk");
var Logger;
(function (Logger) {
    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["Debug"] = 0] = "Debug";
        LogLevel[LogLevel["Info"] = 1] = "Info";
        LogLevel[LogLevel["Warning"] = 2] = "Warning";
        LogLevel[LogLevel["Error"] = 3] = "Error";
        LogLevel[LogLevel["Silent"] = 4] = "Silent";
    })(LogLevel = Logger.LogLevel || (Logger.LogLevel = {}));
    Logger.level = LogLevel.Error;
    function setLevel(logLevel) {
        Logger.level = logLevel;
    }
    Logger.setLevel = setLevel;
    Logger.colorEnabled = true;
    function enableColor(enabled) {
        Logger.colorEnabled = enabled;
    }
    Logger.enableColor = enableColor;
    function debug() {
        var texts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            texts[_i] = arguments[_i];
        }
        logWithInfo(LogLevel.Debug, texts, gray('DEBUG'));
    }
    Logger.debug = debug;
    function info() {
        var texts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            texts[_i] = arguments[_i];
        }
        logWithInfo(LogLevel.Info, texts);
    }
    Logger.info = info;
    function warn() {
        var texts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            texts[_i] = arguments[_i];
        }
        logWithInfo(LogLevel.Warning, texts, yellow('WARN'));
    }
    Logger.warn = warn;
    function error() {
        var texts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            texts[_i] = arguments[_i];
        }
        logWithInfo(LogLevel.Error, texts, red('ERROR'));
    }
    Logger.error = error;
    function log() {
        var texts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            texts[_i] = arguments[_i];
        }
        if (Logger.level === LogLevel.Silent) {
            return;
        }
        console.log(texts.join(' '));
    }
    Logger.log = log;
    function underline(text) { return Logger.colorEnabled ? chalk.underline(text).toString() : text; }
    Logger.underline = underline;
    function gray(text) { return Logger.colorEnabled ? chalk.gray(text).toString() : text; }
    Logger.gray = gray;
    function green(text) { return Logger.colorEnabled ? chalk.green(text).toString() : text; }
    Logger.green = green;
    function red(text) { return Logger.colorEnabled ? chalk.red(text).toString() : text; }
    Logger.red = red;
    function cyan(text) { return Logger.colorEnabled ? chalk.cyan(text).toString() : text; }
    Logger.cyan = cyan;
    function yellow(text) { return Logger.colorEnabled ? chalk.yellow(text).toString() : text; }
    Logger.yellow = yellow;
    function getDateTimeString() {
        var date = new Date();
        return [date.getHours(), date.getMinutes(), date.getSeconds()]
            .map(function (n) { return n.toString(); })
            .map(function (n) { return n.length === 1 ? '0' + n : n; })
            .join(':');
    }
    Logger.getDateTimeString = getDateTimeString;
    function logWithInfo(logLevel, texts, kind) {
        if (kind === void 0) { kind = ''; }
        if (logLevel < Logger.level) {
            return;
        }
        if (kind.length > 0) {
            kind = '[' + kind + ']';
        }
        Logger.log('[' + gray(Logger.getDateTimeString()) + ']' + kind, texts.join(' '));
    }
})(Logger || (Logger = {}));
module.exports = Logger;
