import * as ts from 'typescript';
import * as plugin from './plugin';
import { Environment } from './environments/environment';
import CompilerHost from './compiler_host';
export interface TSConfigTyphenObject {
    plugin: string;
    pluginOptions: {
        [key: string]: any;
    };
    outDir: string;
    files?: string | string[];
    typingDirectory?: string;
    defaultLibFileName?: string;
    sourcesToRebind?: string[];
}
export interface ConfigObject {
    plugin: plugin.Plugin;
    src: string | string[];
    dest: string;
    cwd?: string;
    typingDirectory?: string;
    defaultLibFileName?: string;
    env?: Environment;
    noWrite?: boolean;
    compilerOptions?: ts.CompilerOptions;
    sourcesToRebind?: RegExp[];
}
export declare class Config implements ConfigObject {
    plugin: plugin.Plugin;
    src: string[];
    dest: string;
    cwd: string;
    typingDirectory: string;
    defaultLibFileName: string;
    env: Environment;
    noWrite: boolean;
    compilerOptions: ts.CompilerOptions;
    compilerHost: CompilerHost;
    sourcesToRebind: RegExp[];
    constructor(args: ConfigObject);
    getTypingDirectory(src: string[]): string;
}
