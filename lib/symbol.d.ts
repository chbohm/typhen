import * as config from './config';
export declare enum SymbolKind {
    Invalid = 0,
    Module = 1,
    EmptyType = 2,
    UnknownType = 3,
    PrimitiveType = 4,
    Enum = 5,
    EnumMember = 6,
    ObjectType = 7,
    Interface = 8,
    Class = 9,
    Array = 10,
    Function = 11,
    TypeParameter = 12,
    Tuple = 13,
    UnionType = 14,
    IntersectionType = 15,
    IndexType = 16,
    IndexedAccessType = 17,
    StringLiteralType = 18,
    BooleanLiteralType = 19,
    NumberLiteralType = 20,
    EnumLiteralType = 21,
    Property = 22,
    Method = 23,
    Signature = 24,
    Parameter = 25,
    Variable = 26,
    TypeAlias = 27,
}
export interface ObjectTable<T> {
    [name: string]: T;
}
export declare class Tag {
    name: string;
    value: string;
    constructor(name: string, value?: string);
    readonly number: number;
    readonly boolean: boolean;
    toString(): string;
}
export declare class DeclarationInfo {
    fileName: string;
    path: string;
    fullText: string;
    lineAndCharacterNumber: {
        line: number;
        character: number;
    };
    constructor(fileName: string, path: string, fullText: string, lineAndCharacterNumber: {
        line: number;
        character: number;
    });
    toString(): string;
}
export declare class Decorator {
    decoratorFunction: Function;
    argumentTable: ObjectTable<any>;
    readonly name: string;
    readonly parameters: Parameter[];
    readonly arguments: any[];
    constructor(decoratorFunction: Function, argumentTable: ObjectTable<any>);
    toString(): string;
}
export declare class TypePredicate {
    type: Type;
    thisType: Type;
    parameter: Parameter;
    constructor(type: Type, thisType: Type, parameter: Parameter);
    toString(): string;
}
export declare class IndexInfo {
    type: Type;
    isReadonly: boolean;
    constructor(type: Type, isReadonly?: boolean);
    toString(): string;
}
export declare class Symbol {
    protected config: config.Config;
    rawName: string;
    docComment: string[];
    declarationInfos: DeclarationInfo[];
    decorators: Decorator[];
    parentModule: Module | null;
    protected rawAssumedName: string;
    private static tagPattern;
    kind: SymbolKind;
    private isDestroyed;
    constructor(config: config.Config, rawName: string, docComment: string[], declarationInfos: DeclarationInfo[], decorators: Decorator[], parentModule: Module | null, rawAssumedName: string);
    readonly name: string;
    readonly assumedName: string;
    readonly fullName: string;
    readonly namespace: string;
    readonly ancestorModules: Module[];
    readonly comment: string;
    readonly tagTable: ObjectTable<Tag>;
    readonly tags: Tag[];
    readonly isAnonymous: boolean;
    readonly isAnonymousType: boolean;
    readonly isType: boolean;
    readonly isGenericType: boolean;
    readonly isGlobalModule: boolean;
    readonly isModule: boolean;
    readonly isEmptyType: boolean;
    readonly isPrimitiveType: boolean;
    readonly isEnum: boolean;
    readonly isEnumMember: boolean;
    readonly isObjectType: boolean;
    readonly isInterface: boolean;
    readonly isClass: boolean;
    readonly isArray: boolean;
    readonly isFunction: boolean;
    readonly isTypeParameter: boolean;
    readonly isTuple: boolean;
    readonly isUnionType: boolean;
    readonly isIntersectionType: boolean;
    readonly isIndexType: boolean;
    readonly isIndexedAccessType: boolean;
    readonly isStringLiteralType: boolean;
    readonly isBooleanLiteralType: boolean;
    readonly isNumberLiteralType: boolean;
    readonly isEnumLiteralType: boolean;
    readonly isProperty: boolean;
    readonly isMethod: boolean;
    readonly isSignature: boolean;
    readonly isParameter: boolean;
    readonly isVariable: boolean;
    readonly isTypeAlias: boolean;
    readonly isGenerationTarget: boolean;
    readonly isLiteralType: boolean;
    toString(): string;
    validate(): void;
    destroy(ok?: boolean): void;
}
export declare class Type extends Symbol {
    readonly isType: boolean;
}
export declare class Module extends Symbol {
    kind: SymbolKind;
    isNamespaceModule: boolean;
    importedModuleTable: ObjectTable<Module>;
    importedTypeTable: ObjectTable<Type>;
    modules: Module[];
    types: Type[];
    anonymousTypes: Type[];
    variables: Variable[];
    typeAliases: TypeAlias[];
    readonly enums: Enum[];
    readonly functions: Function[];
    readonly interfaces: Interface[];
    readonly classes: Class[];
    readonly isGlobalModule: boolean;
    readonly name: string;
    readonly importedModules: {
        name: string;
        module: Module;
    }[];
    readonly importedTypes: {
        name: string;
        type: Type;
    }[];
    initialize(isNamespaceModule: boolean, importedModuleTable: ObjectTable<Module>, importedTypeTable: ObjectTable<Type>, modules: Module[], types: Type[], variables: Variable[], typeAliases: TypeAlias[]): Module;
}
export declare class EmptyType extends Type {
    kind: SymbolKind;
}
export declare class PrimitiveType extends Type {
    kind: SymbolKind;
    readonly isGenerationTarget: boolean;
    initialize(rawName: string): PrimitiveType;
    validate(): void | string;
}
export declare class UnknownType extends Type {
    kind: SymbolKind;
    readonly isGenerationTarget: boolean;
    initialize(rawName: string): UnknownType;
    validate(): void | string;
}
export declare class Enum extends Type {
    kind: SymbolKind;
    members: EnumMember[];
    isConst: boolean;
    initialize(members: EnumMember[], isConst: boolean): Enum;
}
export declare class EnumMember extends Symbol {
    kind: SymbolKind;
    value: number;
    initialize(value: number): EnumMember;
}
export declare class Function extends Type {
    kind: SymbolKind;
    callSignatures: Signature[];
    initialize(callSignatures: Signature[]): Function;
    validate(): void | string;
}
export declare class ObjectLikeType extends Type {
    properties: Property[];
    methods: Method[];
    builtInSymbolMethods: Method[];
    stringIndex: IndexInfo | null;
    numberIndex: IndexInfo | null;
    readonly ownProperties: Property[];
    readonly ownMethods: Method[];
    initialize(properties: Property[], methods: Method[], builtInSymbolMethods: Method[], stringIndex: IndexInfo | null, numberIndex: IndexInfo | null, ...forOverride: any[]): ObjectLikeType;
    validate(): void | string;
}
export declare class ObjectType extends ObjectLikeType {
    kind: SymbolKind;
    templateType: Type | null;
    basedMappedType: ObjectType | null;
    readonly assumedName: string;
    readonly indexedAccessType: IndexedAccessType | null;
    readonly isMappedType: boolean;
    initialize(properties: Property[], methods: Method[], builtInSymbolMethods: Method[], stringIndex: IndexInfo | null, numberIndex: IndexInfo | null, templateType: Type | null, basedMappedType: ObjectType | null, ...forOverride: any[]): ObjectType;
    validate(): void | string;
    private getAssumedNameFromIndexedAccessType(indexedAccessType);
}
export declare class TypeReference {
    typeParameters: TypeParameter[];
    private rawTypeArguments;
    readonly typeArguments: Type[];
    constructor(typeParameters: TypeParameter[], rawTypeArguments: Type[]);
    getTypeByTypeParameter(typeParameter: TypeParameter): Type | null;
    addTypeArgument(type: Type): void;
    getUnboundTypeParameters(): TypeParameter[];
}
export declare class Interface extends ObjectLikeType {
    kind: SymbolKind;
    constructorSignatures: Signature[];
    callSignatures: Signature[];
    baseTypes: Interface[];
    typeReference: TypeReference;
    staticProperties: Property[];
    staticMethods: Method[];
    isAbstract: boolean;
    readonly isGenericType: boolean;
    readonly typeParameters: Type[];
    readonly typeArguments: Type[];
    readonly assumedName: string;
    initialize(properties: Property[], methods: Method[], builtInSymbolMethods: Method[], stringIndex: IndexInfo | null, numberIndex: IndexInfo | null, typeReference: TypeReference, constructorSignatures: Signature[], callSignatures: Signature[], baseTypes: Interface[], staticProperties: Property[], staticMethods: Method[], isAbstract: boolean): Interface;
    validate(): void | string;
}
export declare class Class extends Interface {
    kind: SymbolKind;
}
export declare class Array extends Type {
    kind: SymbolKind;
    type: Type;
    readonly isGenerationTarget: boolean;
    readonly assumedName: string;
    initialize(type: Type): Array;
}
export declare class TypeParameter extends Type {
    kind: SymbolKind;
    constraint: Type | null;
    initialize(constraint: Type | null): TypeParameter;
}
export declare class Tuple extends Type {
    kind: SymbolKind;
    types: Type[];
    readonly assumedName: string;
    initialize(types: Type[]): Tuple;
    validate(): void | string;
}
export declare class UnionType extends Type {
    kind: SymbolKind;
    types: Type[];
    readonly assumedName: string;
    initialize(types: Type[]): UnionType;
    validate(): void | string;
}
export declare class IntersectionType extends Type {
    kind: SymbolKind;
    types: Type[];
    readonly assumedName: string;
    initialize(types: Type[]): UnionType;
    validate(): void | string;
}
export declare class IndexType extends Type {
    kind: SymbolKind;
    type: Type;
    readonly assumedName: string;
    initialize(type: Type): IndexType;
}
export declare class IndexedAccessType extends Type {
    kind: SymbolKind;
    objectType: Type;
    indexType: Type;
    constraint: Type | null;
    readonly assumedName: string;
    initialize(objectType: Type, indexType: Type, constraint: Type | null): IndexedAccessType;
}
export declare class LiteralType extends Type {
    readonly isLiteralType: boolean;
    validate(): void | string;
}
export declare class StringLiteralType extends LiteralType {
    kind: SymbolKind;
    text: string;
    readonly rawText: string;
    readonly assumedName: string;
    initialize(text: string): StringLiteralType;
}
export declare class BooleanLiteralType extends LiteralType {
    kind: SymbolKind;
    value: boolean;
    readonly assumedName: string;
    initialize(value: boolean): BooleanLiteralType;
}
export declare class NumberLiteralType extends LiteralType {
    kind: SymbolKind;
    value: number;
    readonly assumedName: string;
    initialize(value: number): NumberLiteralType;
}
export declare class EnumLiteralType extends LiteralType {
    kind: SymbolKind;
    enumType: Enum;
    enumMember: EnumMember;
    readonly assumedName: string;
    initialize(enumType: Enum, enumMember: EnumMember): EnumLiteralType;
}
export declare class Property extends Symbol {
    kind: SymbolKind;
    type: Type;
    isOptional: boolean;
    isOwn: boolean;
    isProtected: boolean;
    isReadonly: boolean;
    isAbstract: boolean;
    initialize(type: Type, isOptional: boolean, isOwn: boolean, isProtected: boolean, isReadonly: boolean, isAbstract: boolean): Property;
}
export declare class Method extends Symbol {
    kind: SymbolKind;
    callSignatures: Signature[];
    isOptional: boolean;
    isOwn: boolean;
    isAbstract: boolean;
    initialize(callSignatures: Signature[], isOptional: boolean, isOwn: boolean, isAbstract: boolean): Method;
    validate(): void | string;
}
export declare class Signature extends Symbol {
    kind: SymbolKind;
    typeParameters: TypeParameter[];
    parameters: Parameter[];
    returnType: Type;
    typePredicate: TypePredicate | null;
    isProtected: boolean;
    initialize(typeParameters: TypeParameter[], parameters: Parameter[], returnType: Type, typePredicate: TypePredicate | null, isProtected: boolean): Signature;
    validate(): void | string;
}
export declare class Parameter extends Symbol {
    kind: SymbolKind;
    type: Type;
    isOptional: boolean;
    isVariadic: boolean;
    initialize(type: Type, isOptional: boolean, isVariadic: boolean): Parameter;
}
export declare class Variable extends Symbol {
    kind: SymbolKind;
    type: Type | null;
    module: Module | null;
    isLet: boolean;
    isConst: boolean;
    initialize(type: Type | null, module: Module | null, isLet: boolean, isConst: boolean): Variable;
}
export declare class TypeAlias extends Symbol {
    kind: SymbolKind;
    type: Type;
    initialize(type: Type): TypeAlias;
}
