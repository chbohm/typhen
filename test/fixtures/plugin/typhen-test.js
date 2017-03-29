'use strict';

module.exports = function(typhen, options) {
  return typhen.createPlugin({
    pluginDirectory: __dirname,
    customPrimitiveTypes: ['integer'],
    disallow: {                        // Optional. Default value is {}.
      any: false,
      tuple: false,
      unionType: false,
      intersectionType: false,
      overload: false,
      generics: false,
      anonymousObject: false,
      anonymousFunction: false
    },

    handlebarsOptions: {
      data: options,
      helpers: {
        'link': function(text, url) {
          return '[' + text + '](' + url + ')';
        }
      }
    },

    rename: function(symbol, name) {
      if (symbol.kind === typhen.SymbolKind.Array) {
        if (symbol.type === null || symbol.type === undefined) {
           return  symbol.namespace + '.' + symbol.rawName + '[]'
        }
        return symbol.type.fullName + '[]';
      }
      let newName = name;
      if (symbol.typeArguments && symbol.typeArguments.length>0) {
        newName = symbol.rawName + symbol.typeArguments.map((type, index) => {
          let prefix = index === 0 ? '<' : ', ';
          if (type.fullName.indexOf('service.activities.IActivitiesTemplate')!=-1) {
            console.log(type.fullName, type.typeArguments && type.typeArguments.length);
          }
          return prefix + type.fullName;
        }).join('') + '>';
      }
      return newName;    },

    generate: function(generator, types, modules) {
      generator.generateUnlessExist('templates/README.md', 'README.md');
      generator.generate('templates/plugin_test.hbs', 'plugin_test.md');
      generator.generateFiles('templates/files', '**/*.md', 'files');

      types.forEach(function(type) {
        switch (type.kind) {
          case typhen.SymbolKind.Enum:
            generator.generate('templates/enum.hbs', 'underscore:**/*.md', type);
            break;
          case typhen.SymbolKind.Tuple:
            generator.generate('templates/tuple.hbs', 'underscore:**/*.md', type);
            break;
          case typhen.SymbolKind.UnionType:
          case typhen.SymbolKind.IntersectionType:
            generator.generate('templates/union_or_intersection_type.hbs', 'underscore:**/*.md', type);
            break;
          case typhen.SymbolKind.Interface:
          case typhen.SymbolKind.Class:
            generator.generate('templates/interface.hbs', 'underscore:**/*.md', type);
            break;
          case typhen.SymbolKind.ObjectType:
            generator.generate('templates/object_type.hbs', 'underscore:**/*.md', type);
            break;
          case typhen.SymbolKind.Function:
            generator.generate('templates/function.hbs', 'underscore:**/*.md', type);
            break;
          case typhen.SymbolKind.StringLiteralType:
          case typhen.SymbolKind.BooleanLiteralType:
          case typhen.SymbolKind.NumberLiteralType:
          case typhen.SymbolKind.EnumLiteralType:
            generator.generate('templates/literal_type.hbs', 'underscore:**/*.md', type);
            break;
        }
      });

      modules.forEach(function(mod) {
        generator.generate('templates/module.hbs', 'underscore:**/*.md', mod);
      });
    }
  });
};
