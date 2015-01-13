'use strict';

module.exports = function(typhen, options) {
  return typhen.createPlugin({
    pluginDirectory: __dirname,
    handlebarsOptions: {
      data: options,
      helpers: {
        'link': function(text, url) {
          return '[' + text + '](' + url + ')';
        }
      }
    },

    rename: function(symbol, name) {
      if (symbol.kind === typhen.SymbolKinds.Array) {
        return 'ArrayOf' + symbol.type.name;
      }
      return name;
    },

    generate: function(generator, types, modules) {
      generator.generateUnlessExist('templates/README.md', 'README.md');
      generator.generate('templates/plugin_test.hbs', 'plugin_test.md');

      types.forEach(function(type) {
        switch (type.kind) {
          case typhen.SymbolKinds.Enum:
            generator.generate('templates/enum.hbs', 'underscore:**/*.md', type);
            break;
          case typhen.SymbolKinds.Tuple:
            generator.generate('templates/tuple.hbs', 'underscore:**/*.md', type);
            break;
          case typhen.SymbolKinds.Interface:
          case typhen.SymbolKinds.Class:
            generator.generate('templates/interface.hbs', 'underscore:**/*.md', type);
            break;
          case typhen.SymbolKinds.ObjectType:
            generator.generate('templates/object_type.hbs', 'underscore:**/*.md', type);
            break;
          case typhen.SymbolKinds.Function:
            generator.generate('templates/function.hbs', 'underscore:**/*.md', type);
            break;
        }
      });

      modules.forEach(function(mod) {
        generator.generate('templates/module.hbs', 'underscore:**/*.md', mod);
      });
    }
  });
};
