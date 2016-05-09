(function(define) {
'use strict';
define(function(require) {
// Example of how a package is structured.
   var Base;

   Base = require('panthrBase');
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
      // Packages may need to load panthrBase like we have
      addBuiltin('list', function(lst) {
         return Value.makeList(lst);
      });
      addBuiltin('c', function(lst) {
         return Value.makeVariable(lst.toVariable());
      });
      addBuiltin('sin', function(lst) {
         return Value.makeScalar(lst.toVariable().map(Math.sin));
      });
      // TODO: Add a whole lot more here.
   };

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
