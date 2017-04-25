/// <reference types="bluebird" />
/// <reference types="vinyl" />
import * as Promise from 'bluebird';
import Vinyl = require('vinyl');
import * as config from './config';
import * as symbol from './symbol';
export interface ParsedResult {
    types: symbol.Type[];
    modules: symbol.Module[];
}
export declare class Runner {
    config: config.Config;
    constructor(config: config.Config);
    parse(): ParsedResult;
    run(): Promise<Vinyl[]>;
}
