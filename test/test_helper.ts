/// <reference path="../typings/bundle.d.ts" />

require('source-map-support').install();

(<any>global).assert = require('power-assert');
(<any>global).sinon = require('sinon');

import _ = require('lodash');
import path = require('path');

import Symbol = require('../src/symbol');
import Plugin = require('../src/plugin');
import Runner = require('../src/runner');
import Config = require('../src/config');
import Logger = require('../src/logger');
import Generator = require('../src/generator');
import Environment = require('../src/environments/environment');

Logger.level = Logger.LogLevel.Silent;

export class TestEnvironment implements Environment {
  public currentDirectory: string = process.cwd() + '/test/fixtures/typings';
  public newLine: string = '\n';
  public useCaseSensitiveFileNames: boolean = false;
  public defaultLibFileName: string = 'lib.typhen.d.ts';

  constructor(
      private fileData: { [fileName: string]: string } = {}) {
  }

  public writeFile(fileName: string, data: string): void {}
  public glob(pattern: string, cwd?: string): string[] { return []; }

  public readFile(fileName: string): string {
    if (!this.fileData[fileName]) { throw new Error('Invalid file name: ' + fileName); }
    return this.fileData[fileName];
  }

  public resolvePath(...pathSegments: string[]): string {
    pathSegments = ['/'].concat(pathSegments);
    return path.resolve.apply(this, pathSegments);
  }

  public relativePath(from: string, to?: string): string {
    if (to === undefined) {
      from = '/';
      to = from;
    }
    return path.relative(from, to);
  }

  public dirname(fileName: string): string {
    return path.dirname(fileName);
  }

  public exists(fileName: string): boolean {
    return _.any(Object.keys(this.fileData), n => _.contains(fileName, n));
  }
}

export function createEnum(config?: Config.Config): Symbol.Enum {
  if (config === undefined) { config = createConfig(); }
  var appModule = new Symbol.Module(config, 'App', [''], [], null, '').initialize({}, {}, [], [], [], []);
  var typeModule = new Symbol.Module(config, 'Type', [''], [], appModule, '').initialize({}, {}, [], [], [], []);

  var type = new Symbol.Enum(config, 'FooType', ['awesome', '@default FooType.Bar', '@number 10',
      '@type Invalid', '@type Enum', '@true', '@false false'], [], typeModule, '');
  type.initialize([
    new Symbol.EnumMember(config, 'Bar', [''], [], typeModule, '').initialize(0),
    new Symbol.EnumMember(config, 'Baz', [''], [], typeModule, '').initialize(1)
  ], false);
  return type;
}

export function createPlugin(): Plugin.Plugin {
  return new Plugin.Plugin({
    pluginDirectory: process.cwd() + '/test/fixtures/plugin',
    customPrimitiveTypes: ['integer'],
    generate: function(types, generator) {}
  });
}

export function createConfig(): Config.Config {
  return new Config.Config({
    plugin: createPlugin(),
    src: 'test/fixtures/typings/definitions.d.ts',
    dest: '.tmp/generated'
  });
}

export function createGenerator(): Generator  {
  var env = new TestEnvironment({
    '/README.md': 'This is README.',
    '/plugin/README.md': 'This is README.',
    '/plugin/enum.hbs': '{{name}}\n{{#each members}}{{name}}: {{value}}\n{{/each}}'
  });
  return new Generator(env, '/generated', '/plugin', {});
}

export function createRunner(): Runner.Runner {
  return new Runner.Runner(createConfig());
}
