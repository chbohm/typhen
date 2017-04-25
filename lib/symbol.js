"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var inflection = require("inflection");
var SymbolKind;
(function (SymbolKind) {
    SymbolKind[SymbolKind["Invalid"] = 0] = "Invalid";
    SymbolKind[SymbolKind["Module"] = 1] = "Module";
    SymbolKind[SymbolKind["EmptyType"] = 2] = "EmptyType";
    SymbolKind[SymbolKind["UnknownType"] = 3] = "UnknownType";
    SymbolKind[SymbolKind["PrimitiveType"] = 4] = "PrimitiveType";
    SymbolKind[SymbolKind["Enum"] = 5] = "Enum";
    SymbolKind[SymbolKind["EnumMember"] = 6] = "EnumMember";
    SymbolKind[SymbolKind["ObjectType"] = 7] = "ObjectType";
    SymbolKind[SymbolKind["Interface"] = 8] = "Interface";
    SymbolKind[SymbolKind["Class"] = 9] = "Class";
    SymbolKind[SymbolKind["Array"] = 10] = "Array";
    SymbolKind[SymbolKind["Function"] = 11] = "Function";
    SymbolKind[SymbolKind["TypeParameter"] = 12] = "TypeParameter";
    SymbolKind[SymbolKind["Tuple"] = 13] = "Tuple";
    SymbolKind[SymbolKind["UnionType"] = 14] = "UnionType";
    SymbolKind[SymbolKind["IntersectionType"] = 15] = "IntersectionType";
    SymbolKind[SymbolKind["IndexType"] = 16] = "IndexType";
    SymbolKind[SymbolKind["IndexedAccessType"] = 17] = "IndexedAccessType";
    SymbolKind[SymbolKind["StringLiteralType"] = 18] = "StringLiteralType";
    SymbolKind[SymbolKind["BooleanLiteralType"] = 19] = "BooleanLiteralType";
    SymbolKind[SymbolKind["NumberLiteralType"] = 20] = "NumberLiteralType";
    SymbolKind[SymbolKind["EnumLiteralType"] = 21] = "EnumLiteralType";
    SymbolKind[SymbolKind["Property"] = 22] = "Property";
    SymbolKind[SymbolKind["Method"] = 23] = "Method";
    SymbolKind[SymbolKind["Signature"] = 24] = "Signature";
    SymbolKind[SymbolKind["Parameter"] = 25] = "Parameter";
    SymbolKind[SymbolKind["Variable"] = 26] = "Variable";
    SymbolKind[SymbolKind["TypeAlias"] = 27] = "TypeAlias";
})(SymbolKind = exports.SymbolKind || (exports.SymbolKind = {}));
var Tag = (function () {
    function Tag(name, value) {
        if (value === void 0) { value = ''; }
        this.name = name;
        this.value = value;
    }
    Object.defineProperty(Tag.prototype, "number", {
        get: function () {
            var n = Number(this.value);
            return typeof n === 'number' ? n : 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tag.prototype, "boolean", {
        get: function () {
            return this.value !== 'false';
        },
        enumerable: true,
        configurable: true
    });
    Tag.prototype.toString = function () {
        return this.value;
    };
    return Tag;
}());
exports.Tag = Tag;
var DeclarationInfo = (function () {
    function DeclarationInfo(fileName, path, fullText, lineAndCharacterNumber) {
        this.fileName = fileName;
        this.path = path;
        this.fullText = fullText;
        this.lineAndCharacterNumber = lineAndCharacterNumber;
    }
    DeclarationInfo.prototype.toString = function () {
        return this.fileName +
            '(' + this.lineAndCharacterNumber.line + ',' +
            this.lineAndCharacterNumber.character + ')';
    };
    return DeclarationInfo;
}());
exports.DeclarationInfo = DeclarationInfo;
var Decorator = (function () {
    function Decorator(decoratorFunction, argumentTable) {
        this.decoratorFunction = decoratorFunction;
        this.argumentTable = argumentTable;
    }
    Object.defineProperty(Decorator.prototype, "name", {
        get: function () {
            return this.decoratorFunction.name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Decorator.prototype, "parameters", {
        get: function () {
            return this.arguments.length > 0 ? this.decoratorFunction.callSignatures[0].parameters : [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Decorator.prototype, "arguments", {
        get: function () {
            return _.values(this.argumentTable);
        },
        enumerable: true,
        configurable: true
    });
    Decorator.prototype.toString = function () {
        return this.name;
    };
    return Decorator;
}());
exports.Decorator = Decorator;
var TypePredicate = (function () {
    function TypePredicate(type, thisType, parameter) {
        this.type = type;
        this.thisType = thisType;
        this.parameter = parameter;
    }
    TypePredicate.prototype.toString = function () {
        return this.parameter ?
            this.parameter.name + ' is ' + this.type.name :
            this.thisType.toString() + ' is ' + this.type.name;
    };
    return TypePredicate;
}());
exports.TypePredicate = TypePredicate;
var IndexInfo = (function () {
    function IndexInfo(type, isReadonly) {
        if (isReadonly === void 0) { isReadonly = false; }
        this.type = type;
        this.isReadonly = isReadonly;
    }
    IndexInfo.prototype.toString = function () {
        return this.type.name;
    };
    return IndexInfo;
}());
exports.IndexInfo = IndexInfo;
var Symbol = (function () {
    function Symbol(config, rawName, docComment, declarationInfos, decorators, parentModule, rawAssumedName) {
        this.config = config;
        this.rawName = rawName;
        this.docComment = docComment;
        this.declarationInfos = declarationInfos;
        this.decorators = decorators;
        this.parentModule = parentModule;
        this.rawAssumedName = rawAssumedName;
        this.kind = SymbolKind.Invalid;
        this.isDestroyed = false;
    }
    Object.defineProperty(Symbol.prototype, "name", {
        get: function () {
            var name = _.isEmpty(this.assumedName) ? this.rawName : this.assumedName;
            return this.config.plugin.rename(this, name);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "assumedName", {
        get: function () {
            return this.rawAssumedName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "fullName", {
        get: function () {
            if (this.parentModule === null) {
                return this.name;
            }
            return [this.namespace, this.name].join(this.config.plugin.namespaceSeparator);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "namespace", {
        get: function () {
            return this.ancestorModules.map(function (s) { return s.name; }).join(this.config.plugin.namespaceSeparator);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "ancestorModules", {
        get: function () {
            var _this = this;
            return _.tap([], function (results) {
                var parentModule = _this.parentModule;
                while (parentModule !== null) {
                    results.push(parentModule);
                    parentModule = parentModule.parentModule;
                }
            }).reverse();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "comment", {
        get: function () {
            return this.docComment
                .filter(function (c) { return !Symbol.tagPattern.test(c); })
                .join(this.config.plugin.newLine);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "tagTable", {
        get: function () {
            return _.reduce(this.docComment, function (result, comment) {
                var matches = comment.match(Symbol.tagPattern);
                if (matches != null) {
                    result[matches[1]] = new Tag(matches[1], matches[2]);
                }
                return result;
            }, {});
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "tags", {
        get: function () {
            return _.values(this.tagTable);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isAnonymous", {
        get: function () { return this.rawName.length <= 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isAnonymousType", {
        get: function () { return this.isType && this.isAnonymous; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isType", {
        get: function () { return false; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isGenericType", {
        get: function () { return false; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isGlobalModule", {
        get: function () { return false; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isModule", {
        get: function () { return this.kind === SymbolKind.Module; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isEmptyType", {
        get: function () { return this.kind === SymbolKind.EmptyType; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isPrimitiveType", {
        get: function () { return this.kind === SymbolKind.PrimitiveType; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isEnum", {
        get: function () { return this.kind === SymbolKind.Enum; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isEnumMember", {
        get: function () { return this.kind === SymbolKind.EnumMember; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isObjectType", {
        get: function () { return this.kind === SymbolKind.ObjectType; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isInterface", {
        get: function () { return this.kind === SymbolKind.Interface; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isClass", {
        get: function () { return this.kind === SymbolKind.Class; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isArray", {
        get: function () { return this.kind === SymbolKind.Array; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isFunction", {
        get: function () { return this.kind === SymbolKind.Function; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isTypeParameter", {
        get: function () { return this.kind === SymbolKind.TypeParameter; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isTuple", {
        get: function () { return this.kind === SymbolKind.Tuple; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isUnionType", {
        get: function () { return this.kind === SymbolKind.UnionType; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isIntersectionType", {
        get: function () { return this.kind === SymbolKind.IntersectionType; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isIndexType", {
        get: function () { return this.kind === SymbolKind.IndexType; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isIndexedAccessType", {
        get: function () { return this.kind === SymbolKind.IndexedAccessType; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isStringLiteralType", {
        get: function () { return this.kind === SymbolKind.StringLiteralType; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isBooleanLiteralType", {
        get: function () { return this.kind === SymbolKind.BooleanLiteralType; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isNumberLiteralType", {
        get: function () { return this.kind === SymbolKind.NumberLiteralType; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isEnumLiteralType", {
        get: function () { return this.kind === SymbolKind.EnumLiteralType; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isProperty", {
        get: function () { return this.kind === SymbolKind.Property; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isMethod", {
        get: function () { return this.kind === SymbolKind.Method; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isSignature", {
        get: function () { return this.kind === SymbolKind.Signature; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isParameter", {
        get: function () { return this.kind === SymbolKind.Parameter; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isVariable", {
        get: function () { return this.kind === SymbolKind.Variable; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isTypeAlias", {
        get: function () { return this.kind === SymbolKind.TypeAlias; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isGenerationTarget", {
        get: function () {
            var _this = this;
            return this.declarationInfos.every(function (d) {
                var resolvedPath = _this.config.env.resolvePath(d.path);
                return resolvedPath !== _this.config.env.defaultLibFileName &&
                    _.includes(resolvedPath, _this.config.typingDirectory);
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Symbol.prototype, "isLiteralType", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Symbol.prototype.toString = function () {
        return this.name;
    };
    Symbol.prototype.validate = function () {
    };
    Symbol.prototype.destroy = function (ok) {
        var _this = this;
        if (ok === void 0) { ok = false; }
        if (!ok || this.isDestroyed) {
            return;
        }
        Object.keys(this).forEach(function (key) {
            delete _this[key];
        });
        this.isDestroyed = true;
    };
    return Symbol;
}());
Symbol.tagPattern = /^\s*@([^\s@]+)\s*([^\s@]*)\s*$/m;
exports.Symbol = Symbol;
var Type = (function (_super) {
    __extends(Type, _super);
    function Type() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Type.prototype, "isType", {
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    return Type;
}(Symbol));
exports.Type = Type;
var Module = (function (_super) {
    __extends(Module, _super);
    function Module() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.Module;
        _this.isNamespaceModule = false;
        _this.importedModuleTable = {};
        _this.importedTypeTable = {};
        _this.modules = [];
        _this.types = [];
        _this.anonymousTypes = [];
        _this.variables = [];
        _this.typeAliases = [];
        return _this;
    }
    Object.defineProperty(Module.prototype, "enums", {
        get: function () { return this.types.filter(function (t) { return t.isEnum; }); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Module.prototype, "functions", {
        get: function () { return this.types.filter(function (t) { return t.isFunction; }); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Module.prototype, "interfaces", {
        get: function () { return this.types.filter(function (t) { return t.isInterface; }); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Module.prototype, "classes", {
        get: function () { return this.types.filter(function (t) { return t.isClass; }); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Module.prototype, "isGlobalModule", {
        get: function () { return this.rawName === '' && this.parentModule === null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Module.prototype, "name", {
        get: function () {
            var name = this.isGlobalModule ? 'Global' : this.rawName;
            if (/^['"']/.test(name)) {
                name = name.replace(/['"]/g, '').replace('\\', '/');
                name = this.config.env.resolvePath(name);
                name = this.config.env.relativePath(this.config.typingDirectory, name);
            }
            return this.config.plugin.rename(this, name);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Module.prototype, "importedModules", {
        get: function () {
            return _.map(this.importedModuleTable, function (v, k) { return { name: k || '', module: v }; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Module.prototype, "importedTypes", {
        get: function () {
            return _.map(this.importedTypeTable, function (v, k) { return { name: k || '', type: v }; });
        },
        enumerable: true,
        configurable: true
    });
    Module.prototype.initialize = function (isNamespaceModule, importedModuleTable, importedTypeTable, modules, types, variables, typeAliases) {
        this.isNamespaceModule = isNamespaceModule;
        this.importedModuleTable = importedModuleTable;
        this.importedTypeTable = importedTypeTable;
        this.modules = modules;
        this.types = types;
        this.variables = variables;
        this.typeAliases = typeAliases;
        return this;
    };
    return Module;
}(Symbol));
exports.Module = Module;
var EmptyType = (function (_super) {
    __extends(EmptyType, _super);
    function EmptyType() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.EmptyType;
        return _this;
    }
    return EmptyType;
}(Type));
exports.EmptyType = EmptyType;
var PrimitiveType = (function (_super) {
    __extends(PrimitiveType, _super);
    function PrimitiveType() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.PrimitiveType;
        return _this;
    }
    Object.defineProperty(PrimitiveType.prototype, "isGenerationTarget", {
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    PrimitiveType.prototype.initialize = function (rawName) {
        this.rawName = rawName;
        return this;
    };
    PrimitiveType.prototype.validate = function () {
        if (this.config.plugin.disallow.any && this.rawName === 'any') {
            return 'Disallow to define the any type';
        }
    };
    return PrimitiveType;
}(Type));
exports.PrimitiveType = PrimitiveType;
var UnknownType = (function (_super) {
    __extends(UnknownType, _super);
    function UnknownType() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.UnknownType;
        return _this;
    }
    Object.defineProperty(UnknownType.prototype, "isGenerationTarget", {
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    UnknownType.prototype.initialize = function (rawName) {
        this.rawName = rawName;
        return this;
    };
    UnknownType.prototype.validate = function () {
        if (this.config.plugin.disallow.any && this.rawName === 'any') {
            return 'Disallow to define the any type';
        }
    };
    return UnknownType;
}(Type));
exports.UnknownType = UnknownType;
var Enum = (function (_super) {
    __extends(Enum, _super);
    function Enum() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.Enum;
        _this.members = [];
        _this.isConst = false;
        return _this;
    }
    Enum.prototype.initialize = function (members, isConst) {
        this.members = members;
        this.isConst = isConst;
        return this;
    };
    return Enum;
}(Type));
exports.Enum = Enum;
var EnumMember = (function (_super) {
    __extends(EnumMember, _super);
    function EnumMember() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.EnumMember;
        return _this;
    }
    EnumMember.prototype.initialize = function (value) {
        this.value = value;
        return this;
    };
    return EnumMember;
}(Symbol));
exports.EnumMember = EnumMember;
var Function = (function (_super) {
    __extends(Function, _super);
    function Function() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.Function;
        _this.callSignatures = [];
        return _this;
    }
    Function.prototype.initialize = function (callSignatures) {
        this.callSignatures = callSignatures;
        return this;
    };
    Function.prototype.validate = function () {
        if (this.config.plugin.disallow.overload && this.callSignatures.length > 1) {
            return 'Disallow to use function overloading';
        }
        else if (this.config.plugin.disallow.anonymousFunction && this.isAnonymousType) {
            return 'Disallow to define an anonymous function';
        }
    };
    return Function;
}(Type));
exports.Function = Function;
var ObjectLikeType = (function (_super) {
    __extends(ObjectLikeType, _super);
    function ObjectLikeType() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.properties = [];
        _this.methods = [];
        _this.builtInSymbolMethods = [];
        _this.stringIndex = null;
        _this.numberIndex = null;
        return _this;
    }
    Object.defineProperty(ObjectLikeType.prototype, "ownProperties", {
        get: function () { return this.properties.filter(function (p) { return p.isOwn; }); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ObjectLikeType.prototype, "ownMethods", {
        get: function () { return this.methods.filter(function (m) { return m.isOwn; }); },
        enumerable: true,
        configurable: true
    });
    ObjectLikeType.prototype.initialize = function (properties, methods, builtInSymbolMethods, stringIndex, numberIndex) {
        var forOverride = [];
        for (var _i = 5; _i < arguments.length; _i++) {
            forOverride[_i - 5] = arguments[_i];
        }
        this.properties = properties;
        this.methods = methods;
        this.builtInSymbolMethods = builtInSymbolMethods;
        this.stringIndex = stringIndex;
        this.numberIndex = numberIndex;
        return this;
    };
    ObjectLikeType.prototype.validate = function () {
        if (this.config.plugin.disallow.anonymousObject && this.isAnonymousType) {
            return 'Disallow to define an anonymous object';
        }
    };
    return ObjectLikeType;
}(Type));
exports.ObjectLikeType = ObjectLikeType;
var ObjectType = (function (_super) {
    __extends(ObjectType, _super);
    function ObjectType() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.ObjectType;
        return _this;
    }
    Object.defineProperty(ObjectType.prototype, "assumedName", {
        get: function () {
            if (this.indexedAccessType == null) {
                return this.rawAssumedName;
            }
            else {
                return this.getAssumedNameFromIndexedAccessType(this.indexedAccessType);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ObjectType.prototype, "indexedAccessType", {
        get: function () {
            if (this.templateType instanceof IndexedAccessType) {
                return this.templateType;
            }
            else if (this.templateType instanceof UnionType &&
                this.templateType.types.some(function (t) { return t.isIndexedAccessType; })) {
                return this.templateType.types.filter(function (t) { return t.isIndexedAccessType; })[0];
            }
            else {
                return null;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ObjectType.prototype, "isMappedType", {
        get: function () {
            return this.indexedAccessType != null && this.indexedAccessType.objectType.isTypeParameter;
        },
        enumerable: true,
        configurable: true
    });
    ObjectType.prototype.initialize = function (properties, methods, builtInSymbolMethods, stringIndex, numberIndex, templateType, basedMappedType) {
        var forOverride = [];
        for (var _i = 7; _i < arguments.length; _i++) {
            forOverride[_i - 7] = arguments[_i];
        }
        _super.prototype.initialize.call(this, properties, methods, builtInSymbolMethods, stringIndex, numberIndex);
        this.templateType = templateType;
        this.basedMappedType = basedMappedType;
        return this;
    };
    ObjectType.prototype.validate = function () {
        if (this.config.plugin.disallow.anonymousObject && this.isAnonymousType) {
            return 'Disallow to define an anonymous object';
        }
        else if (this.config.plugin.disallow.mappedType && this.templateType !== null) {
            return 'Disallow to define a mapped type';
        }
    };
    ObjectType.prototype.getAssumedNameFromIndexedAccessType = function (indexedAccessType) {
        if (indexedAccessType.objectType.isTypeParameter) {
            return this.rawAssumedName;
        }
        else {
            var objectTypeName = inflection.classify(indexedAccessType.objectType.name);
            return this.rawAssumedName + 'Of' + objectTypeName;
        }
    };
    return ObjectType;
}(ObjectLikeType));
exports.ObjectType = ObjectType;
var TypeReference = (function () {
    function TypeReference(typeParameters, rawTypeArguments) {
        this.typeParameters = typeParameters;
        this.rawTypeArguments = rawTypeArguments;
    }
    Object.defineProperty(TypeReference.prototype, "typeArguments", {
        get: function () { return this.rawTypeArguments.filter(function (t) { return !t.isTypeParameter; }); },
        enumerable: true,
        configurable: true
    });
    TypeReference.prototype.getTypeByTypeParameter = function (typeParameter) {
        var index = this.typeParameters.indexOf(typeParameter);
        if (index < 0) {
            return null;
        }
        var type = this.rawTypeArguments[index];
        return type.isTypeParameter ? null : type;
    };
    TypeReference.prototype.addTypeArgument = function (type) {
        this.rawTypeArguments.push(type);
    };
    TypeReference.prototype.getUnboundTypeParameters = function () {
        return this.typeParameters.slice(this.typeArguments.length);
    };
    return TypeReference;
}());
exports.TypeReference = TypeReference;
var Interface = (function (_super) {
    __extends(Interface, _super);
    function Interface() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.Interface;
        _this.constructorSignatures = [];
        _this.callSignatures = [];
        _this.baseTypes = [];
        _this.staticProperties = [];
        _this.staticMethods = [];
        _this.isAbstract = false;
        return _this;
    }
    Object.defineProperty(Interface.prototype, "isGenericType", {
        get: function () { return this.typeParameters.length > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Interface.prototype, "typeParameters", {
        get: function () { return this.typeReference ? this.typeReference.typeParameters : []; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Interface.prototype, "typeArguments", {
        get: function () { return this.typeReference ? this.typeReference.typeArguments : []; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Interface.prototype, "assumedName", {
        get: function () {
            if (this.typeArguments.length === 0) {
                return '';
            }
            // console.log('=======================START', this.rawName);
            var result = this.rawName + this.typeArguments.map(function (type, index) {
                var prefix = index === 0 ? 'Of' : 'And';
                // console.log('==', prefix + inflection.classify(type.name));
                return prefix + inflection.classify(type.name);
            }).join('');
            // console.log('=======================END', this.rawName);
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Interface.prototype.initialize = function (properties, methods, builtInSymbolMethods, stringIndex, numberIndex, typeReference, constructorSignatures, callSignatures, baseTypes, staticProperties, staticMethods, isAbstract) {
        _super.prototype.initialize.call(this, properties, methods, builtInSymbolMethods, stringIndex, numberIndex);
        this.constructorSignatures = constructorSignatures;
        this.callSignatures = callSignatures;
        this.baseTypes = baseTypes;
        this.typeReference = typeReference;
        this.staticProperties = staticProperties;
        this.staticMethods = staticMethods;
        this.isAbstract = isAbstract;
        return this;
    };
    Interface.prototype.validate = function () {
        if (this.config.plugin.disallow.generics && this.isGenericType) {
            return 'Disallow to define a generic type';
        }
        else if (this.config.plugin.disallow.overload && (this.callSignatures.length > 1 || this.constructorSignatures.length > 1)) {
            return 'Disallow to use function overloading';
        }
    };
    return Interface;
}(ObjectLikeType));
exports.Interface = Interface;
var Class = (function (_super) {
    __extends(Class, _super);
    function Class() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.Class;
        return _this;
    }
    return Class;
}(Interface));
exports.Class = Class;
var Array = (function (_super) {
    __extends(Array, _super);
    function Array() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.Array;
        return _this;
    }
    Object.defineProperty(Array.prototype, "isGenerationTarget", {
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Array.prototype, "assumedName", {
        get: function () {
            if (this.type === null) {
                return this.rawName;
            }
            return this.type.name + '[]';
        },
        enumerable: true,
        configurable: true
    });
    Array.prototype.initialize = function (type) {
        this.type = type;
        return this;
    };
    return Array;
}(Type));
exports.Array = Array;
var TypeParameter = (function (_super) {
    __extends(TypeParameter, _super);
    function TypeParameter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.TypeParameter;
        return _this;
    }
    TypeParameter.prototype.initialize = function (constraint) {
        this.constraint = constraint;
        return this;
    };
    return TypeParameter;
}(Type));
exports.TypeParameter = TypeParameter;
var Tuple = (function (_super) {
    __extends(Tuple, _super);
    function Tuple() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.Tuple;
        _this.types = [];
        return _this;
    }
    Object.defineProperty(Tuple.prototype, "assumedName", {
        get: function () {
            return this.types.map(function (t) { return inflection.classify(t.name); }).join('And') + 'Tuple';
        },
        enumerable: true,
        configurable: true
    });
    Tuple.prototype.initialize = function (types) {
        this.types = types;
        return this;
    };
    Tuple.prototype.validate = function () {
        if (this.config.plugin.disallow.tuple) {
            return 'Disallow to define a tuple type';
        }
    };
    return Tuple;
}(Type));
exports.Tuple = Tuple;
var UnionType = (function (_super) {
    __extends(UnionType, _super);
    function UnionType() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.UnionType;
        _this.types = [];
        return _this;
    }
    Object.defineProperty(UnionType.prototype, "assumedName", {
        get: function () {
            return this.types.map(function (t) { return inflection.classify(t.name); }).join('And') + 'UnionType';
        },
        enumerable: true,
        configurable: true
    });
    UnionType.prototype.initialize = function (types) {
        this.types = types;
        return this;
    };
    UnionType.prototype.validate = function () {
        if (this.config.plugin.disallow.unionType) {
            return 'Disallow to define an union type';
        }
    };
    return UnionType;
}(Type));
exports.UnionType = UnionType;
var IntersectionType = (function (_super) {
    __extends(IntersectionType, _super);
    function IntersectionType() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.IntersectionType;
        _this.types = [];
        return _this;
    }
    Object.defineProperty(IntersectionType.prototype, "assumedName", {
        get: function () {
            return this.types.map(function (t) { return inflection.classify(t.name); }).join('And') + 'IntersectionType';
        },
        enumerable: true,
        configurable: true
    });
    IntersectionType.prototype.initialize = function (types) {
        this.types = types;
        return this;
    };
    IntersectionType.prototype.validate = function () {
        if (this.config.plugin.disallow.intersectionType) {
            return 'Disallow to define an intersection type';
        }
    };
    return IntersectionType;
}(Type));
exports.IntersectionType = IntersectionType;
var IndexType = (function (_super) {
    __extends(IndexType, _super);
    function IndexType() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.IndexType;
        return _this;
    }
    Object.defineProperty(IndexType.prototype, "assumedName", {
        get: function () {
            return 'Keyof' + this.type.name;
        },
        enumerable: true,
        configurable: true
    });
    IndexType.prototype.initialize = function (type) {
        this.type = type;
        return this;
    };
    return IndexType;
}(Type));
exports.IndexType = IndexType;
var IndexedAccessType = (function (_super) {
    __extends(IndexedAccessType, _super);
    function IndexedAccessType() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.IndexedAccessType;
        return _this;
    }
    Object.defineProperty(IndexedAccessType.prototype, "assumedName", {
        get: function () {
            return this.objectType.name + '[' + this.indexType.name + ']';
        },
        enumerable: true,
        configurable: true
    });
    IndexedAccessType.prototype.initialize = function (objectType, indexType, constraint) {
        this.objectType = objectType;
        this.indexType = indexType;
        this.constraint = constraint;
        return this;
    };
    return IndexedAccessType;
}(Type));
exports.IndexedAccessType = IndexedAccessType;
var LiteralType = (function (_super) {
    __extends(LiteralType, _super);
    function LiteralType() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(LiteralType.prototype, "isLiteralType", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    LiteralType.prototype.validate = function () {
        if (this.config.plugin.disallow.literalType) {
            return 'Disallow to define a literal type';
        }
    };
    return LiteralType;
}(Type));
exports.LiteralType = LiteralType;
var StringLiteralType = (function (_super) {
    __extends(StringLiteralType, _super);
    function StringLiteralType() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.StringLiteralType;
        _this.text = '';
        return _this;
    }
    Object.defineProperty(StringLiteralType.prototype, "rawText", {
        get: function () {
            return this.text.replace(/"/g, '');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StringLiteralType.prototype, "assumedName", {
        get: function () {
            return this.text;
        },
        enumerable: true,
        configurable: true
    });
    StringLiteralType.prototype.initialize = function (text) {
        this.text = '"' + text + '"';
        return this;
    };
    return StringLiteralType;
}(LiteralType));
exports.StringLiteralType = StringLiteralType;
var BooleanLiteralType = (function (_super) {
    __extends(BooleanLiteralType, _super);
    function BooleanLiteralType() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.BooleanLiteralType;
        _this.value = false;
        return _this;
    }
    Object.defineProperty(BooleanLiteralType.prototype, "assumedName", {
        get: function () {
            return this.value.toString();
        },
        enumerable: true,
        configurable: true
    });
    BooleanLiteralType.prototype.initialize = function (value) {
        this.value = value;
        return this;
    };
    return BooleanLiteralType;
}(LiteralType));
exports.BooleanLiteralType = BooleanLiteralType;
var NumberLiteralType = (function (_super) {
    __extends(NumberLiteralType, _super);
    function NumberLiteralType() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.NumberLiteralType;
        _this.value = 0;
        return _this;
    }
    Object.defineProperty(NumberLiteralType.prototype, "assumedName", {
        get: function () {
            return this.value.toString();
        },
        enumerable: true,
        configurable: true
    });
    NumberLiteralType.prototype.initialize = function (value) {
        this.value = value;
        return this;
    };
    return NumberLiteralType;
}(LiteralType));
exports.NumberLiteralType = NumberLiteralType;
var EnumLiteralType = (function (_super) {
    __extends(EnumLiteralType, _super);
    function EnumLiteralType() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.EnumLiteralType;
        return _this;
    }
    Object.defineProperty(EnumLiteralType.prototype, "assumedName", {
        get: function () {
            return [this.enumType.name, this.enumMember.name].join(this.config.plugin.namespaceSeparator);
        },
        enumerable: true,
        configurable: true
    });
    EnumLiteralType.prototype.initialize = function (enumType, enumMember) {
        this.enumType = enumType;
        this.enumMember = enumMember;
        return this;
    };
    return EnumLiteralType;
}(LiteralType));
exports.EnumLiteralType = EnumLiteralType;
var Property = (function (_super) {
    __extends(Property, _super);
    function Property() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.Property;
        _this.isOptional = false;
        _this.isOwn = false;
        _this.isProtected = false;
        _this.isReadonly = false;
        _this.isAbstract = false;
        return _this;
    }
    Property.prototype.initialize = function (type, isOptional, isOwn, isProtected, isReadonly, isAbstract) {
        this.type = type;
        this.isOptional = isOptional;
        this.isOwn = isOwn;
        this.isProtected = isProtected;
        this.isReadonly = isReadonly;
        this.isAbstract = isAbstract;
        return this;
    };
    return Property;
}(Symbol));
exports.Property = Property;
var Method = (function (_super) {
    __extends(Method, _super);
    function Method() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.Method;
        _this.callSignatures = [];
        _this.isOptional = false;
        _this.isOwn = false;
        _this.isAbstract = false;
        return _this;
    }
    Method.prototype.initialize = function (callSignatures, isOptional, isOwn, isAbstract) {
        this.callSignatures = callSignatures;
        this.isOptional = isOptional;
        this.isOwn = isOwn;
        this.isAbstract = isAbstract;
        return this;
    };
    Method.prototype.validate = function () {
        if (this.config.plugin.disallow.overload && this.callSignatures.length > 1) {
            return 'Disallow to use function overloading';
        }
    };
    return Method;
}(Symbol));
exports.Method = Method;
var Signature = (function (_super) {
    __extends(Signature, _super);
    function Signature() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.Signature;
        _this.typeParameters = [];
        _this.parameters = [];
        _this.isProtected = false;
        return _this;
    }
    Signature.prototype.initialize = function (typeParameters, parameters, returnType, typePredicate, isProtected) {
        this.typeParameters = typeParameters;
        this.parameters = parameters;
        this.returnType = returnType;
        this.typePredicate = typePredicate;
        this.isProtected = isProtected;
        return this;
    };
    Signature.prototype.validate = function () {
        if (this.config.plugin.disallow.generics && this.typeParameters.length > 0) {
            return 'Disallow to define a generic function';
        }
    };
    return Signature;
}(Symbol));
exports.Signature = Signature;
var Parameter = (function (_super) {
    __extends(Parameter, _super);
    function Parameter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.Parameter;
        _this.isOptional = false;
        _this.isVariadic = false;
        return _this;
    }
    Parameter.prototype.initialize = function (type, isOptional, isVariadic) {
        this.type = type;
        this.isOptional = isOptional;
        this.isVariadic = isVariadic;
        return this;
    };
    return Parameter;
}(Symbol));
exports.Parameter = Parameter;
var Variable = (function (_super) {
    __extends(Variable, _super);
    function Variable() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.Variable;
        _this.isLet = false;
        _this.isConst = false;
        return _this;
    }
    Variable.prototype.initialize = function (type, module, isLet, isConst) {
        this.type = type;
        this.module = module;
        this.isLet = isLet;
        this.isConst = isConst;
        return this;
    };
    return Variable;
}(Symbol));
exports.Variable = Variable;
var TypeAlias = (function (_super) {
    __extends(TypeAlias, _super);
    function TypeAlias() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.kind = SymbolKind.TypeAlias;
        return _this;
    }
    TypeAlias.prototype.initialize = function (type) {
        this.type = type;
        return this;
    };
    return TypeAlias;
}(Symbol));
exports.TypeAlias = TypeAlias;
