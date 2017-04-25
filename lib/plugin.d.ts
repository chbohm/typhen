/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import * as symbol from './symbol';
import Generator from './generator';
export interface DisallowOptions {
    any?: boolean;
    tuple?: boolean;
    unionType?: boolean;
    intersectionType?: boolean;
    overload?: boolean;
    generics?: boolean;
    anonymousFunction?: boolean;
    anonymousObject?: boolean;
    mappedType?: boolean;
    literalType?: boolean;
}
export interface HandlebarsOptions {
    data?: any;
    helpers?: {
        [helperName: string]: (...args: any[]) => any;
    };
    partials?: {
        [partialName: string]: any;
    };
}
export interface PluginObject {
    pluginDirectory: string;
    newLine?: string;
    namespaceSeparator?: string;
    customPrimitiveTypes?: string[];
    disallow?: DisallowOptions;
    handlebarsOptions?: HandlebarsOptions;
    rename?(symbol: symbol.Symbol, name: string): string;
    generate(generator: Generator, types: symbol.Type[], modules: symbol.Module[]): void | Promise<void>;
}
export declare class Plugin implements PluginObject {
    pluginDirectory: string;
    newLine: string;
    namespaceSeparator: string;
    customPrimitiveTypes: string[];
    disallow: DisallowOptions;
    handlebarsOptions: HandlebarsOptions;
    static Empty(): Plugin;
    constructor(args: PluginObject);
    rename(symbol: symbol.Symbol, name: string): string;
    generate(generator: Generator, types: symbol.Type[], modules: symbol.Module[]): void | Promise<void>;
}
