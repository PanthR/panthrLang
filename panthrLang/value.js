(function(define) {
'use strict';
define(function(require) {

   var Base, evalInFrame;

   Base = require('panthrbase/index');

   evalInFrame = function(body, frame) {
      throw new Error('Need to call call Value.setEvalInFrame first');
   };

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

   Value.null = new Value('null', null);
   Value.null.value = Value.null;

   Value.setEvalInFrame = function(f) {
      evalInFrame = f;

      return Value;
   };

   Value.functionFromValue = function(value) {
      if (value.type === 'closure' || value.type === 'builtin') {
         return value.value;
      }
      throw new Error('Attempting to make function from non-function value.' +
         'This should not be happening');
   };

   function evalBuiltin(fun, resolver) {
      // "Builtin" functions are Javascript functions. They expect one argument
      // that is a "list" in the panthrBase sense.
      // "actuals" needs to turn into such a list.
      return function(actuals) {
         // Before passing to built-in function, we need to
         // "unvalue" the actuals list.
         var resolvedActuals;

         resolvedActuals = resolver.resolve(actuals);
         return fun(resolvedActuals);
      };
   }

   function evalClosure(fun, env) {
      return function(actuals) {
         var formals, body, closExtFrame, actualPos;

         // Will be messing with the array of formals, so need to copy it
         formals = fun.params.slice();
         body = fun.body;
         closExtFrame = env.extend();
         // Go through actuals, see if they are named and match a formal
         // Compares the i-th element in the actuals list to the j-th element
         // in the formals list. It adjusts the arrays if necessary.
         // Since actuals are a Base.List, their indexing starts at 1.
         function matchNamed(i, j) {
            var actual, name;

            if (i > actuals.length()) { return null; }
            actual = actuals.get(i);
            name = actuals.names(i);
            if (!name) { return matchNamed(i + 1, 0); }
            if (j >= formals.length) { return matchNamed(i + 1, 0); }
            if ((formals[j].name === 'param' ||
                 formals[j].name === 'param_default') &&
                formals[j].id === name) {
               // found match
               closExtFrame.store(formals[j].id, actual);
               formals.splice(j, 1);
               actuals.delete(i);
               // i-th spot now contains the next entry
               return matchNamed(i, 0);
            }
            return matchNamed(i, j + 1);
         }
         matchNamed(1, 0);

         // At this point named formals have been matched and removed from
         // both lists.
         // Any remaining named actuals may still be absorbed by "...""
         // We match remaining formals by position skipping named
         // actuals, until we encounter "..."
         // If there is a remaining dots formal, we need to bind it to "..."
         // If there are other remaining formals they need to be bound to a
         // "missing" value, which if accessed should raise error.
         actualPos = 1; // Holds the place in the actuals that contains the
                        // first nonnamed actual.
         while (formals.length !== 0) {
            while (actualPos <= actuals.length() &&
                   actuals.names(actualPos)) {
               actualPos += 1; // Find first unnamed argument
            }
            if (formals[0].name === 'param_dots') {
               // Need to eat up all remaining actuals.
               closExtFrame.store('...', Value.makeList(actuals));
               actuals = new Base.List();
            } else if (actualPos <= actuals.length()) {
               // There is a value to read
               closExtFrame.store(formals[0].id, actuals.get(actualPos));
               actuals.delete(actualPos);
            } else if (formals[0].name === 'param_default') {
               // Need to evaluate the default value
               // Cannot evaluate right away because it might depend on
               // later defaults. Must create a promise. It will not be
               // executed unless needed.
               closExtFrame.store(
                  formals[0].id,
                  Value.makePromise(
                     evalInFrame.bind(null, formals[0].default, closExtFrame)
                  )
               );
            } else {
               // Need to set to missing value
               closExtFrame.store(formals[0].id, Value.makeMissing());
            }
            formals.splice(0, 1);
         }

         return evalInFrame(body, closExtFrame);
      };
   }

   // The different value implementations follow

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
      var f;

      f = evalClosure(fun, env);
      f.fun = fun;
      f.env = env;

      return Value.makeValue('closure', f);
   };

   Value.makeBuiltin = function makeBuiltin(fun, resolver) {
      var f;

      f = evalBuiltin(fun, resolver);
      f.fun = fun;
      f.resolver = resolver;

      return Value.makeValue('builtin', f);
   };

   Value.makeMissing = function makeMissing() {
      return Value.makeValue('missing', {});
   };

   Value.makeNull = function makeNull() {
      return Value.null;
   };

   Value.makePromise = function makePromise(thunk) {
      return Value.makeValue('promise', { thunk: thunk });
   };

   Value.makePackage = function makePackage(pack) {
      return Value.makeValue('pack', { package: pack });
   };

   Value.prototype.resolve = function resolve() {
      var val;

      if (this.type === 'promise') {
         val = this.value.thunk();
         this.type = val.type;
         this.value = val.value;
      }

      return this;
   };

   Value.prototype.toString = function toString() {
      switch (this.type) {
      case 'error':
         return 'Error: ' +
                this.value.message.toString() + ' near ' +
                (this.value.loc == null ? ''
                  : this.value.loc.firstLine + ':' +
                     this.value.loc.firstColumn);
      default:
         return '<' + this.type + ': ' + this.value.toString() + '>';
      }
   };

   return Value;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
