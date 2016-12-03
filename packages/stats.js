(function(define) {
'use strict';
define(function(require) {
   var Base;

   Base = require('panthrbase/index');

   return function(evalLang, addBuiltin, Value) {

      addDistrFunctions('norm', { mu: ['mean', 0], sigma: ['sd', 1] });
      addDistrFunctions('unif', { min: ['min', 0], max: ['max', 1] });
      addDistrFunctions('beta', { a: ['shape1'], b: ['shape2'] });
      addDistrFunctions('gamma', { a: ['shape'], s: ['scale'] }, function(resolver) {
         resolver.addParameter('shape', ['scalar'], true)
            .addParameter('scale', ['scalar'], true)
            .addParameter('rate', ['scalar'], false)
            .addDefault('rate', function() { return Base.Variable.scalar([1]); })
            .addDependent('scale', 'rate', function(rateVar) {
               return rateVar.map(function(rate) { return 1 / rate; }, true);
            });
      });
      addDistrFunctions('t', { df: ['df'] });
      addDistrFunctions('chisq', { df: ['df'] });
      addDistrFunctions('binom', { size: ['size'], p: ['prob'] });
      addDistrFunctions('pois', { lambda: ['lambda'] });
      addDistrFunctions('geom', { prob: ['prob'] });
      addDistrFunctions('exp', { rate: ['rate', 1] });

      // Builds r/d/p/q functions based on the distr name
      // and parameter defaults
      // If `customDefaults` is provided, it is used by the resolver in place
      // of the usual parameter requirements for the function call.
      function addDistrFunctions(distr, defaults, customDefaults) {
         var addDistrDefaults;

         addDistrDefaults = customDefaults == null ? addDefaults(defaults)
                                                   : customDefaults;

         addBuiltin('r' + distr, function(lst) {
            return Value.wrap(Base.stats['r' + distr](
               lst.get('n'), getParams(lst, defaults)
            ));
         }, function(resolver) {
            resolver.addParameter('n', ['number', 'variable'], true);
            addDistrDefaults(resolver);
         });

         addBuiltin('d' + distr, function(lst) {
            return Value.wrap(Base.stats['d' + distr](
               lst.get('x'), getParams(lst, defaults, { log: lst.get('log') })
            ));
         }, function(resolver) {
            resolver.addParameter('x', ['scalar'], true);
            addDistrDefaults(resolver);
            addLog(resolver);
         });

         addBuiltin('p' + distr, function(lst) {
            return Value.wrap(Base.stats['p' + distr](
               lst.get('x'), getParams(lst, defaults, {
                  log: lst.get('log'), lowerTail: lst.get('lower.tail')
               })
            ));
         }, function(resolver) {
            resolver.addParameter('x', ['scalar'], true);
            addDistrDefaults(resolver);
            addLog(resolver);
            addLogLowerTail(resolver);
         });

         addBuiltin('q' + distr, function(lst) {
            return Value.wrap(Base.stats['q' + distr](
               lst.get('p'), getParams(lst, defaults, {
                  log: lst.get('log'), lowerTail: lst.get('lower.tail')
               })
            ));
         }, function(resolver) {
            resolver.addParameter('p', ['scalar'], true);
            addDistrDefaults(resolver);
            addLog(resolver);
            addLogLowerTail(resolver);
         });
      }
   };

   // This function accounts for the parameter name differences
   // Between panthrBase and R/panthrLang
   // Reads the parameter names from defaults
   // And combines with their values from the lst
   // Then it mixes in the key-values from extras
   function getParams(lst, defaults, extras) {
      var params;

      params = {};

      Object.keys(defaults).forEach(function(key) {
         params[key] = lst.get(defaults[key][0]); // Get the name
      });

      // Now mix in the extras object
      if (extras != null) {
         Object.keys(extras).forEach(function(key) {
            params[key] = extras[key];
         });
      }

      return params;
   }

   function addDefaults(defaults) {
      return function(resolver) {
         Object.keys(defaults).forEach(function(key) {
            var keyName, keyDefault, hasDefault;

            keyName = defaults[key][0];
            keyDefault = defaults[key][1];
            hasDefault = keyDefault != null;
            resolver.addParameter(keyName, ['scalar'], !hasDefault);
            if (hasDefault) {
               resolver.addDefault(keyName, function() {
                  return Base.Variable.scalar(keyDefault);
               });
            }
         });
      };
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
