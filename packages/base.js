(function(define) {
'use strict';
define(function(require) {
// Example of how a package is structured.
   var Base;

   Base = require('panthrbase/index');

// It needs to always return a function with the following signature:
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
            .addDefault('recursive', function() { return false; });
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
            .addDefault('drop', function() { return true; })
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
            .addParameter('length.out', 'number')
            .addParameter('along.with', 'variable')
            .addDefault('from', function(lst) { return 1; })
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
});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
