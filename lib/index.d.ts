/// <reference types="bluebird" />
/// <reference types="vinyl" />
import * as Promise from 'bluebird';
import * as ts from 'typescript';
import Vinyl = require('vinyl');
import * as plugin from './plugin';
import * as config from './config';
import * as symbol from './symbol';
import * as typhenLogger from './logger';
import * as typhenHelpers from './helpers';
import * as runner from './runner';
declare namespace Typhen {
    export import SymbolKind = symbol.SymbolKind;
    const logger: typeof typhenLogger;
    const helpers: typeof typhenHelpers;
    function run(configArgs: config.ConfigObject): Promise<Vinyl[]>;
    function runByTyphenfile(fileName: string): Promise<Vinyl[]>;
    function runByTSConfig(fileName: string): Promise<Vinyl[]>;
    function parse(src: string | string[], compilerOptions?: ts.CompilerOptions): runner.ParsedResult;
    function createPlugin(pluginArgs: plugin.PluginObject): plugin.Plugin;
    function loadPlugin(pluginName: string, options?: any): plugin.Plugin;
}
export = Typhen;
