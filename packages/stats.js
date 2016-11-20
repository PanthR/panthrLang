(function(define) {
'use strict';
define(function(require) {
   var Base;

   Base = require('panthrbase/index');

// It needs to always return a function with the following signature:
   return function(evalLang, addBuiltin, Value) {

      addDistrFunctions('norm', { mu: ['mean', 0], sigma: ['sd', 1] });

      // Builds r/d/p/q functions based on the distr name
      // and parameter defaults
      function addDistrFunctions(distr, defaults) {
         var addDistrDefaults;

         addDistrDefaults = addDefaults(defaults);

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
            var keyName, keyDefault;

            keyName = defaults[key][0];
            keyDefault = defaults[key][1];
            resolver.addParameter(keyName, ['scalar'], false);
            resolver.addDefault(keyName, function() {
               return Base.Variable.scalar(keyDefault);
            });
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
