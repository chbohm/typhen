/// <reference types="vinyl" />
import Vinyl = require('vinyl');
import * as symbol from './symbol';
import * as plugin from './plugin';
import { Environment } from './environments/environment';
export default class Generator {
    env: Environment;
    outputDirectory: string;
    pluginDirectory: string;
    private handlebarsOptions;
    private fileDataCache;
    private templateCache;
    files: Vinyl[];
    constructor(env: Environment, outputDirectory: string, pluginDirectory: string, handlebarsOptions: plugin.HandlebarsOptions);
    generateFiles(cwd: string, pattern: string, dest: string): void;
    generateUnlessExist(src: string, dest: string, context?: any): Vinyl;
    generate(src: string, dest: string, overwrite?: boolean): Vinyl;
    generate(src: string, dest: string, context: symbol.Symbol, overwrite?: boolean): Vinyl;
    createFile(options: {
        cwd?: string;
        base?: string;
        path?: string;
        contents?: any;
    }): Vinyl;
    replaceStars(str: string, symbol: symbol.Symbol, separator?: string): string;
    private getFileFromPluginDirectory(fileName);
    private getTemplate(templateName);
}
