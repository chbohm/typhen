import * as ts from 'typescript';
import { Environment } from './environments/environment';
export default class CompilerHost implements ts.CompilerHost {
    private env;
    private cachedSources;
    private version;
    constructor(env: Environment);
    getSourceFile(fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void): ts.SourceFile;
    getDefaultLibFileName(): string;
    fileExists(fileName: string): boolean;
    readFile(fileName: string): string;
    writeFile(fileName: string, data: string, writeByteOrderMark: boolean, onError?: (message: string) => void): void;
    getCurrentDirectory(): string;
    getDirectories(path: string): string[];
    useCaseSensitiveFileNames(): boolean;
    getCanonicalFileName(fileName: string): string;
    getNewLine(): string;
}
