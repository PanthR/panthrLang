(function(define) {
'use strict';
define(function(require) {
   var Base;

   Base = require('panthrbase/index');

   return function(evalLang, addBuiltin, Value) {

      addDistrFunctions('norm', { mu: ['mean', 0], sigma: ['sd', 1] });
      addDistrFunctions('unif', { min: ['min', 0], max: ['max', 1] });
      addDistrFunctions('beta', { a: ['shape1'], b: ['shape2'] });
      addDistrFunctions('gamma', { a: ['shape'], s: ['scale'] });
      addDistrFunctions('t', { df: ['df'] });
      addDistrFunctions('chisq', { df: ['df'] });
      addDistrFunctions('binom', { size: ['size'], p: ['prob'] });
      addDistrFunctions('pois', { lambda: ['lambda'] });
      addDistrFunctions('geom', { prob: ['prob'] });
      addDistrFunctions('exp', { rate: ['rate', 1] });

      evalLang('rnorm <- function(n, mean = 0, sd = 1) { \
         .Call(rnorm, n, mean, sd) \
      }');
      evalLang('dnorm <- function(x, mean = 0, sd = 1, log = FALSE) { \
         .Call(dnorm, x, mean, sd, log) \
      }');
      evalLang('pnorm <- function(q, mean = 0, sd = 1, lower.tail = TRUE, log.p = FALSE) { \
         .Call(pnorm, q, mean, sd, lower.tail, log.p) \
      }');
      evalLang('qnorm <- function(p, mean = 0, sd = 1, lower.tail = TRUE, log.p = FALSE) { \
         .Call(qnorm, p, mean, sd, lower.tail, log.p) \
      }');
      evalLang('runif <- function(n, min = 0, max = 1) { \
         .Call(runif, n, min, max) \
      }');
      evalLang('dunif <- function(x, min = 0, max = 1, log = FALSE) { \
         .Call(dunif, x, min, max, log) \
      }');
      evalLang('punif <- function(q, min = 0, max = 1, lower.tail = TRUE, log.p = FALSE) { \
         .Call(punif, q, min, max, lower.tail, log.p) \
      }');
      evalLang('qunif <- function(p, min = 0, max = 1, lower.tail = TRUE, log.p = FALSE) { \
         .Call(qunif, p, min, max, lower.tail, log.p) \
      }');
      evalLang('rbeta <- function(n, shape1, shape2, ncp = 0) { \
         if (ncp == 0) .Call(rbeta, n, shape1, shape2) \
         else stop("Not implemented the case of ncp != 0") \
      }');
      evalLang('dbeta <- function(x, shape1, shape2, ncp = 0, log = FALSE) { \
         if (ncp == 0) .Call(dbeta, x, shape1, shape2, log) \
         else stop("Not implemented the case of ncp != 0") \
      }');
      evalLang('pbeta <- function(q, shape1, shape2, ncp = 0, lower.tail = TRUE, log.p = FALSE) { \
         if (ncp == 0) .Call(pbeta, q, shape1, shape2, lower.tail, log.p) \
         else stop("Not implemented the case of ncp != 0") \
      }');
      evalLang('qbeta <- function(p, shape1, shape2, ncp = 0, lower.tail = TRUE, log.p = FALSE) { \
         if (ncp == 0) .Call(qbeta, p, shape1, shape2, lower.tail, log.p) \
         else stop("Not implemented the case of ncp != 0") \
      }');
      evalLang('rgamma <- function(n, shape, rate = 1, scale = 1 / rate) { \
         if (!missing(rate) && !missing(scale)) {\
            if (abs(rate * scale - 1) >= 1e-15) \
               stop("specify \\"rate\\" or \\"scale\\" but not both")\
         }\n\
         .Call(rgamma, n, shape, scale) \
      }');
      evalLang('dgamma <- function(x, shape, rate = 1, scale = 1 / rate, log = FALSE) { \
         if (!missing(rate) && !missing(scale)) {\
            if (abs(rate * scale - 1) >= 1e-15) \
               stop("specify \"rate\" or \"scale\" but not both")\
         }\n\
         .Call(dgamma, x, shape, scale, log) \
      }');
      evalLang('pgamma <- function(q, shape, rate = 1, scale = 1 / rate, \
                                    lower.tail = TRUE, log.p = FALSE) { \
         if (!missing(rate) && !missing(scale)) {\
            if (abs(rate * scale - 1) >= 1e-15) \
               stop("specify \"rate\" or \"scale\" but not both")\
         }\n\
         .Call(pgamma, q, shape, scale, lower.tail, log.p) \
      }');
      evalLang('qgamma <- function(p, shape, rate = 1, scale = 1 / rate, \
                                    lower.tail = TRUE, log.p = FALSE) { \
         if (!missing(rate) && !missing(scale)) {\
            if (abs(rate * scale - 1) >= 1e-15) \
               stop("specify \"rate\" or \"scale\" but not both")\
         }\n\
         .Call(qgamma, p, shape, scale, lower.tail, log.p) \
      }');
      evalLang('rt <- function(n, df, ncp) { \
         if (missing(ncp)) .Call(rt, n, df) \
         else stop("Not implemented the case of ncp not missing") \
      }');
      evalLang('dt <- function(x, df, ncp, log = FALSE) { \
         if (missing(ncp)) .Call(dt, x, df, log) \
         else stop("Not implemented the case of ncp not missing") \
      }');
      evalLang('pt <- function(q, df, ncp, lower.tail = TRUE, log.p = FALSE) { \
         if (missing(ncp)) .Call(pt, q, df, lower.tail, log.p) \
         else stop("Not implemented the case of ncp not missing") \
      }');
      evalLang('qt <- function(p, df, ncp, lower.tail = TRUE, log.p = FALSE) { \
         if (missing(ncp)) .Call(qt, p, df, lower.tail, log.p) \
         else stop("Not implemented the case of ncp not missing") \
      }');
      evalLang('rchisq <- function(n, df, ncp = 0) { \
         if (ncp == 0) .Call(rchisq, n, df) \
         else stop("Not implemented the case of ncp not missing") \
      }');
      evalLang('dchisq <- function(x, df, ncp = 0, log = FALSE) { \
         if (ncp == 0) .Call(dchisq, x, df, log) \
         else stop("Not implemented the case of ncp not missing") \
      }');
      evalLang('pchisq <- function(q, df, ncp = 0, lower.tail = TRUE, log.p = FALSE) { \
         if (ncp == 0) .Call(pchisq, q, df, lower.tail, log.p) \
         else stop("Not implemented the case of ncp not missing") \
      }');
      evalLang('qchisq <- function(p, df, ncp = 0, lower.tail = TRUE, log.p = FALSE) { \
         if (ncp == 0) .Call(qchisq, p, df, lower.tail, log.p) \
         else stop("Not implemented the case of ncp not missing") \
      }');
      evalLang('rbinom <- function(n, size, prob) { \
         .Call(rbinom, n, size, prob) \
      }');
      evalLang('dbinom <- function(x, size, prob, log = FALSE) { \
         .Call(dbinom, x, size, prob, log) \
      }');
      evalLang('pbinom <- function(q, size, prob, lower.tail = TRUE, log.p = FALSE) { \
         .Call(pbinom, q, size, prob, lower.tail, log.p) \
      }');
      evalLang('qbinom <- function(p, size, prob, lower.tail = TRUE, log.p = FALSE) { \
         .Call(qbinom, p, size, prob, lower.tail, log.p) \
      }');
      evalLang('rpois <- function(n, lambda) { \
         .Call(rpois, n, lambda) \
      }');
      evalLang('dpois <- function(x, lambda, log = FALSE) { \
         .Call(dpois, x, lambda, log) \
      }');
      evalLang('ppois <- function(q, lambda, lower.tail = TRUE, log.p = FALSE) { \
         .Call(ppois, q, lambda, lower.tail, log.p) \
      }');
      evalLang('qpois <- function(p, lambda, lower.tail = TRUE, log.p = FALSE) { \
         .Call(qpois, p, lambda, lower.tail, log.p) \
      }');
      evalLang('rgeom <- function(n, prob) { \
         .Call(rgeom, n, prob) \
      }');
      evalLang('dgeom <- function(x, prob, log = FALSE) { \
         .Call(dgeom, x, prob, log) \
      }');
      evalLang('pgeom <- function(q, prob, lower.tail = TRUE, log.p = FALSE) { \
         .Call(pgeom, q, prob, lower.tail, log.p) \
      }');
      evalLang('qgeom <- function(p, prob, lower.tail = TRUE, log.p = FALSE) { \
         .Call(qgeom, p, prob, lower.tail, log.p) \
      }');
      evalLang('rexp <- function(n, rate = 1) { \
         .Call(rexp, n, rate) \
      }');
      evalLang('dexp <- function(x, rate = 1, log = FALSE) { \
         .Call(dexp, x, rate, log) \
      }');
      evalLang('pexp <- function(q, rate = 1, lower.tail = TRUE, log.p = FALSE) { \
         .Call(pexp, q, rate, lower.tail, log.p) \
      }');
      evalLang('qexp <- function(p, rate = 1, lower.tail = TRUE, log.p = FALSE) { \
         .Call(qexp, p, rate, lower.tail, log.p) \
      }');
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
                  log: lst.get('log.p'), lowerTail: lst.get('lower.tail')
               })
            ));
         }, function(resolver) {
            resolver.addParameter('x', ['scalar'], true);
            addDistrDefaults(resolver);
            addLogLowerTail(resolver);
         });

         addBuiltin('q' + distr, function(lst) {
            return Value.wrap(Base.stats['q' + distr](
               lst.get('p'), getParams(lst, defaults, {
                  log: lst.get('log.p'), lowerTail: lst.get('lower.tail')
               })
            ));
         }, function(resolver) {
            resolver.addParameter('p', ['scalar'], true);
            addDistrDefaults(resolver);
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
         .addParameter('log.p', ['boolean'], false)
         .addDefault('log.p', function() { return false; })
         .addDefault('lower.tail', function() { return true; });
   }
});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
