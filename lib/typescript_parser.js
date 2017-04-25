"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var _ = require("lodash");
var inflection = require("inflection");
var HashMap = require("hashmap");
var logger = require("./logger");
var Symbol = require("./symbol");
var anySourceFileMatchesAnyRegex = function (regexs, sourceFile) {
    return regexs.some(function (regex) { return regex.test(sourceFile); });
};
var anySourceFileMatches = _.curry(anySourceFileMatchesAnyRegex);
var TypeScriptParser = (function () {
    function TypeScriptParser(fileNames, config) {
        this.fileNames = fileNames;
        this.config = config;
        this.moduleCache = new HashMap();
        this.typeCache = new HashMap();
        this.symbols = [];
        this.mappedTypes = new HashMap();
        this.arrayTypeName = 'Array';
        this.typeReferenceStack = [];
        this.emptyType = new Symbol.EmptyType(config, '', [], [], [], null, '');
    }
    Object.defineProperty(TypeScriptParser.prototype, "currentTypeReference", {
        get: function () { return _.last(this.typeReferenceStack) || null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeScriptParser.prototype, "sourceFiles", {
        get: function () {
            var _this = this;
            return this.program.getSourceFiles()
                .filter(function (s) {
                var resolvedPath = _this.config.env.resolvePath(s.fileName);
                return resolvedPath !== _this.config.env.defaultLibFileName &&
                    _.includes(resolvedPath, _this.config.typingDirectory);
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeScriptParser.prototype, "types", {
        get: function () {
            return _.chain(this.typeCache.values())
                .filter(function (t) { return t.isGenerationTarget; })
                .sortBy(function (t) { return t.fullName; })
                .value();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeScriptParser.prototype, "modules", {
        get: function () {
            return _.chain(this.moduleCache.values())
                .filter(function (t) { return t.isGenerationTarget; })
                .sortBy(function (t) { return t.fullName; })
                .value();
        },
        enumerable: true,
        configurable: true
    });
    TypeScriptParser.prototype.parse = function () {
        var _this = this;
        logger.debug('Loading the TypeScript files');
        this.program = ts.createProgram(this.fileNames, this.config.compilerOptions, this.config.compilerHost);
        this.typeChecker = this.program.getTypeChecker();
        logger.debug('Compiling the TypeScript files');
        var errors = ts.getPreEmitDiagnostics(this.program);
        errors.forEach(function (d) {
            var info = d.file ? [d.file.fileName, '(', d.start, ',', d.length, '):'].join('') : '';
            logger.error(logger.red(info), d.messageText);
            console.log(logger.red(info), d.messageText);
            throw new Error('Detect diagnostic messages of the TypeScript compiler');
        });
        logger.debug('Parsing the TypeScript symbols');
        this.sourceFiles.forEach(function (s) {
            _this.parseSourceFile(s);
        });
        this.types.forEach(function (t) {
            if (t.isAnonymousType && t.parentModule != null) {
                t.parentModule.anonymousTypes.push(t);
            }
        });
    };
    TypeScriptParser.prototype.validate = function () {
        logger.debug('Validating the typhen symbols');
        this.symbols.forEach(function (symbol) {
            var result = symbol.validate();
            if (typeof result === 'string') {
                throw new Error(result + ': ' + symbol.declarationInfos.map(function (d) { return d.toString(); }).join(', '));
            }
        });
    };
    TypeScriptParser.prototype.tryGetSymbolAtLocation = function (node) {
        return node.symbol;
    };
    TypeScriptParser.prototype.getSymbolAtLocation = function (node) {
        var symbol = this.tryGetSymbolAtLocation(node);
        if (symbol === undefined) {
            throw new Error('Failed to get a symbol');
        }
        return symbol;
    };
    TypeScriptParser.prototype.getSymbolLinksOfMappedType = function (symbol) {
        var type = symbol.type;
        var mappedTypeOrigin = symbol.mappedTypeOrigin;
        if (type === undefined || mappedTypeOrigin === undefined) {
            throw new Error('Failed to get a symbol links of mapped type');
        }
        return { type: type, mappedTypeOrigin: mappedTypeOrigin };
    };
    TypeScriptParser.prototype.tryGetMappedTypeNode = function (type) {
        var node = type.declaration;
        if (node === undefined || node.kind !== ts.SyntaxKind.MappedType) {
            return undefined;
        }
        return node;
    };
    TypeScriptParser.prototype.tryGetTemplateType = function (type) {
        return type.templateType;
    };
    TypeScriptParser.prototype.checkFlags = function (flagsA, flagsB) {
        return (flagsA & flagsB) > 0;
    };
    TypeScriptParser.prototype.checkModifiers = function (modifiers, kind) {
        if (!modifiers) {
            return false;
        }
        return _.values(modifiers).some(function (x) { return x.kind === kind; });
    };
    TypeScriptParser.prototype.makeErrorWithTypeInfo = function (message, type) {
        var typeInfo = ': Type: ' + this.typeChecker.typeToString(type) + ' TypeFlags: ' + type.flags;
        if (type.symbol) {
            return this.makeErrorWithSymbolInfo(message + typeInfo, type.symbol);
        }
        else {
            return new Error(message + typeInfo);
        }
    };
    TypeScriptParser.prototype.makeErrorWithSymbolInfo = function (message, symbol) {
        var symbolInfo = 'Symbol: ' + this.typeChecker.symbolToString(symbol);
        var infos = this.getDeclarationInfos(symbol);
        if (infos.length > 0) {
            symbolInfo += ' DeclarationInfos: ' + infos.map(function (d) { return d.toString(); }).join(',');
        }
        return new Error(message + symbolInfo);
    };
    TypeScriptParser.prototype.parseType = function (type) {
        if (this.typeCache.get(type) === undefined || this.shouldRebindTypeParameters(type)) {
            if (type.flags & ts.TypeFlags.TypeParameter) {
                this.parseTypeParameter(type);
            }
            else if (type.flags & ts.TypeFlags.String) {
                this.parsePrimitiveType(type);
            }
            else if (type.flags & ts.TypeFlags.StringLiteral) {
                this.parseStringLiteralType(type);
            }
            else if (type.flags & ts.TypeFlags.BooleanLiteral) {
                this.parseBooleanLiteralType(type);
            }
            else if (type.flags & ts.TypeFlags.NumberLiteral) {
                this.parseNumberLiteralType(type);
            }
            else if (type.flags & ts.TypeFlags.EnumLiteral) {
                this.parseEnumLiteralType(type);
            }
            else if (type.flags & ts.TypeFlags.Number) {
                this.parsePrimitiveType(type);
            }
            else if (type.flags & ts.TypeFlags.Boolean) {
                this.parsePrimitiveType(type);
            }
            else if (type.flags & ts.TypeFlags.ESSymbol) {
                this.parsePrimitiveType(type);
            }
            else if (type.flags & ts.TypeFlags.Void) {
                this.parsePrimitiveType(type);
            }
            else if (type.flags & ts.TypeFlags.Null) {
                this.parsePrimitiveType(type);
            }
            else if (type.flags & ts.TypeFlags.Never) {
                this.parsePrimitiveType(type);
            }
            else if (type.flags & ts.TypeFlags.Undefined) {
                this.parsePrimitiveType(type);
            }
            else if (type.flags & ts.TypeFlags.Any) {
                var anyType = this.typeCache.values().filter(function (t) { return t.isPrimitiveType && t.name === 'any'; })[0];
                if (anyType) {
                    return anyType;
                }
                this.parsePrimitiveType(type);
            }
            else if (type.flags & ts.TypeFlags.Enum) {
                this.parseEnum(type);
            }
            else if (type.flags & ts.TypeFlags.Union) {
                this.parseUnionType(type);
            }
            else if (type.flags & ts.TypeFlags.Intersection) {
                this.parseIntersectionType(type);
            }
            else if (type.flags & ts.TypeFlags.Index) {
                this.parseIndexType(type);
            }
            else if (type.flags & ts.TypeFlags.Object &&
                type.objectFlags & ts.ObjectFlags.Reference &&
                type.target.objectFlags & ts.ObjectFlags.Tuple) {
                this.parseTuple(type);
            }
            else if (type.flags & ts.TypeFlags.IndexedAccess) {
                return this.parseIndexedAccessType(type);
            }
            else if (type.flags & ts.TypeFlags.Object &&
                type.objectFlags & ts.ObjectFlags.Anonymous &&
                type.symbol === undefined) {
                return this.emptyType;
            }
            else if (type.symbol === undefined) {
                this.parseUnknownType(type);
            }
            else if (type.symbol.flags & ts.SymbolFlags.Function) {
                this.parseFunction(type);
            }
            else if (type.symbol.flags & ts.SymbolFlags.Class) {
                this.parseGenericType(type, Symbol.Class);
            }
            else if (type.symbol.flags & ts.SymbolFlags.Interface) {
                if (this.isTyphenPrimitiveType(type)) {
                    this.parsePrimitiveType(type);
                }
                else if (this.isArrayType(type)) {
                    this.parseArray(type);
                }
                else {
                    this.parseGenericType(type, Symbol.Interface);
                }
            }
            else if ((type.flags & ts.TypeFlags.Object && type.objectFlags & ts.ObjectFlags.Anonymous) ||
                type.symbol.flags & ts.SymbolFlags.TypeLiteral) {
                if (_.isEmpty(type.getCallSignatures())) {
                    this.parseObjectType(type);
                }
                else {
                    this.parseFunction(type);
                }
            }
            else {
                throw this.makeErrorWithTypeInfo('Unsupported type', type);
            }
        }
        var typhenType = this.typeCache.get(type);
        if (!typhenType) {
            throw this.makeErrorWithTypeInfo('Failed to parse type', type);
        }
        if (typhenType.isTypeParameter && this.currentTypeReference != null) {
            return this.currentTypeReference.getTypeByTypeParameter(typhenType) || typhenType;
        }
        else {
            return typhenType;
        }
    };
    TypeScriptParser.prototype.createTyphenSymbol = function (symbol, typhenSymbolClass, assumedNameSuffix) {
        var typhenSymbol;
        if (symbol === undefined) {
            typhenSymbol = new typhenSymbolClass(this.config, '', [], [], [], null, '');
        }
        else {
            var name_1 = typeof symbol.name === 'string' ?
                symbol.name.replace(/^__@/, '@@').replace(/^__.*$/, '') : '';
            var assumedName = _.isEmpty(name_1) && assumedNameSuffix ?
                this.getAssumedName(symbol, assumedNameSuffix) : '';
            typhenSymbol = new typhenSymbolClass(this.config, name_1, this.getDocComment(symbol), this.getDeclarationInfos(symbol), this.getDecorators(symbol), this.getParentModule(symbol), assumedName);
        }
        logger.debug('Creating', typhenSymbolClass.name + ':', 'module=' + typhenSymbol.ancestorModules.map(function (s) { return s.name; }).join('.') + ',', 'name=' + typhenSymbol.rawName + ',', 'declarations=' + typhenSymbol.declarationInfos.map(function (d) { return d.toString(); }).join(','));
        this.symbols.push(typhenSymbol);
        return typhenSymbol;
    };
    TypeScriptParser.prototype.createTyphenType = function (type, typhenTypeClass, assumedNameSuffix) {
        if (this.typeCache.get(type)) {
            // throw this.makeErrorWithTypeInfo('Already created the type', type);
        }
        var typhenType = this.createTyphenSymbol(type.symbol, typhenTypeClass, assumedNameSuffix);
        this.typeCache.set(type, typhenType);
        return typhenType;
    };
    TypeScriptParser.prototype.getOrCreateTyphenModule = function (symbol) {
        var name = symbol ? symbol.name : '';
        if (this.moduleCache.get(name)) {
            return this.moduleCache.get(name);
        }
        var typhenSymbol = this.createTyphenSymbol(symbol, Symbol.Module);
        this.moduleCache.set(name, typhenSymbol);
        return typhenSymbol;
    };
    TypeScriptParser.prototype.getDeclarationInfos = function (symbol) {
        var _this = this;
        if (symbol.declarations === undefined) {
            return [];
        }
        return symbol.declarations.map(function (d) {
            var sourceFile = d.getSourceFile();
            var resolvedPath = _this.config.env.resolvePath(sourceFile.fileName);
            var relativePath = _this.config.env.relativePath(resolvedPath);
            var lineAndCharacterNumber = sourceFile.getLineAndCharacterOfPosition(d.getStart());
            lineAndCharacterNumber.line += 1;
            return new Symbol.DeclarationInfo(relativePath, resolvedPath, d.getFullText(), lineAndCharacterNumber);
        });
    };
    TypeScriptParser.prototype.getDecorators = function (symbol) {
        var _this = this;
        if (symbol.valueDeclaration === undefined || symbol.valueDeclaration.decorators === undefined) {
            return [];
        }
        return symbol.valueDeclaration.decorators.map(function (d) { return _this.parseDecorator(d); });
    };
    TypeScriptParser.prototype.getParentModule = function (symbol) {
        var parentDecl = symbol.declarations ? symbol.declarations[0].parent : undefined;
        while (parentDecl) {
            var parentSymbol = this.tryGetSymbolAtLocation(parentDecl);
            if (parentSymbol && this.checkFlags(parentSymbol.flags, ts.SymbolFlags.Module)) {
                return this.getOrCreateTyphenModule(parentSymbol);
            }
            parentDecl = parentDecl.parent;
        }
        return null;
    };
    TypeScriptParser.prototype.getDocComment = function (symbol) {
        return _.tap([], function (results) {
            (symbol.declarations || []).forEach(function (decl) {
                var jsDocs = decl.jsDoc || []; // FIXME: TypeScript does not export JSDoc getting API at present.
                jsDocs.forEach(function (jsDoc) {
                    if (typeof jsDoc.comment === 'string') {
                        results.push(jsDoc.comment);
                    }
                    if (jsDoc.tags) {
                        jsDoc.tags.forEach(function (tag) {
                            results.push('@' + tag.tagName.text + ' ' + tag.comment);
                        });
                    }
                });
            });
        });
    };
    TypeScriptParser.prototype.getAssumedName = function (symbol, typeName) {
        var parentNames = [];
        var parentDecl = symbol.declarations ? symbol.declarations[0].parent : undefined;
        while (parentDecl) {
            var parentSymbol = this.tryGetSymbolAtLocation(parentDecl);
            if (parentSymbol) {
                if (this.checkFlags(parentSymbol.flags, ts.SymbolFlags.TypeAlias)) {
                    return parentSymbol.name;
                }
                else if (this.checkFlags(parentSymbol.flags, ts.SymbolFlags.Class) ||
                    this.checkFlags(parentSymbol.flags, ts.SymbolFlags.Interface) ||
                    this.checkFlags(parentSymbol.flags, ts.SymbolFlags.Property) ||
                    this.checkFlags(parentSymbol.flags, ts.SymbolFlags.Function) ||
                    this.checkFlags(parentSymbol.flags, ts.SymbolFlags.Method) ||
                    this.checkFlags(parentSymbol.flags, ts.SymbolFlags.Variable)) {
                    parentNames.push(inflection.camelize(parentSymbol.name));
                }
            }
            parentDecl = parentDecl.parent;
        }
        return parentNames.reverse().join('') + typeName;
    };
    TypeScriptParser.prototype.isTyphenPrimitiveType = function (type) {
        return type.symbol !== undefined && _.includes(this.config.plugin.customPrimitiveTypes, type.symbol.name);
    };
    TypeScriptParser.prototype.isArrayType = function (type) {
        return type.symbol !== undefined &&
            type.symbol.name === this.arrayTypeName &&
            this.getParentModule(type.symbol) === null;
    };
    TypeScriptParser.prototype.getSymbolsInScope = function (node, symbolFlags) {
        var _this = this;
        return this.typeChecker.getSymbolsInScope(node, symbolFlags)
            .filter(function (symbol) {
            return (symbol.declarations || []).every(function (d) {
                var resolvedPath = _this.config.env.resolvePath(d.getSourceFile().fileName);
                return resolvedPath !== _this.config.env.defaultLibFileName &&
                    _.includes(resolvedPath, _this.config.typingDirectory);
            });
        });
    };
    TypeScriptParser.prototype.parseDecorator = function (decorator) {
        var _this = this;
        var type = decorator.expression.getChildCount() === 0 ?
            this.typeChecker.getTypeAtLocation(decorator.expression) :
            this.typeChecker.getTypeAtLocation(decorator.expression.getChildren()
                .filter(function (c) { return c.kind === ts.SyntaxKind.Identifier; }).slice(-1)[0]);
        var decoratorFunction = this.parseType(type);
        var syntaxList = decorator.expression.getChildren()
            .filter(function (c) { return c.kind === ts.SyntaxKind.SyntaxList; }).slice(-1)[0];
        var argumentTable = syntaxList === undefined ?
            {} :
            _.zipObject(decoratorFunction.callSignatures[0].parameters.map(function (p) { return p.name; }), syntaxList.getChildren()
                .filter(function (node) { return node.kind !== ts.SyntaxKind.CommaToken; })
                .map(function (node) {
                if (node.kind === ts.SyntaxKind.FunctionExpression ||
                    node.kind === ts.SyntaxKind.ArrowFunction) {
                    return node.getText();
                }
                else {
                    try {
                        return _this.config.env.eval(node.getText());
                    }
                    catch (e) {
                        return node.getText();
                    }
                }
            }));
        return new Symbol.Decorator(decoratorFunction, argumentTable);
    };
    TypeScriptParser.prototype.parseSourceFile = function (sourceFile) {
        var _this = this;
        var sourceSymbol = this.tryGetSymbolAtLocation(sourceFile);
        var typhenSymbol = this.getOrCreateTyphenModule(sourceSymbol);
        var modules = this.getSymbolsInScope(sourceFile, ts.SymbolFlags.Module)
            .map(function (s) { return _this.parseModule(s); });
        var importedModuleTable = {};
        var importedTypeTable = {};
        this.getSymbolsInScope(sourceFile, ts.SymbolFlags.Alias)
            .forEach(function (s) {
            var aliasedSymbol = _this.typeChecker.getAliasedSymbol(s);
            if (_this.checkFlags(aliasedSymbol.flags, ts.SymbolFlags.Module)) {
                importedModuleTable[s.name] = _this.parseModule(aliasedSymbol);
            }
            else if (aliasedSymbol.declarations) {
                var aliasedType = _this.typeChecker.getTypeAtLocation(aliasedSymbol.declarations[0]);
                importedTypeTable[s.name] = _this.parseType(aliasedType);
            }
        });
        var types = this.getSymbolsInScope(sourceFile, ts.SymbolFlags.Type)
            .concat(this.getSymbolsInScope(sourceFile, ts.SymbolFlags.Function))
            .filter(function (s) { return s.declarations && s.declarations.length > 0; })
            .map(function (s) { return _this.typeChecker.getTypeAtLocation(s.declarations[0]); })
            .map(function (s) { return _this.parseType(s); });
        var variables = this.getSymbolsInScope(sourceFile, ts.SymbolFlags.Variable)
            .map(function (s) { return _this.parseVariable(s); });
        var typeAliases = this.getSymbolsInScope(sourceFile, ts.SymbolFlags.TypeAlias)
            .map(function (s) { return _this.parseTypeAlias(s); });
        typhenSymbol.initialize(false, importedModuleTable, importedTypeTable, modules, types, variables, typeAliases);
    };
    TypeScriptParser.prototype.parseModule = function (symbol) {
        var _this = this;
        var typhenSymbol = this.getOrCreateTyphenModule(symbol);
        var isNamespaceModule = this.checkFlags(symbol.flags, ts.SymbolFlags.NamespaceModule);
        var exportedSymbols = this.typeChecker.getExportsOfModule(symbol);
        var modules = exportedSymbols
            .filter(function (s) { return _this.checkFlags(s.flags, ts.SymbolFlags.Module); })
            .map(function (s) { return _this.parseModule(s); });
        var importedModuleTable = {};
        var importedTypeTable = {};
        exportedSymbols
            .filter(function (s) { return _this.checkFlags(s.flags, ts.SymbolFlags.Alias); })
            .forEach(function (s) {
            var aliasedSymbol = _this.typeChecker.getAliasedSymbol(s);
            if (_this.checkFlags(aliasedSymbol.flags, ts.SymbolFlags.Module)) {
                importedModuleTable[s.name] = _this.parseModule(aliasedSymbol);
            }
            else if (aliasedSymbol.declarations) {
                var aliasedType = _this.typeChecker.getTypeAtLocation(aliasedSymbol.declarations[0]);
                importedTypeTable[s.name] = _this.parseType(aliasedType);
            }
        });
        var types = exportedSymbols
            .filter(function (s) { return _this.checkFlags(s.flags, ts.SymbolFlags.Type) || _this.checkFlags(s.flags, ts.SymbolFlags.Function); })
            .filter(function (s) { return s.declarations && s.declarations.length > 0; })
            .map(function (s) { return _this.typeChecker.getTypeAtLocation(s.declarations[0]); })
            .map(function (t) { return _this.parseType(t); });
        var variables = exportedSymbols
            .filter(function (s) { return _this.checkFlags(s.flags, ts.SymbolFlags.Variable); })
            .map(function (s) { return _this.parseVariable(s); });
        var typeAliases = exportedSymbols
            .filter(function (s) { return _this.checkFlags(s.flags, ts.SymbolFlags.TypeAlias); })
            .map(function (s) { return _this.parseTypeAlias(s); });
        return typhenSymbol.initialize(isNamespaceModule, importedModuleTable, importedTypeTable, modules, types, variables, typeAliases);
    };
    TypeScriptParser.prototype.parseEnum = function (type) {
        var _this = this;
        if (!type.symbol || !type.symbol.valueDeclaration) {
            throw this.makeErrorWithTypeInfo('Failed to parse enum type', type);
        }
        var typhenType = this.createTyphenType(type, Symbol.Enum);
        var isConst = this.checkFlags(type.symbol.valueDeclaration.flags, ts.NodeFlags.Const);
        var memberValue = -1;
        var members = _(type.symbol.valueDeclaration.members)
            .map(function (memberNode) {
            var memberSymbol = _this.getSymbolAtLocation(memberNode);
            var value = _this.typeChecker.getConstantValue(memberNode);
            memberValue = typeof value === 'number' ? value : memberValue + 1;
            return _this.createTyphenSymbol(memberSymbol, Symbol.EnumMember)
                .initialize(memberValue);
        }).value();
        return typhenType.initialize(members, isConst);
    };
    TypeScriptParser.prototype.parseIndexInfos = function (type) {
        if (!type.symbol || !type.symbol.members) {
            return { stringIndex: null, numberIndex: null };
            // throw this.makeErrorWithTypeInfo('Failed to parse index info', type);
        }
        var indexSymbol = type.symbol.members.get('__index') || null;
        var stringIndex = null;
        var numberIndex = null;
        if (type.getStringIndexType() != null) {
            var stringIndexType = this.parseType(type.getStringIndexType());
            var isReadonly = false;
            if (type.declaredStringIndexInfo != null) {
                isReadonly = type.declaredStringIndexInfo.isReadonly;
            }
            else if (indexSymbol != null && indexSymbol.declarations) {
                isReadonly = this.checkModifiers(indexSymbol.declarations[0].modifiers, ts.SyntaxKind.ReadonlyKeyword);
            }
            stringIndex = new Symbol.IndexInfo(stringIndexType, isReadonly);
        }
        if (type.getNumberIndexType() != null) {
            var numberIndexType = this.parseType(type.getNumberIndexType());
            var isReadonly = false;
            if (type.declaredNumberIndexInfo != null) {
                isReadonly = type.declaredNumberIndexInfo.isReadonly;
            }
            else if (indexSymbol != null && indexSymbol.declarations) {
                isReadonly = this.checkModifiers(indexSymbol.declarations[0].modifiers, ts.SyntaxKind.ReadonlyKeyword);
            }
            numberIndex = new Symbol.IndexInfo(numberIndexType, isReadonly);
        }
        return { stringIndex: stringIndex, numberIndex: numberIndex };
    };
    TypeScriptParser.prototype.parseGenericType = function (type, typhenTypeClass) {
        var _this = this;
        var genericType = type.target === undefined ? type : type.target;
        if (!genericType.symbol || !genericType.symbol.members) {
            throw this.makeErrorWithTypeInfo('Failed to parse generic type', type);
        }
        var ownMemberNames = _.toArray(genericType.symbol.members.values()).map(function (s) { return s.name; });
        var typhenType = this.createTyphenType(type, typhenTypeClass);
        var typeParameters = genericType.typeParameters === undefined ? [] :
            genericType.typeParameters.map(function (t) { return _this.parseType(t); });
        var typeArguments = type.typeArguments === undefined ? [] :
            type.typeArguments.map(function (t) { return _this.parseType(t); });
        var typeReference = new Symbol.TypeReference(typeParameters, typeArguments);
        this.typeReferenceStack.push(typeReference);
        var baseTypes = this.typeChecker.getBaseTypes(genericType)
            .map(function (t) { return _this.parseType(t); });
        var properties = genericType.getProperties()
            .filter(function (s) { return _this.checkFlags(s.flags, ts.SymbolFlags.Property) && s.valueDeclaration !== undefined &&
            !_this.checkModifiers(s.valueDeclaration.modifiers, ts.SyntaxKind.PrivateKeyword); })
            .map(function (s) { return _this.parseProperty(s, _.includes(ownMemberNames, s.name)); });
        var rawMethods = genericType.getProperties()
            .filter(function (s) { return _this.checkFlags(s.flags, ts.SymbolFlags.Method) && s.valueDeclaration !== undefined &&
            !_this.checkModifiers(s.valueDeclaration.modifiers, ts.SyntaxKind.PrivateKeyword) &&
            !_this.checkModifiers(s.valueDeclaration.modifiers, ts.SyntaxKind.ProtectedKeyword); })
            .map(function (s) { return _this.parseMethod(s, _.includes(ownMemberNames, s.name), false, baseTypes); });
        var methods = rawMethods.filter(function (m) { return m.name.indexOf('@@') !== 0; });
        var builtInSymbolMethods = rawMethods.filter(function (m) { return m.name.indexOf('@@') === 0; });
        var indexInfos = this.parseIndexInfos(genericType);
        var stringIndex = indexInfos.stringIndex;
        var numberIndex = indexInfos.numberIndex;
        var constructorSignatures = genericType.getConstructSignatures()
            .filter(function (s) { return s.declaration !== undefined; }) // constructor signature that has no declaration will be created by using typeof keyword.
            .map(function (s) { return _this.parseSignature(s, 'Constructor'); });
        var callSignatures = genericType.getCallSignatures().map(function (s) { return _this.parseSignature(s); });
        var staticProperties = [];
        var staticMethods = [];
        var isAbstract = false;
        if (genericType.symbol.flags & ts.SymbolFlags.Class) {
            var genericTypeDecl = genericType.symbol.valueDeclaration;
            isAbstract = this.checkModifiers(genericTypeDecl.modifiers, ts.SyntaxKind.AbstractKeyword);
            _.toArray(genericType.symbol.members.values())
                .filter(function (s) { return _this.checkFlags(s.flags, ts.SymbolFlags.Constructor); })
                .forEach(function (s) {
                (s.declarations || []).forEach(function (d) {
                    var signatureSymbol = _this.typeChecker.getSignatureFromDeclaration(d);
                    var constructorSignature = _this.parseSignature(signatureSymbol, 'Constructor');
                    constructorSignatures.push(constructorSignature);
                });
            });
            var staticMemberSymbols = _.values(genericTypeDecl.members)
                .filter(function (d) { return _this.checkModifiers(d.modifiers, ts.SyntaxKind.StaticKeyword); })
                .map(function (d) { return _this.getSymbolAtLocation(d); })
                .filter(function (s) { return s && !_this.checkFlags(s.flags, ts.SymbolFlags.Prototype); });
            staticProperties = staticMemberSymbols
                .filter(function (s) { return _this.checkFlags(s.flags, ts.SymbolFlags.Property) && s.valueDeclaration !== undefined &&
                !_this.checkModifiers(s.valueDeclaration.modifiers, ts.SyntaxKind.PrivateKeyword); })
                .map(function (s) { return _this.parseProperty(s); });
            staticMethods = staticMemberSymbols
                .filter(function (s) { return _this.checkFlags(s.flags, ts.SymbolFlags.Method) && s.valueDeclaration !== undefined &&
                !_this.checkModifiers(s.valueDeclaration.modifiers, ts.SyntaxKind.PrivateKeyword); })
                .map(function (s) { return _this.parseMethod(s, true, false, baseTypes); });
        }
        this.typeReferenceStack.pop();
        return typhenType.initialize(properties, methods, builtInSymbolMethods, stringIndex, numberIndex, typeReference, constructorSignatures, callSignatures, baseTypes, staticProperties, staticMethods, isAbstract);
    };
    TypeScriptParser.prototype.parseObjectType = function (type) {
        var _this = this;
        var typhenType = this.createTyphenType(type, Symbol.ObjectType, 'Object');
        var mappedTypeNode = this.tryGetMappedTypeNode(type);
        var hasReadonlyToken = mappedTypeNode && mappedTypeNode.readonlyToken !== undefined;
        var hasQuestionToken = mappedTypeNode && mappedTypeNode.readonlyToken !== undefined;
        var rawTemplateType = this.tryGetTemplateType(type);
        var templateType = rawTemplateType ? this.parseType(rawTemplateType) : null;
        var mappedType = mappedTypeNode ? this.mappedTypes.get(mappedTypeNode.id) || null : null;
        var properties = type.getProperties()
            .filter(function (s) { return _this.checkFlags(s.flags, ts.SymbolFlags.Property); })
            .map(function (s) { return _this.parseProperty(s, true, hasQuestionToken, hasReadonlyToken); });
        var rawMethods = type.getProperties()
            .filter(function (s) { return _this.checkFlags(s.flags, ts.SymbolFlags.Method); })
            .map(function (s) { return _this.parseMethod(s, true, hasQuestionToken); });
        var methods = rawMethods.filter(function (m) { return m.name.indexOf('@@') !== 0; });
        var builtInSymbolMethods = rawMethods.filter(function (m) { return m.name.indexOf('@@') === 0; });
        var indexInfos = this.parseIndexInfos(type);
        var stringIndex = indexInfos.stringIndex;
        var numberIndex = indexInfos.numberIndex;
        var parsed = typhenType.initialize(properties, methods, builtInSymbolMethods, stringIndex, numberIndex, templateType, mappedType);
        if (mappedTypeNode && parsed.isMappedType) {
            this.mappedTypes.set(mappedTypeNode.id, parsed);
        }
        return parsed;
    };
    TypeScriptParser.prototype.parseIndexType = function (type) {
        var typhenType = this.createTyphenType(type, Symbol.IndexType);
        var containedType = this.parseType(type.type);
        return typhenType.initialize(containedType);
    };
    TypeScriptParser.prototype.parseIndexedAccessType = function (type) {
        var typhenType = this.createTyphenType(type, Symbol.IndexedAccessType);
        var objectType = this.parseType(type.objectType);
        var indexType = this.parseType(type.indexType);
        var constraint = type.constraint ? this.parseType(type.constraint) : null;
        return typhenType.initialize(objectType, indexType, constraint);
    };
    TypeScriptParser.prototype.parseArray = function (type) {
        var _this = this;
        if (!type.typeArguments) {
            throw this.makeErrorWithTypeInfo('Failed to parse array type', type);
        }
        var typhenType = this.createTyphenType(type, Symbol.Array);
        var typeArguments = type.typeArguments.map(function (t) { return _this.parseType(t); });
        var arrayType = typeArguments[0];
        return typhenType.initialize(arrayType);
    };
    TypeScriptParser.prototype.parseFunction = function (type) {
        var _this = this;
        var typhenType = this.createTyphenType(type, Symbol.Function, 'Function');
        var callSignatures = type.getCallSignatures().map(function (s) { return _this.parseSignature(s); });
        return typhenType.initialize(callSignatures);
    };
    TypeScriptParser.prototype.parsePrimitiveType = function (type) {
        var name;
        if (this.checkFlags(type.flags, ts.TypeFlags.String)) {
            name = 'string';
        }
        else if (this.checkFlags(type.flags, ts.TypeFlags.Boolean)) {
            name = 'boolean';
        }
        else if (this.checkFlags(type.flags, ts.TypeFlags.Number)) {
            name = 'number';
        }
        else if (this.checkFlags(type.flags, ts.TypeFlags.ESSymbol)) {
            name = 'symbol';
        }
        else if (this.checkFlags(type.flags, ts.TypeFlags.Void)) {
            name = 'void';
        }
        else if (this.checkFlags(type.flags, ts.TypeFlags.Null)) {
            name = 'null';
        }
        else if (this.checkFlags(type.flags, ts.TypeFlags.Undefined)) {
            name = 'undefined';
        }
        else if (this.checkFlags(type.flags, ts.TypeFlags.Never)) {
            name = 'never';
        }
        else if (this.checkFlags(type.flags, ts.TypeFlags.Any)) {
            name = 'any';
        }
        else if (type.symbol) {
            name = type.symbol.name;
        }
        else {
            throw new Error('Unknown primitive type: ' + type.flags);
        }
        var typhenType = this.createTyphenType(type, Symbol.PrimitiveType);
        return typhenType.initialize(name);
    };
    TypeScriptParser.prototype.parseUnknownType = function (type) {
        var name = type.symbol ? type.symbol.name : 'unknown';
        // console.log('################   UnknownType : ', name, type.flags, type.symbol.flags);
        var typhenType = this.createTyphenType(type, Symbol.UnknownType);
        return typhenType.initialize(name);
    };
    TypeScriptParser.prototype.parseTypeParameter = function (type) {
        var typhenType = this.createTyphenType(type, Symbol.TypeParameter);
        var constraint = type.constraint ? this.parseType(type.constraint) : null;
        return typhenType.initialize(constraint);
    };
    TypeScriptParser.prototype.parseTuple = function (type) {
        var _this = this;
        var typhenType = this.createTyphenType(type, Symbol.Tuple);
        var elementTypes = type.typeArguments.map(function (t) { return _this.parseType(t); });
        return typhenType.initialize(elementTypes);
    };
    TypeScriptParser.prototype.parseUnionType = function (type) {
        var _this = this;
        var typhenType = this.createTyphenType(type, Symbol.UnionType);
        var types = type.types.map(function (t) { return _this.parseType(t); });
        return typhenType.initialize(types);
    };
    TypeScriptParser.prototype.parseIntersectionType = function (type) {
        var _this = this;
        var typhenType = this.createTyphenType(type, Symbol.IntersectionType);
        var types = type.types.map(function (t) { return _this.parseType(t); });
        return typhenType.initialize(types);
    };
    TypeScriptParser.prototype.parseStringLiteralType = function (type) {
        var typhenType = this.createTyphenType(type, Symbol.StringLiteralType);
        return typhenType.initialize(type.text);
    };
    TypeScriptParser.prototype.parseBooleanLiteralType = function (type) {
        var typhenType = this.createTyphenType(type, Symbol.BooleanLiteralType);
        var intrinsicName = type.intrinsicName;
        return typhenType.initialize(intrinsicName === 'true');
    };
    TypeScriptParser.prototype.parseNumberLiteralType = function (type) {
        var typhenType = this.createTyphenType(type, Symbol.NumberLiteralType);
        return typhenType.initialize(Number(type.text));
    };
    TypeScriptParser.prototype.parseEnumLiteralType = function (type) {
        if (!type.symbol) {
            throw this.makeErrorWithTypeInfo('Failed to parse enum literal type', type);
        }
        var typhenType = this.createTyphenType(type, Symbol.EnumLiteralType);
        var enumType = this.parseType(type.baseType);
        var enumMemberName = type.symbol.name || '';
        var enumMember = enumType.members.filter(function (m) { return m.rawName === enumMemberName; })[0];
        return typhenType.initialize(enumType, enumMember);
    };
    TypeScriptParser.prototype.parseProperty = function (symbol, isOwn, isOptional, isReadonly) {
        if (isOwn === void 0) { isOwn = true; }
        if (isOptional === void 0) { isOptional = false; }
        if (isReadonly === void 0) { isReadonly = false; }
        var type;
        var valueDeclaration;
        if (symbol.valueDeclaration) {
            type = this.typeChecker.getTypeAtLocation(symbol.valueDeclaration);
            valueDeclaration = symbol.valueDeclaration;
        }
        else {
            var symbolLinks = this.getSymbolLinksOfMappedType(symbol);
            type = symbolLinks.type;
            valueDeclaration = symbolLinks.mappedTypeOrigin.valueDeclaration;
        }
        if (!valueDeclaration || !type) {
            throw this.makeErrorWithSymbolInfo('Failed to parse property', symbol);
        }
        var propertyType = this.parseType(type);
        isOptional = isOptional || valueDeclaration.questionToken != null;
        isReadonly = isReadonly || this.checkModifiers(valueDeclaration.modifiers, ts.SyntaxKind.ReadonlyKeyword);
        var isProtected = this.checkModifiers(valueDeclaration.modifiers, ts.SyntaxKind.ProtectedKeyword);
        var isAbstract = this.checkModifiers(valueDeclaration.modifiers, ts.SyntaxKind.AbstractKeyword);
        var typhenSymbol = this.createTyphenSymbol(symbol, Symbol.Property);
        return typhenSymbol.initialize(propertyType, isOptional, isOwn, isProtected, isReadonly, isAbstract);
    };
    TypeScriptParser.prototype.parseMethod = function (symbol, isOwn, isOptional, baseTypes) {
        var _this = this;
        if (isOwn === void 0) { isOwn = true; }
        if (isOptional === void 0) { isOptional = false; }
        if (!symbol.valueDeclaration) {
            throw this.makeErrorWithSymbolInfo('Failed to parse method', symbol);
        }
        var type = this.typeChecker.getTypeAtLocation(symbol.valueDeclaration);
        var callSignatures = type.getCallSignatures().map(function (s) { return _this.parseSignature(s, 'Signature', baseTypes); });
        isOptional = isOptional || symbol.valueDeclaration.questionToken != null;
        var isAbstract = this.checkModifiers(symbol.valueDeclaration.modifiers, ts.SyntaxKind.AbstractKeyword);
        var typhenSymbol = this.createTyphenSymbol(symbol, Symbol.Method);
        return typhenSymbol.initialize(callSignatures, isOptional, isOwn, isAbstract);
    };
    TypeScriptParser.prototype.parseSignature = function (signature, suffixName, baseTypes) {
        var _this = this;
        if (suffixName === void 0) { suffixName = 'Signature'; }
        var typeParameters = signature.typeParameters === undefined ? [] :
            signature.typeParameters.map(function (t) { return _this.parseType(t); });
        var parameters = signature.getParameters().map(function (s) { return _this.parseParameter(s, baseTypes); });
        var returnType = this.parseType(signature.getReturnType());
        var isProtected = this.checkModifiers(signature.declaration.modifiers, ts.SyntaxKind.ProtectedKeyword);
        var typePredicate = null;
        var typePredicateNodes = signature.declaration.getChildren().filter(function (n) { return n.kind === ts.SyntaxKind.TypePredicate; });
        if (typePredicateNodes.length > 0) {
            typePredicate = this.parseTypePredicate(typePredicateNodes[0], parameters);
        }
        var symbol = this.getSymbolAtLocation(signature.declaration);
        var typhenSymbol = this.createTyphenSymbol(symbol, Symbol.Signature, suffixName);
        return typhenSymbol.initialize(typeParameters, parameters, returnType, typePredicate, isProtected);
    };
    TypeScriptParser.prototype.parseTypePredicate = function (node, parameters) {
        var type = this.parseType(this.typeChecker.getTypeAtLocation(node.type));
        var thisType = this.parseType(this.typeChecker.getTypeAtLocation(node.parameterName));
        var parameterNameText = node.parameterName.getText();
        var parameter = parameters.filter(function (p) { return p.name === parameterNameText; })[0] || null;
        return new Symbol.TypePredicate(type, thisType, parameter);
    };
    TypeScriptParser.prototype.getUnboundTypeParameters = function (type) {
        var _this = this;
        var accumulator = [];
        if (type.isTypeParameter) {
            accumulator.push(type);
        }
        if (type.isArray) {
            var arrayType = type;
            if (arrayType.type.isTypeParameter) {
                accumulator.push(arrayType.type);
            }
        }
        var containerType = type;
        if (containerType.typeReference) {
            var unboundTypeParameters = containerType.typeReference.getUnboundTypeParameters();
            accumulator.push.apply(accumulator, unboundTypeParameters);
            containerType.typeReference.typeArguments.forEach(function (t) {
                accumulator.push.apply(accumulator, _this.getUnboundTypeParameters(t));
            });
        }
        return accumulator.filter(function (t) { return !!t; });
    };
    TypeScriptParser.prototype.rebindTypeParameters = function (type, typeName, typeArgument) {
        var _this = this;
        var containerType = type;
        if (type.isArray) {
            var arrayType = type;
            if (arrayType.type.isTypeParameter && arrayType.type.rawName === typeName) {
                arrayType.type = typeArgument;
            }
        }
        if (containerType.typeReference && typeArgument) {
            var unboundTypeParameters = containerType.typeReference.getUnboundTypeParameters();
            if (unboundTypeParameters.length === 1 && unboundTypeParameters[0].rawName === typeName) {
                logger.debug('rebinding type param', type.rawName, typeName, 'to', typeArgument.rawName);
                containerType.typeReference.addTypeArgument(typeArgument);
            }
            containerType.typeReference.typeArguments.forEach(function (t) {
                var unboundTypeParameters = _this.getUnboundTypeParameters(t);
                unboundTypeParameters.forEach(function (ubtp) {
                    _this.rebindTypeParameters(t, typeName, typeArgument);
                });
            });
        }
    };
    TypeScriptParser.prototype.parseParameter = function (symbol, baseTypes) {
        var _this = this;
        if (!symbol.valueDeclaration) {
            throw this.makeErrorWithSymbolInfo('Failed to parse parameter', symbol);
        }
        var type = this.typeChecker.getTypeAtLocation(symbol.valueDeclaration);
        var parameterType = this.parseType(type);
        if (baseTypes && this.shouldRebindTypeParameters(type)) {
            var unboundTypeParameters = this.getUnboundTypeParameters(parameterType);
            var baseTypeParams = baseTypes.map(function (bt) { return bt.typeParameters; }).reduce(function (tp1, tp2) { return tp1.concat(tp2); }, []);
            var baseTypeArgs = baseTypes.map(function (bt) { return bt.typeArguments; }).reduce(function (ta1, ta2) { return ta1.concat(ta2); }, []);
            var bindableTypes_1 = _.zipObject(baseTypeParams.map(function (btp) { return btp.rawName; }), baseTypeArgs);
            unboundTypeParameters.forEach(function (utp) {
                if (parameterType.isTypeParameter && bindableTypes_1[utp.rawName]) {
                    parameterType = bindableTypes_1[utp.rawName];
                }
                else {
                    _this.rebindTypeParameters(parameterType, utp.rawName, bindableTypes_1[utp.rawName]);
                }
            });
            // console.log('types to rebind: ',
            //   unboundTypeParameters.map(utp => utp.rawName),
            //   baseTypeParams.map(btp => btp.rawName), ' to ', baseTypeArgs.map(bta => bta.rawName));
        }
        var valueDecl = symbol.valueDeclaration;
        var isOptional = valueDecl.questionToken != null;
        var isVariadic = valueDecl.dotDotDotToken != null;
        var typhenSymbol = this.createTyphenSymbol(symbol, Symbol.Parameter);
        return typhenSymbol.initialize(parameterType, isOptional, isVariadic);
    };
    TypeScriptParser.prototype.showFunction = function (fnc) {
        // console.log('==============FUNCTION==========');
        var parametertypes = fnc.callSignatures.map(function (cs) { return cs.parameters; })
            .reduce(function (p1, p2) { return p2.concat(p1); })
            .map(function (p) { return p.type.rawName; });
        // console.log(' parameter types ', parametertypes);
    };
    TypeScriptParser.prototype.parseVariable = function (symbol) {
        if (!symbol.valueDeclaration || !symbol.valueDeclaration.parent) {
            throw this.makeErrorWithSymbolInfo('Failed to parse variable', symbol);
        }
        var type = this.typeChecker.getTypeAtLocation(symbol.valueDeclaration);
        var variableType = null;
        var variableModule = null;
        var isLet = symbol.valueDeclaration.parent.getChildren().filter(function (n) { return n.kind === ts.SyntaxKind.LetKeyword; }).length > 0;
        var isConst = symbol.valueDeclaration.parent.getChildren().filter(function (n) { return n.kind === ts.SyntaxKind.ConstKeyword; }).length > 0;
        if (type.symbol && this.checkFlags(type.symbol.flags, ts.SymbolFlags.Module)) {
            variableModule = this.parseModule(type.symbol);
        }
        else {
            variableType = this.parseType(type);
        }
        var typhenSymbol = this.createTyphenSymbol(symbol, Symbol.Variable);
        return typhenSymbol.initialize(variableType, variableModule, isLet, isConst);
    };
    TypeScriptParser.prototype.parseTypeAlias = function (symbol) {
        var type = this.typeChecker.getDeclaredTypeOfSymbol(symbol);
        var aliasedType = this.parseType(type);
        var typhenSymbol = this.createTyphenSymbol(symbol, Symbol.TypeAlias);
        return typhenSymbol.initialize(aliasedType);
    };
    Object.defineProperty(TypeScriptParser.prototype, "anySourceFileMatches", {
        get: function () {
            if (!this.mAnySourceFileMatches) {
                this.mAnySourceFileMatches = _.memoize(anySourceFileMatches(this.config.sourcesToRebind));
            }
            return this.mAnySourceFileMatches;
        },
        enumerable: true,
        configurable: true
    });
    TypeScriptParser.prototype.shouldRebindTypeParameters = function (type) {
        var typhenType = this.typeCache.get(type);
        var sourceFiles = typhenType.declarationInfos.map(function (di) { return di.fileName; });
        if (sourceFiles.length > 0 && !sourceFiles.some(this.anySourceFileMatches)) {
            return false;
        }
        var result = false;
        if (typhenType.isTypeParameter) {
            return true;
        }
        if (typhenType.kind === Symbol.SymbolKind.Interface) {
            var fnc = typhenType;
            var paramKinds = fnc.callSignatures
                .map(function (cs) { return cs.parameters; })
                .reduce(function (p1, p2) { return p1.concat(p2); }, [])
                .map(function (p) { return p.type; }).map(function (t) { return t.kind; });
            result = paramKinds.indexOf(Symbol.SymbolKind.TypeParameter) !== -1;
        }
        // if (result) {
        //   console.log('=======containsTypeParameters=========', typhenType.rawName, typhenType.kind);
        //   console.log('type %s containsTypeParameters: ', typhenType.rawName, result);
        // }
        return result;
    };
    return TypeScriptParser;
}());
exports.default = TypeScriptParser;
