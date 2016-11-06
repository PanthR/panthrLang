(function(define) {
'use strict';
define(function(require) {
   var Base;

   Base = require('panthrbase/index');

// It needs to always return a function with the following signature:
   return function(evalLang, addBuiltin, Value) {
      addBuiltin('rnorm', function(lst) {
         return Value.wrap(Base.stats.rnorm(lst.get('n'), {
            mu: lst.get('mean'), sigma: lst.get('sd')
         }));
      }, function(resolver) {
         resolver.addParameter('n', ['number', 'variable'], true)
            .addParameter('mean', ['scalar'], false)
            .addParameter('sd', ['scalar'], false)
            .addDefault('mean', function() { return Base.Variable.scalar([0]); })
            .addDefault('sd', function() { return Base.Variable.scalar([1]); });
      });
   };
});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
