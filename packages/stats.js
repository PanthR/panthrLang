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
         resolver.addParameter('n', ['number', 'variable'], true);
         addNormalDefaults(resolver);
      });
      addBuiltin('dnorm', function(lst) {
         return Value.wrap(Base.stats.dnorm(lst.get('x'), {
            mu: lst.get('mean'), sigma: lst.get('sd'), log: lst.get('log')
         }));
      }, function(resolver) {
         resolver.addParameter('x', ['scalar'], true);
         addNormalDefaults(resolver);
         addLog(resolver);
      });
      addBuiltin('pnorm', function(lst) {
         return Value.wrap(Base.stats.pnorm(lst.get('x'), {
            mu: lst.get('mean'), sigma: lst.get('sd'),
            log: lst.get('log'), lowerTail: lst.get('lower.tail')
         }));
      }, function(resolver) {
         resolver.addParameter('x', ['scalar'], true);
         addNormalDefaults(resolver);
         addLog(resolver);
         addLogLowerTail(resolver);
      });
      addBuiltin('qnorm', function(lst) {
         return Value.wrap(Base.stats.qnorm(lst.get('p'), {
            mu: lst.get('mean'), sigma: lst.get('sd'),
            log: lst.get('log'), lowerTail: lst.get('lower.tail')
         }));
      }, function(resolver) {
         resolver.addParameter('p', ['scalar'], true);
         addNormalDefaults(resolver);
         addLog(resolver);
         addLogLowerTail(resolver);
      });
   };

   function addNormalDefaults(resolver) {
      resolver.addParameter('mean', ['scalar'], false)
         .addParameter('sd', ['scalar'], false)
         .addDefault('mean', function() { return Base.Variable.scalar([0]); })
         .addDefault('sd', function() { return Base.Variable.scalar([1]); });
   }
   function addLog(resolver) {
      resolver.addParameter('log', ['boolean'], false)
         .addParameter('log.p', ['boolean'], false)
         .addDependent('log', 'log.p', function(log) { return log; })
         .addDefault('log', function() { return false; });
   }
   function addLogLowerTail(resolver) {
      resolver.addParameter('lower.tail', ['boolean'], false)
         .addDefault('lower.tail', function() { return true; });
   }
});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
