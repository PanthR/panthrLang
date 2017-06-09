(function(define) {
'use strict';
define(function(require) {

   var Base, Expression, Environment;

   Base = require('panthrbase/index');
   Expression = require('./expression');
   Environment = require('./environment');

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
   Value.undefined = new Value('undefined' /* , undefined */);

   Value.ControlFlowException = function ControlFlowException(message, loc, type) {
      this.message = message;
      this.loc = loc;
      this.type = type;
   };

   Value.ControlFlowException.prototype = Object.create(Error.prototype);
   Value.ControlFlowException.prototype.name = 'ControlFlowException';
   Value.ControlFlowException.prototype.constructor = Value.ControlFlowException;

   Value.break = function throwBreak(loc) {
      return new Value.ControlFlowException('break used without enclosing while/for loop',
         loc, 'break');
   };

   Value.next = function throwNext(loc) {
      return new Value.ControlFlowException('next used without enclosing while/for loop',
         loc, 'next');
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
      // "env" is the current environment, and is meant to only be used
      // by the environment-managing methods in base
      return function(actuals, env) {
         // Before passing to built-in function, we need to
         // "unvalue" the actuals list.
         var resolvedActuals;

         resolvedActuals = resolver.resolve(actuals, env, this);
         return fun(resolvedActuals, env, this);
      };
   }

   function evalClosure(fun, env) {
      return function(actuals, dynEnv) {
         var formals, body, closExtEnvironment, actualPos;

         // Will be messing with the array of formals, so need to copy it
         formals = fun.params.slice();
         body = fun.body;
         closExtEnvironment = env.extend();
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
               closExtEnvironment.store(formals[j].id, actual);
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
               closExtEnvironment.store('...', Value.makeList(actuals));
               actuals = new Base.List();
            } else if (actualPos <= actuals.length() &&
                       actuals.get(actualPos).type !== 'undefined') {
               // There is a value to read, bind formal to value
               closExtEnvironment.store(formals[0].id, actuals.get(actualPos));
               actuals.delete(actualPos);
            } else {
               if (formals[0].name === 'param_default') {
                  // Need to evaluate the default value
                  // Cannot evaluate right away because it might depend on
                  // later defaults. Must create a promise. It will not be
                  // executed unless needed.
                  closExtEnvironment.store(
                     formals[0].id,
                     Value.makeDelayed(formals[0].default, closExtEnvironment, this)
                  );
               } else {
                  // Need to set to missing value
                  closExtEnvironment.store(formals[0].id, Value.makeUndefined());
               }
               // Values here are either set by default or are missing
               // If the missing-ness was caused by an empty argument,
               // the missing value promise needs to be deleted.
               if (actualPos <= actuals.length()) {
                  actuals.delete(actualPos); // missing value promise
               }
            }
            formals.splice(0, 1);
         }
         try {
            // TODO: need a 4th argument, `call`
            this.callStack.push(dynEnv, closExtEnvironment, fun);
            return this.evalInEnvironment(body, closExtEnvironment);
         } catch (e) {
            throw e;
         } finally {
            this.callStack.pop();
         }
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
      return Value.makeVariable(new Base.Variable(value, { mode: 'scalar' }));
   };

   Value.makeString = function makeString(value) {
      return Value.makeVariable(new Base.Variable(value, { mode: 'string' }));
   };

   Value.makeLogical = function makeLogical(value) {
      return Value.makeVariable(new Base.Variable(value, { mode: 'logical' }));
   };

   // Creates the appropriate type from a provided variable
   // depending on the variable's mode.
   Value.makeVariable = function makeVariable(value) {
      return Value.makeValue(value.mode(), value);
   };

   Value.makeList = function makeList(value) {
      return Value.makeValue('list', value);
   };

   Value.makeExpression = function makeExpression(value) {
      return Value.makeValue('expression', value);
   };

   Value.makeSymbol = function makeSymbol(value) {
      return Value.makeValue('symbol', value);
   };

   Value.makeClosure = function makeClosure(fun, env) {
      var f;

      // create the closure based on values of fun and env
      // at time of calling the closure value function,
      // allowing the environment (and function) of the closure
      // to be changed
      // "this", here, is the current evaluation instance
      f = function(actuals, dynEnv) {
         return evalClosure.call(this, f.fun, f.env).call(this, actuals, dynEnv);
      };
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

   Value.makeUndefined = function makeUndefined() {
      return Value.undefined;
   };

   Value.makeNull = function makeNull() {
      return Value.null;
   };

   Value.makeDelayed = function makeDelayed(expr, env, evalInstance) {
      return Value.makeValue('promise', {
         thunk: function() { return evalInstance.evalInEnvironment(expr, env); },
         node: expr,
         env: env
      });
   };

   Value.makeEnvironment = function makeEnvironment(env) {
      return Value.makeValue('env', env);
   };

   Value.makePackage = function makePackage(pack) {
      return Value.makeValue('pack', { package: pack });
   };

   /* eslint-disable complexity */
   /* Attempts to create a Value out of `v`. Typically `v` was obtained via
    * unwrapping a Value, and this method is the inverse process.
    *
    * Cases handled:
    * - A `Value` object is simply returned.
    * - A `Base.Variable` object is passed to `Value.makeVariable`.
    * - A `Base.List` object is passed to `Value.makeList`.
    * - A function with either fun & env properties or fun & resolver properties
    *     will become a `closure` or `builtin` value accordingly.
    * - Numbers, booleans and string literals will be converted to appropriate
    *     Variable values.
    * - Arrays will be passed to the `Base.Variable` constructor.
    * - The null value `Value.null` will be returned as itself.
    * - An `Expression` becomes an expression value.
    * - An `Expression.Symbol` becomes a symbol value.
    * - An `Expression.Literal` becomes the corresponding value.
    * - Other values will result in an exception.
    */
   Value.wrap = function wrap(v) {
      if (v === null) { return Value.makeNull(); }
      if (typeof v === 'undefined') { return Value.makeUndefined(); }
      if (v instanceof Value) { return v; }
      if (v instanceof Environment) { return Value.makeEnvironment(v); }
      if (v instanceof Base.Variable) { return Value.makeVariable(v); }
      if (v instanceof Expression) { return Value.makeExpression(v); }
      if (v instanceof Expression.Symbol) { return Value.makeSymbol(v); }
      if (v instanceof Expression.Literal) { return Value.wrap(v.value); }
      if (v instanceof Base.List) { return Value.makeList(v); }
      if (v instanceof Function) {
         if (v.hasOwnProperty('env')) {
            return Value.makeValue('closure', v);
         } else if (v.hasOwnProperty('resolver')) {
            return Value.makeValue('builtin', v);
         }
         throw new Error('Do not know how to convert arbitrary functions to Value');
      }
      if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string') {
         return Value.makeVariable(new Base.Variable([v]));
      }
      if (Array.isArray(v)) { return Value.makeVariable(new Base.Variable(v)); }
      throw new Error('Do not know how to convert this kind of value to Value: ' + v);
   };
   /* eslint-enable complexity */

   // Clones those Values that have clonable values.
   Value.prototype.clone = function clone() {
      if (this.value instanceof Base.Variable) {
         return Value.makeVariable(this.value.clone());
      }
      if (this.type === 'list') {
         return Value.makeList(this.value.clone());
      }

      return this;
   };

   Value.prototype.resolve = function resolve() {
      if (this.type === 'promise') {
         if (!this.hasOwnProperty('resolvedValue')) {
            this.resolvedValue = this.value.thunk();
         }

         return this.resolvedValue;
      }

      return this;
   };

   Value.prototype.matchesMode = function matchesMode(mode) {
      switch (mode) {
      case 'numeric': /* fall-through */
      case 'integer': /* fall-through */
      case 'double': return this.type === 'scalar';
      case 'character': return this.type === 'string';
      case 'NULL': return this.type === 'null';
      case 'closure': /* fall-through */
      case 'builtin': /* fall-through */
      case 'function': return this.type === 'builtin' || this.type === 'closure';
      case 'environment': return this.type === 'env';
      case 'name': return this.type === 'symbol';
      case 'language': return this.type === 'expression';
      default: return this.type === mode;
      }
   };

   /**
    *  Returns the unevalauated expression represented by this value.
    *  Note: Only usable for Values that are passed as arguments in
    *  function calls.
    */
   Value.prototype.toExpression = function toExpression() {
      if (this.value.hasOwnProperty('node')) {
         return Expression.maker(this.value.node);
      }
      throw new Error('Attempting to read expression for a non-promise value.');
   };

   Value.prototype.toString = function toString() {
      switch (this.type) {
      case 'error':
         return 'Error: ' +
                this.value.message.toString() + ' near ' +
                (this.value.loc == null ? ''
                  : this.value.loc.firstLine + ':' +
                     this.value.loc.firstColumn);
      case 'undefined':
         return '<undefined: undefined>';
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
