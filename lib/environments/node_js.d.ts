import * as ts from 'typescript';
import { Environment } from './environment';
export default class NodeJsEnvironment implements Environment {
    newLine: string;
    currentDirectory: string;
    useCaseSensitiveFileNames: boolean;
    defaultLibFileName: string;
    private libFilePattern;
    libFileNames: string[];
    constructor(currentDirectory: string, newLine: string, scriptTarget: ts.ScriptTarget, lib?: string[], defaultLibFileName?: string);
    readFile(fileName: string): string;
    writeFile(fileName: string, data: string): void;
    resolvePath(...pathSegments: string[]): string;
    relativePath(from: string, to?: string): string;
    dirname(fileName: string): string;
    exists(fileName: string): boolean;
    getDirectories(basePath: string): string[];
    getDefaultLibFileData(): string;
    glob(pattern: string, cwd?: string): string[];
    eval(code: string): any;
    private getLibFileNames(scriptTarget, defaultLibFileName?, lib?);
    private resolveTSLibPath(fileName);
}
