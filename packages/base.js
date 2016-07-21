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
      addBuiltin('`+`', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return x + y;
            }, 'scalar')
         );
      });
      addBuiltin('`-`', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return x - y;
            }, 'scalar')
         );
      });
      addBuiltin('`*`', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return x * y;
            }, 'scalar')
         );
      });
      addBuiltin('`/`', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return x / y;
            }, 'scalar')
         );
      });
      addBuiltin('`^`', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return Math.pow(x, y);
            }, 'scalar')
         );
      });
      addBuiltin('`%/%`', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return doDiv(x, y);
            }, 'scalar')
         );
      });
      addBuiltin('`%%`', function(lst) {
         return Value.makeVariable(
            Base.Variable.mapPair(lst.get(1), lst.get(2), function(x, y) {
               return doMod(x, y);
            }, 'scalar')
         );
      });
      // Negation
      // Or
      // And

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
      });
      addBuiltin('seq', function(lst) {
         var named, unnamed;

         // remove named args from lst and put into an object
         named = {};
         unnamed = [];

         lst.each(function(val, index, name) {
            if (!Base.utils.isMissing(name)) {
               named[name] = val;
            } else {
               unnamed.push(val);
            }
         });

         ['from', 'to', 'by', 'lengthOut', 'alongWith'].forEach(function(str) {
            if (!named.hasOwnProperty(str) && unnamed.length > 0) {
               named[str] = unnamed.shift();
            }
         });

         if (Object.keys(named).length === 1 && named.hasOwnProperty('from')) {
            named.to = named.from instanceof Base.Variable ? named.from.length() : named.from;
            named.from = 1;
         }
         named.from = named.hasOwnProperty('from') ? named.from.get(1) : 1;
         if (named.hasOwnProperty('to')) {
            named.to = named.to.get(1);
         }
         if (named.hasOwnProperty('lengthOut')) {
            named.lengthOut = named.lengthOut.get(1);
         }
         if (named.hasOwnProperty('alongWith')) {
            named.lengthOut =
               named.alongWith instanceof Base.Variable ? named.alongWith.length()
                                                        : named.alongWith;
         }
         // any two of 'to', 'by', 'lengthOut' determine the third -- or, "too many arguments"
         // if 'to' and 'by' are set, ignore 'length'
         named.by = named.hasOwnProperty('by') ?
            named.by.get(1)
            : named.hasOwnProperty('to') ?
               named.hasOwnProperty('lengthOut') ?
                  named.lengthOut === 1 ?
                     0
                     : (named.to - named.from) / (named.lengthOut - 1)
                     : Math.sign(named.to - named.from)
                     : 1;
         if (!named.hasOwnProperty('to')) {
            named.to = named.hasOwnProperty('lengthOut') ?
               named.from + (named.lengthOut - 1) * named.by
               : 1;
         }

         return Value.makeVariable(
            Base.Variable.seq(named.from, named.to, named.by)
         );
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

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
