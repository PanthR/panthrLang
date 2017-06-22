(function(define) {
'use strict';
define(function(require) {

   var Environment, Value, Base, parser, Resolver, CallStack, packages;

   Environment = require('./environment');
   Value = require('./value');
   Base = require('panthrbase/index');
   parser = require('./parser').parser;
   Resolver = require('./resolver');
   CallStack = require('./callStack');

   // This is where the external program will "setup" packages bound to names.
   // These do not get loaded at this point, but they can be found later.
   packages = {};

   function Evaluate(enclosure) {
      this.global = Environment.newGlobal(enclosure);
      this.callStack = new CallStack(this.global);
   }

   // This function is used to add a package, in the form of a function
   // expecting arguments "evalLang", "addBuiltin", "Value" (see issue #16)
   Evaluate.addPackage = function addPackage(name, func) {
      var extendedName;

      extendedName = 'package:' + name;
      if (packages.hasOwnProperty(extendedName)) {
         console.log('Warning: A package with name ' + name + ' already exists.' +
            ' The old package will no longer be accessible.');
      }
      packages[extendedName] = func;

      return Evaluate;
   };
   Evaluate.listPackages = function() {
      return Object.keys(packages);
   };

   Evaluate.prototype = {
      eval: function(node) {
         return this.evalInEnvironment(node, this.global);
      },
      // Parses and evaluates a string in the given Evaluate setup.
      // Returns the array of results.
      parseAndEval: function(str) {
         return this.parseThenEval(str, this.global);
      },
      // Loads base packages
      initialSetup: function() {
         this.parseAndEval('library(base)');
         this.parseAndEval('library(stats)');
      }
   };

   Object.defineProperties(Evaluate.prototype, {
      extendParseEval: { value: extendParseEval },
      parseThenEval: { value: parseThenEval },
      evalInEnvironment: { value: evalInEnvironment },
      lookup: { value: lookup },
      assign: { value: assign },
      evalRange: { value: evalRange },
      evalSeq: { value: evalSeq },
      evalFor: { value: evalFor },
      evalWhile: { value: evalWhile },
      evalIf: { value: evalIf },
      evalCall: { value: evalCall },
      evalActuals: { value: evalActuals },
      evalFunDef: { value: evalFunDef },
      getEnvironmentForSymbol: { value: getEnvironmentForSymbol },
      getGlobalEnv: { value: getGlobalEnv },
      pushCall: { value: pushCall },
      popCall: { value: popCall },
      getCallFrame: { value: getCallFrame },
      getParent: { value: getParent },
      getParentOfTop: { value: getParentOfTop },
      getFrameOfTop: { value: getFrameOfTop },
      convertToWhich: { value: convertToWhich },
      search: { value: search },
      loadPackage: { value: loadPackage }
   });

   // Evaluate the string as a PanthrLang language expression in an environment
   // resulting by extending the dynamic environment `env` with the bindings
   // from the `processed` list converted to `Value`s.
   function extendParseEval(str, env, processed) {
      var extendedEnv;

      extendedEnv = env.extend();
      processed.each(function(value, i, name) {
         extendedEnv.store(name, Value.wrap(value));
      });

      // parseThenEval returns an array of values. But here we
      // should only have had one value anyway. Get it out of the array.
      return this.parseThenEval(str, extendedEnv)[0];
   }

   // Given a string and an "evaluation environment", parses then
   // evaluates that string in that evaluation environment.
   // Returns the array of results (as well as possibly modifying the environment).
   function parseThenEval(str, env) {
      var vals, that;

      that = this;
      parser.yy.emit = function(nodes) {
         vals = nodes.map(function(node) {
            try {
               return that.evalInEnvironment(node, env);
            } catch (e) {
               if (e instanceof Value.ControlFlowException) {
                  return errorInfo(e.message, e.loc);
               }
               if (e instanceof Error) {
                  // An actual javascript/logic error
                  // Not a language error
                  throw e;
               }
               return e;
            }
         });
      };
      try {
         parser.parse(str);
      } catch (e) {
         console.log('Serious parser error:', e);
      }

      return vals;
   }

   // Loads a package into the current evaluation.
   // The package will be injected as a parent of the global environment.
   function loadPackage(packageName, env, loc) {
      var global, newEval;

      packageName = 'package:' + packageName;

      global = this.getGlobalEnv();

      if (!packages.hasOwnProperty(packageName)) {
         throw errorInfo('Unknown package: ' + packageName, loc);
      }

      // Search for existing package first
      newEval = global.getNamedAncestor(packageName);
      if (newEval == null) {
         // Eval environment for the package
         newEval = new Evaluate(global.getEnclosure());
         // Load the package, adding to the newEval's environment.
         packages[packageName](
            function evalLang(str) {
               return newEval.parseAndEval(str);
            },
            function addBuiltin(name, f, config) {
               var resolver;

               resolver = new Resolver();
               if (config != null) { config(resolver); }
               newEval.global.store(name, Value.makeBuiltin(f, resolver));
            },
            Value,
            function addBinding(name, value) {
               newEval.global.store(name, value);
            }
         );
         // Now we need to set the package's global to the proper place in
         // the search path.
         newEval.global.name = packageName;
         global.setEnclosure(newEval.global);
      }

      return Value.makePackage(newEval);
   }

   // "runs" a certain node to completion.
   // Emits the resulting value
   /* eslint-disable complexity */
   function evalInEnvironment(node, env) {
      // These two special cases are used by assignment:
      // The rhs value of an assignment needs to be stored and finally
      // returned.
      if (node.store) {
         node.store = false;
         node.computedValue = this.evalInEnvironment(node, env);

         return node.computedValue;
      }
      // And the lhs target variable needs to be evaluated specially
      // in some cases ("global" lookup)
      if (typeof node.specialEval === 'function') {
         return node.specialEval();
      }

      switch (node.type) {
      case 'number': return Value.makeScalar([node.value]);
      case 'boolean': return Value.makeLogical([node.value]);
      case 'string': return Value.makeString([node.value]);
      case 'missing': return Value.makeLogical(Base.utils.missing);
      case 'null': return Value.makeNull();
      case 'break': throw Value.break(node.loc);
      case 'next': throw Value.next(node.loc);
      case 'range':
         return this.evalRange(this.evalInEnvironment(node.from, env),
                               this.evalInEnvironment(node.to, env),
                               env, node.from.loc);
      case 'variable':
         return this.lookup(node.id, env, node.loc);
      case 'assign':
         return this.assign(node, env, false);
      case 'assign_existing':
         return this.assign(node, env, true);
      case 'fun_def':
         return this.evalFunDef(node, env);
      case 'block':
         return this.evalSeq(node.exprs, env);
      case 'parens':
         return this.evalInEnvironment(node.expr, env);
      case 'if':
         return this.evalIf(node, env);
      case 'while':
         return this.evalWhile(node, env);
      case 'for':
         return this.evalFor(node, env);
      case 'fun_call':
         return this.evalCall(this.evalInEnvironment(node.fun, env),
                              this.evalActuals(node.args, env), node.fun.loc, env);
      case 'library':
         return this.loadPackage(node.id, env, node.loc);
      case 'error':
         return errorInfo('unexpected token: ' + node.error.hash.text, node.loc);
      default:
         throw new Error('Unknown node: ' + node.type);
      }
   }
   /* eslint-enable complexity */

   function lookup(symbol, env, loc) {
      var val;

      val = env.lookup(symbol);

      if (val === null) {
         throw errorInfo('Unknown symbol: ' + symbol, loc);
      }
      val = val.resolve();
      if (val.type === 'undefined') {
         throw errorInfo('Accessing undefined parameter ' + symbol, loc);
      }

      return val;
   }

   // Carries out an assignment with a possibly complex lvalue
   // isGlobal: true for <<-, false for <-
   function assign(oldNode, env, isGlobal) {
      var newNode, lhsId, lhsRelevantEnv;

      try {
         // Tell rhs to store its result
         oldNode.rvalue.store = true;
         // Need to keep the oldNode around in order to evaluate
         // the correct return value from the assignment.
         newNode = oldNode.transformAssign();
      } catch (e) {
         throw errorInfo(e.message, oldNode.loc);
      }
      lhsId = newNode.lvalue.id;
      lhsRelevantEnv = this.getEnvironmentForSymbol(lhsId, env, isGlobal);

      // newNode.lvalue is the node that needs to be evaluated specially
      // on the rhs. We need to set up special evaluation here.
      if (isGlobal) {
         newNode.lvalue.specialEval = function() {
            return lookup(lhsId, lhsRelevantEnv, newNode.lvalue.loc);
         };
      }

      lhsRelevantEnv.store(
         lhsId,
         this.evalInEnvironment(newNode.rvalue, env).clone()
      );

      return oldNode.rvalue.computedValue;
   }

   function evalRange(a, b, env, loc) {
      return this.evalCall(this.lookup('seq', env), new Base.List({
         from: a, to: b
      }), loc, env);
   }

   function evalSeq(exprs, env) {
      var i, val;

      for (i = 0; i < exprs.length; i += 1) {
         val = this.evalInEnvironment(exprs[i], env);
      }
      return val;
   }

   function evalFunDef(node, env) {
      var formals, i, formal;

      formals = {};

      for (i = 0; i < node.params.length; i += 1) {
         formal = node.params[i].type === 'param_dots' ? '...' : node.params[i].id;
         if (formals.hasOwnProperty(formal)) {
            return errorInfo('repeated formal argument: ' + formal, node.loc);
         }
         formals[formal] = true;
      }

      return Value.makeClosure(node, env);
   }

   // Evaluates the actuals represented by the array of exprs
   // in the current environment. It also takes care to properly transform "..."
   // if it is present (it would have a value from the current function call).
   function evalActuals(exprs, env) {
      var actuals;

      actuals = new Base.List();

      // helper method that adds an unnamed value
      function addValue(value) {
         actuals.push(value);
      }

      function addNamedValue(name, value, loc) {
         if (actuals.has(name)) {
            throw errorInfo('symbol occurred twice ' + name, loc);
         }
         actuals.set(name, value);
      }
      exprs.forEach(function(expr) {
         switch (expr.type) {
         case 'arg_named':
            addNamedValue(expr.id, Value.makeDelayed(expr.value, env, this), expr.loc);
            break;
         case 'arg_dots':
            // Need to look for a defined dots in the immediate environment
            (function(result) {
               if (result == null) {
                  // This should never happen
                  throw new Error('Inappropriate use of ...');
               }
               result.value.each(function(value, i, name) {
                  if (name) {
                     addNamedValue(name, value);
                  } else {
                     addValue(value);
                  }
               });
            }(this.lookup('...', env, expr.loc)));
            break;
         case 'arg_empty':
            addValue(Value.makeUndefined());
            break;
         default:
            addValue(Value.makeDelayed(expr, env, this));
         }
      }, this);

      return actuals;
   }

   // `clos` has the function definition and the evaluation environment
   // (if it's a user-defined function)
   // `actuals` will be a Base.List
   // `env` is the calling environment, aka "parent.frame"
   function evalCall(clos, actuals, loc, env) {
      if (clos.type === 'closure' || clos.type === 'builtin') {
         try {
            // the current evaluate instance is "this"
            return Value.functionFromValue(clos).call(this, actuals, env);
         } catch (e) {
            if (e instanceof Value.ControlFlowException) {
               throw errorInfo(e.message, e.loc);
            }
            throw errorInfo(e.message || e.toString(), loc);
         }
      }
      throw errorInfo('trying to call non-function ' + clos.toString(), loc);
   }

   function evalIf(node, env) {
      var testResult;

      testResult = this.evalInEnvironment(node.test, env);
      testResult = Resolver.resolveValue(['boolean'])(testResult);

      if (testResult) {
         return this.evalInEnvironment(node.then, env);
      }
      if (typeof node.else !== 'undefined') {
         return this.evalInEnvironment(node.else, env);
      }
      // No else case
      return Value.makeNull();
   }

   function evalWhile(node, env) {
      var testResult;

      try {
         /* eslint-disable no-constant-condition */
         while (true) {
            testResult = this.evalInEnvironment(node.test, env);
            testResult = Resolver.resolveValue(['boolean'])(testResult);
            if (!testResult) { break; }
            this.evalInEnvironment(node.body, env);
         }
         /* eslint-enable no-constant-condition */
      } catch (e) {
         if (!(e instanceof Value.ControlFlowException)) { throw e; }
         if (e.type !== 'break') { throw e; }
      }

      return Value.makeNull();
   }

   function evalFor(node, env) {
      var seq;

      seq = this.evalInEnvironment(node.seq, env);
      seq = Resolver.resolveValue(['variable', 'list'])(seq);

      try {
         seq.each(function(v) {
            env.store(node.var, Value.wrap(v));
            try {
               this.evalInEnvironment(node.body, env);
            } catch (e) { // cath a next
               if (!(e instanceof Value.ControlFlowException)) { throw e; }
               if (e.type !== 'next') { throw e; }
            }
         }.bind(this));
      } catch (e) { // catch a break
         if (!(e instanceof Value.ControlFlowException)) { throw e; }
         if (e.type !== 'break') { throw e; }
      }

      return Value.makeNull();
   }

   function errorInfo(msg, loc) {
      return Value.makeError({ message: msg, loc: loc });
   }

   // Returns the correct environment for assigning to a given symbol
   //   - if isGlobal === true, looks for the symbol, starting from the
   //     enclosure of `env`; if not found, returns the global environment
   //   - else, returns `env`
   function getEnvironmentForSymbol(id, env, isGlobal) {
      if (!isGlobal) { return env; }
      env = env.getEnclosure().getEnvironmentForSymbol(id);

      return env === null ? this.getGlobalEnv() : env;
   }

   function getGlobalEnv() { return this.global; }

   function pushCall(env) {
      this.callStack.push(env);

      return this;
   }
   function popCall() {
      this.callStack.pop();

      return this;
   }

   // Access the given level of the call stack where 0 is the global
   // environment (bottom of the stack).
   function getCallFrame(which) {
      return this.callStack.getFrame(which);
   }

   function getParent(which) {
      return this.callStack.getParent(which);
   }

   function getParentOfTop() {
      return this.callStack.getParentOfTop();
   }

   function getFrameOfTop() {
      return this.callStack.getFrameOfTop();
   }

   function convertToWhich(n) {
      var which;

      which = this.callStack.length() - n;
      if (which < 0) { which = 0; }

      return which;
   }

   // Searches for the environment based on the value of `x`.
   //  - If `x` is -1, returns the current environment.
   //  - If `x` is an Environment, `x` is returned.
   //  - If `x` is a number or a string, returns the environment
   //    on the search path with that index or name.
   function search(x) {
      var i, currEnv;

      if (x instanceof Environment) { return x; }
      if (x === -1) { return this.getFrameOfTop(); }

      i = 1;
      currEnv = this.getGlobalEnv();
      while (currEnv !== Environment.emptyenv) {
         if (i === x || currEnv.name === x) {
            return currEnv;
         }
         i += 1;
         currEnv = currEnv.getEnclosure();
      }
      throw new Error('did not find the desired environment:' + x);
   }

   return Evaluate;
});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
