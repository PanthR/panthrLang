(function(define) {
'use strict';
define(function(require) {
// Example of how a package is structured.
   var Base, Environment, Expression;

   Base = require('panthrbase/index');
   Environment = require('../panthrLang/environment');
   Expression = require('../panthrLang/expression');

// It needs to always return a function with the following signature:
   /* eslint-disable max-statements */
   return function(evalLang, addBuiltin, Value, addBinding) {
      // It can call on each of these to create new bindings.
      // For instance we could do:
      // evalLang('foo <- 3.1456'); where the string '3.1456' will be evaluated
      // as a panthrLang expression in the package's "global frame".

      // It can also use addBuiltin to add built-in functions to the language.
      // These functions can use the "Value" constructor and its helper methods
      // to return an appropriate value of type "Value".
      // All built-in functions should expect a Base.List
      //
      addBinding('pi', Value.wrap(Math.PI));
      addBinding('LETTERS', Value.makeString([
         'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
         'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
         'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
      ]));
      addBinding('letters', Value.makeString([
         'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
         'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
         'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
      ]));
      addBinding('month.abb', Value.makeString([
         'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ]));
      addBinding('month.name', Value.makeString([
         'January', 'February', 'March', 'April', 'May', 'June',
         'July', 'August', 'September', 'October', 'November', 'December'
      ]));
      addBuiltin('+', function(lst) {
         if (lst.length() === 1) {
            return Value.wrap(lst.get(1));
         }
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return x + y;
            }, 'scalar')
         );
      }, configUnaryBinaryOp);
      addBuiltin('-', function(lst) {
         if (lst.length() === 1) {
            return Value.wrap(lst.get(1).map(function(v) { return -v; }));
         }
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return x - y;
            }, 'scalar')
         );
      }, configUnaryBinaryOp);
      addBuiltin('*', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return x * y;
            }, 'scalar')
         );
      }, configArithOp);
      addBuiltin('/', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return x / y;
            }, 'scalar')
         );
      }, configArithOp);
      addBuiltin('^', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return Math.pow(x, y);
            }, 'scalar')
         );
      }, configArithOp);
      addBuiltin('%/%', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return doDiv(x, y);
            }, 'scalar')
         );
      }, configArithOp);
      addBuiltin('%%', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return doMod(x, y);
            }, 'scalar')
         );
      }, configArithOp);
      addBuiltin('>', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return x > y;
            }, 'logical')
         );
      }, configCompOp);
      addBuiltin('<', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return x < y;
            }, 'logical')
         );
      }, configCompOp);
      addBuiltin('>=', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return x >= y;
            }, 'logical')
         );
      }, configCompOp);
      addBuiltin('<=', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return x <= y;
            }, 'logical')
         );
      }, configCompOp);
      addBuiltin('==', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return x === y;
            }, 'logical')
         );
      }, configCompOp);
      addBuiltin('!=', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return x !== y;
            }, 'logical')
         );
      }, configCompOp);
      addBuiltin('!', function(lst) {
         return Value.makeVariable(
            lst.get(1).map(function(x) { return !x; }, 'logical')
         );
      }, function(resolver) {
         resolver.addParameter('x', 'logical', true);
      });

      addBuiltin('|', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return x || y;
            }, 'logical')
         );
      }, configLogicOp);

      addBuiltin('&', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return x && y;
            }, 'logical')
         );
      }, configLogicOp);

      addBuiltin('xor', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return Base.utils.isMissing(x) || Base.utils.isMissing(y) ?
                  Base.utils.missing
                  : x !== y;
            }, 'logical')
         );
      }, configLogicOp);

      addBuiltin('||', function(lst) {
         return Value.makeVariable(
            new Base.Variable([lst.get(1) || lst.get(2)],
               { mode: 'logical' }
            )
         );
      }, function(resolver) {
         resolver.addParameter('x', 'boolean', true)
            .addParameter('y', 'boolean', true);
      });

      addBuiltin('&&', function(lst) {
         return Value.makeVariable(
            new Base.Variable([lst.get(1) && lst.get(2)],
               { mode: 'logical' }
            )
         );
      }, function(resolver) {
         resolver.addParameter('x', 'boolean', true)
            .addParameter('y', 'boolean', true);
      });

      addBuiltin('list', function(lst) {
         return Value.makeList(lst.get('...').clone());
      }, function(resolver) { resolver.addDots(); });

      addBuiltin('names', function(lst) {
         return Value.makeVariable(lst.get('x').names());
      }, function(resolver) {
         resolver.addParameter('x', ['variable', 'list'], true);
      });

      addBuiltin('names<-', function(lst) {
         lst.get('x').names(lst.get('value')); // names as setter
         return Value.wrap(lst.get('x'));
      }, function(resolver) {
         resolver.addParameter('x', ['variable', 'list'], true)
            .addParameter('value', 'variable', true);
      });

      addBuiltin('c', function(lst) {
         var res;

         res = lst.get('...').concat(lst.get('recursive'));
         if (res instanceof Base.Variable) {
            return Value.makeVariable(res);
         }
         return Value.makeList(res);
      }, function(resolver) {
         resolver.addDots()
            .addParameter('recursive', 'boolean', false)
            .addDefault('recursive', 'FALSE');
      });

      addBuiltin('[', function(lst) {
         var x, dots;

         x = lst.get('x');
         dots = lst.get('...');
         // x is either a list, a variable, or null
         if (x == null) { return Value.null; }
         return Value.wrap(x.index.apply(x, dots.get()));
      }, function(resolver) {
         resolver.addParameter('x', ['list', 'variable', 'null'], true)
            .addDots()
            .addParameter('drop', 'boolean', false)
            .addDefault('drop', 'TRUE')
            .addNormalize(function(lst) {
               var theDots;

               theDots = lst.get('...');
               // lst is the processed actuals
               /* eslint-disable max-nested-callbacks */
               theDots.each(function(v, i) {
                  if (typeof v === 'undefined') { return; }
                  if (v === Value.null) {
                     theDots.set(i, null);
                     return;
                  }
                  if (v instanceof Base.Variable) { return; }
                  throw new Error('inappropriate index ' + v);
               });
               /* eslint-enable max-nested-callbacks */
            });
      });

      addBuiltin('[<-', function(lst) {
         var x, dots;

         x = lst.get('x');
         dots = lst.get('...').get();
         dots.unshift(lst.get('value'));
         x.indexSet.apply(x, dots);

         return Value.wrap(x);
      }, function(resolver) {
         resolver.addParameter('x', ['list', 'variable'], true)
            .addParameter('value', ['variable', 'list'], true)
            .addDots()
            .addNormalize(function(lst) {
               var theDots;

               theDots = lst.get('...');
               // lst is the processed actuals
               /* eslint-disable max-nested-callbacks */
               theDots.each(function(v, i) {
                  if (typeof v === 'undefined') { return; }
                  if (v === Value.null) {
                     theDots.set(i, null);
                     return;
                  }
                  if (v instanceof Base.Variable) { return; }
                  throw new Error('inappropriate index ' + v);
               });
               /* eslint-enable max-nested-callbacks */
            });
      });

      /* Math functions */
      addBuiltin('sin', function(lst) {
         return Value.makeVariable(
            lst.get(1).map(function(x) {
               return Math.sin(x);
            }, 'scalar')
         );
      }, configSingleScalar);
      addBuiltin('cos', function(lst) {
         return Value.makeVariable(
            lst.get(1).map(function(x) {
               return Math.cos(x);
            }, 'scalar')
         );
      }, configSingleScalar);
      addBuiltin('tan', function(lst) {
         return Value.makeVariable(
            lst.get(1).map(function(x) {
               return Math.tan(x);
            }, 'scalar')
         );
      }, configSingleScalar);
      addBuiltin('asin', function(lst) {
         return Value.makeVariable(
            lst.get(1).map(function(x) {
               return Math.asin(x);
            }, 'scalar')
         );
      }, configSingleScalar);
      addBuiltin('acos', function(lst) {
         return Value.makeVariable(
            lst.get(1).map(function(x) {
               return Math.acos(x);
            }, 'scalar')
         );
      }, configSingleScalar);
      addBuiltin('atan', function(lst) {
         return Value.makeVariable(
            lst.get(1).map(function(x) {
               return Math.atan(x);
            }, 'scalar')
         );
      }, configSingleScalar);
      addBuiltin('atan2', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get('y'), lst.get('x'), function(y, x) {
               return Math.atan2(y, x);
            }, 'scalar')
         );
      }, function(resolver) {
         resolver.addParameter('y', 'scalar', true);
         resolver.addParameter('x', 'scalar', true);
      });
      addBuiltin('exp', function(lst) {
         return Value.makeVariable(
            lst.get(1).map(function(x) {
               return Math.exp(x);
            }, 'scalar')
         );
      }, configSingleScalar);
      addBuiltin('expm1', function(lst) {
         return Value.makeVariable(
            lst.get(1).map(Base.math.expm1, 'scalar')
         );
      }, configSingleScalar);
      addBuiltin('log', function(lst) {
         var logBase;

         logBase = Math.log(lst.get('base'));

         return Value.makeVariable(
            lst.get('x').map(function(x) {
               return Math.log(x) / logBase;
            }, 'scalar')
         );
      }, function(resolver) {
         resolver.addParameter('x', 'scalar', true)
            .addParameter('base', 'number', false)
            .addDefault('base', 'exp(1)');
      });
      addBuiltin('log10', function(lst) {
         return Value.makeVariable(
            lst.get('x').map(Base.math.log10, 'scalar')
         );
      }, configSingleScalar);
      addBuiltin('log2', function(lst) {
         return Value.makeVariable(
            lst.get('x').map(Base.math.log2, 'scalar')
         );
      }, configSingleScalar);
      addBuiltin('log1p', function(lst) {
         return Value.makeVariable(
            lst.get('x').map(Base.math.log1p, 'scalar')
         );
      }, configSingleScalar);
      addBuiltin('abs', function(lst) {
         return Value.makeVariable(
            lst.get('x').map(Math.abs, 'scalar')
         );
      }, configSingleScalar);
      addBuiltin('sqrt', function(lst) {
         return Value.makeVariable(
            lst.get('x').map(Math.sqrt, 'scalar')
         );
      }, configSingleScalar);
      addBuiltin('floor', function(lst) {
         return Value.makeVariable(
            lst.get('x').map(Math.floor, 'scalar')
         );
      }, configSingleScalar);
      addBuiltin('ceiling', function(lst) {
         return Value.makeVariable(
            lst.get('x').map(Math.ceil, 'scalar')
         );
      }, configSingleScalar);
      addBuiltin('gamma', function(lst) {
         return Value.makeVariable(
            lst.get('x').map(Base.math.gamma, 'scalar')
         );
      }, configSingleScalar);
      addBuiltin('lgamma', function(lst) {
         return Value.makeVariable(
            lst.get('x').map(Base.math.lgamma, 'scalar')
         );
      }, configSingleScalar);
      addBuiltin('beta', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get('a'), lst.get('b'), Base.math.beta, 'scalar')
         );
      }, function(resolver) {
         resolver.addParameter('a', 'scalar', true)
            .addParameter('b', 'scalar', true);
      });
      addBuiltin('lbeta', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get('a'), lst.get('b'), Base.math.lbeta, 'scalar')
         );
      }, function(resolver) {
         resolver.addParameter('a', 'scalar', true)
            .addParameter('b', 'scalar', true);
      });
      addBuiltin('lchoose', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get('n'), lst.get('k'), Base.math.lchoose, 'scalar')
         );
      }, function(resolver) {
         resolver.addParameter('n', 'scalar', true)
            .addParameter('k', 'scalar', true);
      });
      addBuiltin('choose', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get('n'), lst.get('k'), Base.math.choose, 'scalar')
         );
      }, function(resolver) {
         resolver.addParameter('n', 'scalar', true)
            .addParameter('k', 'scalar', true);
      });
      evalLang('factorial <- function(n) { gamma(n + 1) }');
      evalLang('lfactorial <- function(n) { lgamma(n + 1) }');
      /*
       * Supported expressions:
       *
       * - seq(5) = 1:5                  (to)
       * - seq(-2) = 1:-2                (to)
       * - seq(-2, by=1) = -2:1          (from, by)
       * - seq(3, 1) = 3:1               (from, to)
       * - seq(3, 7, 2) = c(3, 5, 7)     (from, to, by)
       * - seq(4, along.with=1:4)
       * - seq(4, 5, along.with=1:4)
       * - seq(4, 5, length.out=4)
       */
      addBuiltin('seq', function(lst) {
         return Value.makeVariable(
            Base.Variable.seq(lst.get('from'), lst.get('to'), lst.get('by'))
         );
      }, function config(resolver) {
         resolver.addParameter('from', 'number', true)
            .addParameter('to', 'number', true)
            .addParameter('by', 'number', true)
            .addParameter('length.out', 'number')
            .addParameter('along.with', 'variable')
            .addDefault('from', '1')
            .addDependent('length.out', 'along.with', function(alongWith) {
               return alongWith.length();
            })
            .addNormalize(function(lst) {
               if (!lst.has('to') && !lst.has('by') && !lst.has('length.out') &&
                   !lst.has('along.with')) {
                  lst.set('to', lst.get('from'));
                  lst.set('from', 1);
               }
            })
            .addDefault('by', function(lst) {
               if (lst.has('to')) {
                  if (lst.has('length.out')) {
                     return lst.get('length.out') === 1 ?
                        0
                        : (lst.get('to') - lst.get('from')) / (lst.get('length.out') - 1);
                  }
                  return Math.sign(lst.get('to') - lst.get('from'));
               }
               return Math.sign(lst.get('from'));
            })
            .addDefault('to', function(lst) {
               if (lst.has('length.out')) {
                  return lst.get('from') + (lst.get('length.out') - 1) * lst.get('by');
               }
               return 1;
            });
      });

      // Accumulators
      addBuiltin('cumsum', function(lst) {
         return Value.makeVariable(lst.get('x').cumSum(), 'scalar');
      }, configSingleScalar);
      addBuiltin('cumprod', function(lst) {
         return Value.makeVariable(lst.get('x').cumProd(), 'scalar');
      }, configSingleScalar);
      addBuiltin('cummax', function(lst) {
         return Value.makeVariable(lst.get('x').cumMax(), 'scalar');
      }, configSingleScalar);
      addBuiltin('cummin', function(lst) {
         return Value.makeVariable(lst.get('x').cumMin(), 'scalar');
      }, configSingleScalar);
      addBuiltin('diff', function(lst) {
         return Value.makeVariable(lst.get('x').diff(), 'scalar');
      }, configSingleScalar);

      // Expression manipulation
      addBuiltin('quote', function(lst) {
         return Value.wrap(lst.get('expr'));
      }, function(resolver) {
         resolver.addLanguageParameter('expr', true);
      });

      // ENVIRONMENT MANIPULATING FUNCTIONS
      //
      //
      addBuiltin('environment', function(lst, env) {
         var fun;

         fun = lst.get('fun');
         if (typeof fun === 'function') {
            if (fun.hasOwnProperty('env')) {
               return Value.wrap(fun.env);
            }
            // built-in function
            return Value.makeNull();
         }
         // null case, return current env
         return Value.wrap(env);
      }, function(resolver) {
         resolver.addParameter('fun', ['function', 'null'])
            .addDefault('fun', 'NULL');
      });
      addBuiltin('environment<-', function(lst, env) {
         var fun;

         fun = lst.get('fun');
         if (fun.hasOwnProperty('env')) {
            fun.env = lst.get('value');
         }
         // assignment functions return the 'x' argument
         return Value.wrap(fun);
      }, function(resolver) {
         resolver.addParameter('fun', ['function'])
            .addParameter('value', ['env']);
      });
      // immediate function invocation
      (function(baseenv) {
         addBuiltin('baseenv', function(lst, env) {
            return Value.wrap(baseenv);
         });
      }(evalLang('environment()')[0].value));
      addBuiltin('emptyenv', function(lst) {
         return Value.wrap(Environment.emptyenv);
      });
      addBuiltin('globalenv', function(lst, env, evalInstance) {
         return Value.wrap(evalInstance.getGlobalEnv());
      });
      addBuiltin('search', function(lst, dynEnv, evalInstance) {
         var arr, env;

         arr = [];
         env = evalInstance.getGlobalEnv();
         while (env !== Environment.emptyenv) {
            arr.push(env.name);
            env = env.getEnclosure();
         }

         return Value.makeString(arr);
      });
      addBuiltin('environmentName', function(lst) {
         return Value.makeString(lst.get('env').name);
      }, function(resolver) {
         resolver.addParameter('env', ['env'], true);
      });
      addBuiltin('parent.frame', function(lst, env, evalInstance) {
         return Value.wrap(evalInstance.getCallFrame(lst.get('n')));
      }, function(resolver) {
         resolver.addParameter('n', 'number')
            .addDefault('n', '1')
            .addNormalize(function(lst) {
               if (lst.get('n') < 1) {
                  throw new Error('Invalid n value (need n > 0).');
               }
            });
      });
      addBuiltin('new.env', function(lst) {
         return Value.wrap(lst.get('parent').extend());
      }, function(resolver) {
         resolver.addParameter('parent', 'env')
            .addParameter('hash', 'boolean')
            .addParameter('size', 'number')
            .addDefault('parent', 'parent.frame()')
            .addDefault('hash', 'TRUE')
            .addDefault('size', '29');
      });
      addBuiltin('parent.env', function(lst) {
         var env;

         env = lst.get('env');
         if (env === Environment.emptyenv) {
            throw new Error('the empty environment has no parent');
         }

         return Value.wrap(env.getEnclosure());
      }, function(resolver) {
         resolver.addParameter('env', 'env', true);
      });
      addBuiltin('as.environment', function(lst, dynEnv, evalInstance) {
         return Value.wrap(evalInstance.search(lst.get('x')));
      }, function(resolver) {
         resolver.addParameter('x', ['number', 'string', 'env'], true);
      });
      addBuiltin('assign', function(lst, dynEnv, evalInstance) {
         var x, value, env, inherits;

         x = lst.get('x');
         value = Value.wrap(lst.get('value'));
         env = lst.get('envir');
         inherits = lst.get('inherits');
         evalInstance.getEnvironmentForSymbol(x, env, inherits).store(x, value);

         return value;
      }, function(resolver) {
         resolver.addParameter('x', 'string', true)
            .addParameter('value', 'any', true)
            .addParameter('pos', ['number', 'env', 'character'])
            .addParameter('envir', 'env')
            .addParameter('inherits', 'boolean')
            .addParameter('immediate', 'boolean')
            .addDefault('pos', '-1')
            .addDefault('envir', 'as.environment(pos)')
            .addDefault('inherits', 'FALSE')
            .addDefault('immediate', 'TRUE')
            .addNormalize(normalizeFieldToString('pos'));
      });
      addBuiltin('get', function(lst, dynEnv, evalInstance) {
         var x, env, inherits, mode, modeFun, foundValue;

         x = lst.get('x');
         env = lst.get('envir');
         inherits = lst.get('inherits');

         mode = lst.get('mode');
         if (mode !== 'any') {
            modeFun = function(v) { return v.matchesMode(mode); };
         }

         foundValue = env.lookup(x, inherits, modeFun);
         if (foundValue == null) {
            throw new Error('Could not find object ' + x);
         }

         return Value.wrap(foundValue);
      }, function(resolver) {
         resolver.addParameter('x', 'string', true)
            .addParameter('pos', ['number', 'env', 'character'])
            .addParameter('envir', 'env')
            .addParameter('mode', 'string')
            .addParameter('inherits', 'boolean')
            .addDefault('pos', '-1')
            .addDefault('envir', 'as.environment(pos)')
            .addDefault('mode', function() { return 'any'; })
            .addDefault('inherits', 'TRUE')
            .addNormalize(normalizeFieldToString('pos'));
      });

      // END OF ENVIRONMENT MANIPULATING FUNCTIONS

      addBuiltin('missing', function(lst, dynEnv) {
         var symbol, wasUndefined;

         symbol = lst.get('x');

         if (!(symbol instanceof Expression.Symbol)) {
            throw new Error('invalid use of \'missing\'');
         }

         if (!dynEnv.hasOwnSymbol(symbol.id)) {
            throw new Error('can only use \'missing\' for arguments');
         }

         // Look up without inheriting or resolving
         wasUndefined = dynEnv.lookup(symbol.id, false).type === 'undefined';

         return Value.wrap(wasUndefined);
      }, function(resolver) {
         resolver.addParameter('x', 'expression', true);
      });
      // TODO: Add a whole lot more here.

   };
   /* eslint-enable max-statements */

   // Helper functions
   function doDiv(v1, v2) {
      return Math.floor(v1 / v2);
   }

   function doMod(v1, v2) {
      return v1 - doDiv(v1, v2) * v2;
   }

   // Configuration for binary operators
   function configArithOp(resolver) {
      resolver.addParameter('x', 'scalar', true)
         .addParameter('y', 'scalar', true);
   }

   // Configuration for operators such as `+` and `-` which can be either
   // unary or binary
   function configUnaryBinaryOp(resolver) {
      resolver.addParameter('x', 'scalar', true)
         .addParameter('y', 'scalar', false);
   }

   // Configuration for comparision operators
   function configCompOp(resolver) {
      resolver.addParameter('x', 'atomic', true)
         .addParameter('y', 'atomic', true)
         .addNormalize(function(lst) {
            var commonMode;

            commonMode = Base.Variable.commonMode(lst.get('x').mode(),
                                                  lst.get('y').mode());
            lst.set('x', lst.get('x').convert(commonMode));
            lst.set('y', lst.get('y').convert(commonMode));
         });
   }

   function configLogicOp(resolver) {
      resolver.addParameter('x', 'logical', true)
         .addParameter('y', 'logical', true);
   }

   function configSingleScalar(resolver) {
      resolver.addParameter('x', 'scalar', true);
   }

   function normalizeFieldToString(fieldName) {
      return function(lst) {
         var fieldValue;

         fieldValue = lst.get(fieldName);
         if (fieldValue instanceof Base.Variable) {
            // error for length 0, else use 1st entry
            if (fieldValue.length() === 0) {
               throw new Error('cannot convert variable of length 0 to string');
            }
            lst.set(fieldName, fieldValue.get(1));
         }
      };
   }
});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
