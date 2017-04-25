/// <reference types="handlebars" />
import * as Handlebars from 'handlebars';
export declare namespace HandlebarsHelpers {
    function and(...valuesAndOptions: any[]): any;
    function or(...valuesAndOptions: any[]): any;
    function underscore(str: string): string;
    function upperCamel(str: string): string;
    function upperCamelCase(str: string): string;
    function lowerCamel(str: string): string;
    function lowerCamelCase(str: string): string;
    function pluralize(str: string): string;
    function singularize(str: string): string;
    function defaultValue(value: any, defaultValue: any): any;
}
export declare function registerHelpers(handlebars: typeof Handlebars): void;
export declare const handlebars: typeof Handlebars;
