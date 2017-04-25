declare namespace Logger {
    enum LogLevel {
        Debug = 0,
        Info = 1,
        Warning = 2,
        Error = 3,
        Silent = 4,
    }
    let level: LogLevel;
    function setLevel(logLevel: LogLevel): void;
    let colorEnabled: boolean;
    function enableColor(enabled: boolean): void;
    function debug(...texts: any[]): void;
    function info(...texts: any[]): void;
    function warn(...texts: any[]): void;
    function error(...texts: any[]): void;
    function log(...texts: any[]): void;
    function underline(text: string): string;
    function gray(text: string): string;
    function green(text: string): string;
    function red(text: string): string;
    function cyan(text: string): string;
    function yellow(text: string): string;
    function getDateTimeString(): string;
}
export = Logger;
