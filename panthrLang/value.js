(function(define) {
'use strict';
define(function(require) {

   var Base;

   Base = require('panthrbase/index');
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

   Value.makeError = function makeError(err) {
      return Value.makeValue('error', err);
   };

   Value.makeScalar = function makeScalar(value) {
      return Value.makeVariable(new Base.Variable([value], { mode: 'scalar' }));
   };

   Value.makeLogical = function makeLogical(value) {
      return Value.makeVariable(new Base.Variable([value], { mode: 'logical' }));
   };

   // Creates the appropriate type from a provided variable
   // depending on the variable's mode.
   Value.makeVariable = function makeVariable(value) {
      return Value.makeValue(value.mode(), value);
   };

   Value.makeList = function makeList(value) {
      return Value.makeValue('list', value);
   };

   Value.makeClosure = function makeClosure(fun, env) {
      return Value.makeValue('closure', { fun: fun, env: env });
   };

   Value.makeBuiltin = function makeBuiltin(fun) {
      return Value.makeValue('builtin', { fun: fun });
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
      },
      toString: function() {
         switch (this.type) {
         case 'error':
            return 'Error: ' +
                   this.value.message.toString() + ' near ' +
                   this.value.loc.firstLine + ':' +
                   this.value.loc.firstColumn;
         default:
            return '<' + this.type + ': ' + this.value.toString() + '>';
         }
      }
   };

   return Value;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
