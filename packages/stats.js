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
      addBuiltin('dnorm', function(lst) {
         return Value.wrap(Base.stats.dnorm(lst.get('x'), {
            mu: lst.get('mean'), sigma: lst.get('sd'), log: lst.get('log')
         }));
      }, function(resolver) {
         resolver.addParameter('x', ['scalar'], true)
            .addParameter('mean', ['scalar'], false)
            .addParameter('sd', ['scalar'], false)
            .addParameter('log', ['boolean'], false)
            .addDefault('mean', function() { return Base.Variable.scalar([0]); })
            .addDefault('sd', function() { return Base.Variable.scalar([1]); })
            .addDefault('log', function() { return false; });
      });
      addBuiltin('pnorm', function(lst) {
         return Value.wrap(Base.stats.pnorm(lst.get('x'), {
            mu: lst.get('mean'), sigma: lst.get('sd'),
            log: lst.get('log'), lowerTail: lst.get('lower.tail')
         }));
      }, function(resolver) {
         resolver.addParameter('x', ['scalar'], true)
            .addParameter('mean', ['scalar'], false)
            .addParameter('sd', ['scalar'], false)
            .addParameter('log', ['boolean'], false)
            .addParameter('log.p', ['boolean'], false)
            .addParameter('lower.tail', ['boolean'], false)
            .addDefault('mean', function() { return Base.Variable.scalar([0]); })
            .addDefault('sd', function() { return Base.Variable.scalar([1]); })
            .addDependent('log', 'log.p', function(log) { return log; })
            .addDefault('log', function() { return false; })
            .addDefault('lower.tail', function() { return true; });
      });
   };
});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
