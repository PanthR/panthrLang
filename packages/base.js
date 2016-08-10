(function(define) {
'use strict';
define(function(require) {
// Example of how a package is structured.
   var Base;

   Base = require('panthrbase/index');

// It needs to always return a function with the following signature:
   return function(evalLang, addBuiltin, Value) {
      // It can call on each of these to create new bindings.
      // For instance we could do:
      // evalLang('foo <- 3.1456'); where the string '3.1456' will be evaluated
      // as a panthrLang expression in the package's "global frame".

      // It can also use addBuiltin to add built-in functions to the language.
      // These functions can use the "Value" constructor and its helper methods
      // to return an appropriate value of type "Value".
      // All built-in functions should expect a Base.List
      //
      addBuiltin('+', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return x + y;
            }, 'scalar')
         );
      }, configArithOp);
      addBuiltin('-', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return x - y;
            }, 'scalar')
         );
      }, configArithOp);
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

      // Packages may need to load panthrbase like we have
      addBuiltin('list', function(lst) {
         return Value.makeList(lst);
      });
      // TODO: Must concat nonlists as well
      addBuiltin('c', function(lst) {
         return Value.makeVariable(lst.toVariable());
      });
      addBuiltin('sin', function(lst) {
         return Value.makeVariable(
            lst.get(1).map(function(x) {
               return Math.sin(x);
            }, 'scalar')
         );
      }, configSingleScalar);
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
            .addParameter('lengthOut', 'number')
            .addParameter('alongWith', 'variable')
            .addDefault('from', function(lst) { return 1; })
            .addDependent('lengthOut', 'alongWith', function(alongWith) {
               return alongWith.length();
            })
            .addNormalize(function(lst) {
               if (!lst.has('to') && !lst.has('by') && !lst.has('lengthOut') &&
                   !lst.has('alongWith')) {
                  lst.set('to', lst.get('from'));
                  lst.set('from', 1);
               }
            })
            .addDefault('by', function(lst) {
               if (lst.has('to')) {
                  if (lst.has('lengthOut')) {
                     return lst.get('lengthOut') === 1 ?
                        0
                        : (lst.get('to') - lst.get('from')) / (lst.get('lengthOut') - 1);
                  }
                  return Math.sign(lst.get('to') - lst.get('from'));
               }
               return Math.sign(lst.get('from'));
            })
            .addDefault('to', function(lst) {
               if (lst.has('lengthOut')) {
                  return lst.get('from') + (lst.get('lengthOut') - 1) * lst.get('by');
               }
               return 1;
            });
      });
      // TODO: Add a whole lot more here.

   };

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

   function configLogicOp(resolver) {
      resolver.addParameter('x', 'logical', true)
         .addParameter('y', 'logical', true);
   }

   function configSingleScalar(resolver) {
      resolver.addParameter('x', 'scalar', true);
   }
});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
