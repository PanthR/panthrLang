(function(define) {
'use strict';
define(function(require) {

   /**
    * Kinds of values produced by the interpreter
    *
    * They carry a "type" along with the actual value.
    *
    * R's types are: logical", "integer", "double", "complex", "character",
    * "raw" and "list", "NULL", "closure", "special", "builtin",
    * "environment", "S4" (some S4 objects)
    * not at user level: ("symbol", "pairlist", "promise", "language", "char",
    *     "...", "any", "expression", "externalptr", "bytecode" and "weakref")
    */
   function Value(type, value) {
      this.type = type;
      this.value = value;
   }

   /* Takes arbitrary many arguments */
   Value.make_value = function make_value(type, value) {
      return new Value(type, value);
   }

   Value.make_numeric = function make_numeric(value) {
      return Value.make_value('numeric', value);
   }

   Value.make_closure = function make_closure(func, env) {
      return Value.make_value('closure', { func: func, env: env });
   }

   return Value;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
