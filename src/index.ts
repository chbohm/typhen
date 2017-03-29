import * as path from 'path';
import * as _ from 'lodash';
import * as Promise from 'bluebird';
import * as ts from 'typescript';
import Vinyl = require('vinyl');

import * as plugin from './plugin';
import * as config from './config';
import * as symbol from './symbol';
import * as typhenLogger from './logger';
import * as typhenHelpers from './helpers';
import * as runner from './runner';

namespace Typhen {
  export import SymbolKind = symbol.SymbolKind;
  export const logger = typhenLogger;
  export const helpers = typhenHelpers;

  export function run(configArgs: config.ConfigObject): Promise<Vinyl[]> {
    const runningConfig = new config.Config(configArgs);
    return new runner.Runner(runningConfig).run();
  }

  export function runByTyphenfile(fileName: string): Promise<Vinyl[]> {
    return require(fileName)(Typhen);
  }

  export function runByTSConfig(fileName: string): Promise<Vinyl[]> {
    if (fileName.match(/tsconfig.json$/) === null) {
      throw new Error('No tsconfig file: ' + fileName);
    }
    const tsconfig = require(fileName);
    if (!_.isObject(tsconfig.typhen)) {
      throw new Error('tsconfig.json does not have typhen property');
    }
    const basePath = fileName.replace(/tsconfig.json$/, '');
    const { options: compilerOptions, errors } = ts.convertCompilerOptionsFromJson(tsconfig.compilerOptions, basePath);
    if (errors.length > 0) {
      throw new Error('Failed to convert the compiler options: ' + errors);
    }

    const promises = _.map(tsconfig.typhen, (config: config.TSConfigTyphenObject) => {
      return Typhen.run({
        plugin: Typhen.loadPlugin(config.plugin, config.pluginOptions),
        src: config.files || tsconfig.files,
        dest: config.outDir,
        compilerOptions: compilerOptions,
        cwd: fileName.replace(/tsconfig.json$/, ''),
        typingDirectory: config.typingDirectory,
        defaultLibFileName: config.defaultLibFileName,
        sourcesToRebind: config.sourcesToRebind ? config.sourcesToRebind.map(srcRegex => new RegExp(srcRegex)) : [/.*/]
      });
    });
    return promises.reduce((p: any, fn: any) => p.then(fn));
  }

  export function parse(src: string | string[], compilerOptions?: ts.CompilerOptions): runner.ParsedResult {
    const parsingConfig = new config.Config({
      plugin: plugin.Plugin.Empty(),
      src: src,
      dest: '',
      compilerOptions: compilerOptions,
      noWrite: true,
      sourcesToRebind: [/.*/]
    });
    return new runner.Runner(parsingConfig).parse();
  }

  export function createPlugin(pluginArgs: plugin.PluginObject): plugin.Plugin {
    return new plugin.Plugin(pluginArgs);
  }

  export function loadPlugin(pluginName: string, options: any = {}): plugin.Plugin {
    try {
      return <plugin.Plugin>require(pluginName)(Typhen, options);
    } catch (e) {
      const resolvedPath = path.resolve(pluginName);
      return <plugin.Plugin>require(resolvedPath)(Typhen, options);
    }
  }
}

export = Typhen;
