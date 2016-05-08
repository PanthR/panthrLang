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
   Value.makeValue = function makeValue(type, value) {
      return new Value(type, value);
   };

   Value.makeNumeric = function makeNumeric(value) {
      return Value.makeValue('numeric', value);
   };

   Value.makeList = function makeList(value) {
      return Value.makeValue('list', value);
   };

   Value.makeClosure = function makeClosure(func, env) {
      return Value.makeValue('closure', { func: func, env: env });
   };

   Value.makeBuiltin = function makeBuiltin(f) {
      return Value.makeValue('builtin', { f: f });
   };

   Value.makeMissing = function makeMissing() {
      return Value.makeValue('missing', {});
   };

   Value.makePromise = function makePromise(thunk) {
      return Value.makeValue('promise', { thunk: thunk });
   };

   Value.makePackage = function makePackage(pack) {
      return Value.makeValue('pack', { package: pack });
   };

   Value.prototype = {
      resolve: function() {
         var val;

         if (this.type === 'promise') {
            val = this.value.thunk();
            this.type = val.type;
            this.value = val.value;
         }

         return this;
      }
   };

   return Value;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
