(function(define) {
'use strict';
define(function(require) {

   var Environment, Value, Base, parser, Resolver, packages;

   Environment = require('./environment');
   Value = require('./value').setEvalInEnvironment(evalInEnvironment);
   Base = require('panthrbase/index');
   parser = require('./parser').parser;
   Resolver = require('./resolver');

   // This is where the external program will "setup" packages bound to names.
   // These do not get loaded at this point, but they can be found later.
   packages = {};

   function Evaluate(enclosure) {
      this.global = Environment.newGlobal(enclosure);
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
         return evalInEnvironment(node, this.global);
      },
      // Parses and evaluates a string in the given Evaluate setup.
      // Returns the array of results.
      parseAndEval: function(str) {
         return parseThenEval(str, this.global);
      }
   };

   // Given a string and an "evaluation environment", parses then
   // evaluates that string in that evaluation environment.
   // Returns the array of results (as well as possibly modifying the environment).
   function parseThenEval(str, env) {
      var vals;

      parser.yy.emit = function(nodes) {
         vals = nodes.map(function(node) {
            try {
               return evalInEnvironment(node, env);
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

      global = env.getGlobal();

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
               newEval.parseAndEval(str);
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
      switch (node.name) {
      case 'number': return Value.makeScalar([node.value]);
      case 'boolean': return Value.makeLogical([node.value]);
      case 'string': return Value.makeString([node.value]);
      case 'missing': return Value.makeLogical(Base.utils.missing);
      case 'null': return Value.makeNull();
      case 'break': throw Value.break(node.loc);
      case 'next': throw Value.next(node.loc);
      case 'range':
         return evalRange(evalInEnvironment(node.from, env),
                          evalInEnvironment(node.to, env),
                          env, node.from.loc);
      case 'variable':
         return lookup(node.id, env, node.loc);
      case 'assign':
         return assign(node.lvalue,
                       evalInEnvironment(node.rvalue, env).clone(),
                       env,
                       false);
      case 'assign_existing':
         return assign(node.lvalue,
                       evalInEnvironment(node.rvalue, env).clone(),
                       env,
                       true);
      case 'dollar_access':
         return evalListAccess(evalInEnvironment(node.object, env),
                               Value.makeString([node.id]),
                               node.loc);
      case 'dbl_bracket_access':
         return evalListAccess(evalInEnvironment(node.object, env),
                               evalInEnvironment(node.index, env),
                               node.loc);
      case 'single_bracket_access':
         return evalArrayAccess(node, env);
      case 'fun_def':
         return evalFunDef(node, env);
      case 'block':
         return evalSeq(node.exprs, env);
      case 'parens':
         return evalInEnvironment(node.expr, env);
      case 'if':
         return evalIf(node, env);
      case 'while':
         return evalWhile(node, env);
      case 'for':
         return evalFor(node, env);
      case 'fun_call':
         return evalCall(evalInEnvironment(node.fun, env),
                         evalActuals(node.args, env), node.fun.loc, env);
      case 'library':
         return loadPackage(node.id, env, node.loc);
      case 'error':
         return errorInfo('unexpected token: ' + node.error.hash.text, node.loc);
      default:
         throw new Error('Unknown node: ' + node.name);
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
   // lvalue is a Node
   // rvalue is a Value
   // isGlobal: true for <<-, false for <-
   function assign(lvalue, rvalue, env, isGlobal) {
      switch (lvalue.name) {
      case 'single_bracket_access':
         evalArrayAssign(lvalue, rvalue, env, isGlobal);
         break;
      case 'dbl_bracket_access':
         evalListAssign(evalInEnvironment(lvalue.object, env.getRelevantEnvironment(isGlobal)),
                        evalInEnvironment(lvalue.index, env),
                        rvalue,
                        lvalue.loc);

         break;
      case 'dollar_access':
         evalListAssign(evalInEnvironment(lvalue.object, env.getRelevantEnvironment(isGlobal)),
                        Value.makeString([lvalue.id]),
                        rvalue,
                        lvalue.loc);

      break;
      case 'fun_call':
         evalFunCallAssign(lvalue, rvalue, env, isGlobal);
         break;
      case 'variable':
         env.getEnvironmentForSymbol(lvalue.id, isGlobal).store(lvalue.id, rvalue);
         break;
      default:
         throw errorInfo('Invalid expression for left-hand-side of assignment', lvalue.loc);
      }
      return rvalue;
   }

   function evalRange(a, b, env, loc) {
      return evalCall(lookup('seq', env), new Base.List({
         from: a, to: b
      }), loc, env);
   }

   function evalSeq(exprs, env) {
      var i, val;

      for (i = 0; i < exprs.length; i += 1) {
         val = evalInEnvironment(exprs[i], env);
      }
      return val;
   }

   // Handles $ access and [[]] access
   // `index` is a variable Value of some sort
   // returns a single component from somewhere in the list
   function evalListAccess(lst, index, loc) {
      try {
         lst = Resolver.resolveValue(['list'])(lst);
         index = Resolver.resolveValue(['scalar', 'string'])(index);
         return Value.wrap(lst.deepGet(index));
      } catch (e) {
         throw errorInfo(e.message || e.toString(), loc);
      }
   }

   function evalListAssign(lst, index, rvalue, loc) {
      try {
         lst = Resolver.resolveValue(['list'])(lst);
         index = Resolver.resolveValue(['scalar', 'string'])(index);
         rvalue = Resolver.resolveValue(['any'])(rvalue);
         lst.deepSet(index, rvalue);
      } catch (e) {
         throw errorInfo(e.message || e.toString(), loc);
      }
   }

   function evalFunCallAssign(lvalue, rvalue, env, isGlobal) {
      var args, funCallResult;

      if (lvalue.args.length !== 1 || lvalue.args[0].name === 'arg_empty') {
         throw errorInfo('Wrong arguments for function call on lhs of assignment', lvalue.loc);
      }
      // 1. change the name of the function.
      if (lvalue.fun.name !== 'variable') {
         throw errorInfo('Wrong function specification on lhs of assignment', lvalue.loc);
      }
      lvalue.fun.id += '<-';
      // 2. EvalActuals the arguments to the function
      args = evalActuals(lvalue.args, env.getRelevantEnvironment(isGlobal));
      // 3. Extend them by "value=rhs"
      args.set('value', rvalue);
      // 4. Call the new function
      funCallResult = evalCall(evalInEnvironment(lvalue.fun, env),
                               args,
                               lvalue.loc,
                               env);
      // 5. Make an assign call, with "x" to the result of 4 (local to lvalueEnvironment)
      assign(lvalue.args[0], funCallResult, env, isGlobal);
   }

   // Handles [] access -- "extract"
   // The node contains the call's object in node.object and
   // the "coordinates" in node.coords.
   // If object is a list, returns a sublist of values
   // If object is a variable, returns a subvariable of values
   // If object is a matrix or an array, the coordinates indicate the location(s)
   //    from which the result's value is to be obtained.
   function evalArrayAccess(node, env) {
      var actuals, fun;

      // Add object as a named argument in actuals
      // Also make sure it is the first argument
      actuals = new Base.List({ x: evalInEnvironment(node.object, env) });
      actuals.set(evalActuals(node.coords, env));
      fun = lookup('[', env, node.loc);

      return evalCall(fun, actuals, node.loc, env);
   }

   // Handles [] assignment
   function evalArrayAssign(node, rvalue, env, isGlobal) {
      var actuals, fun;

      actuals = new Base.List({
         x: evalInEnvironment(node.object, env.getRelevantEnvironment(isGlobal)),
         value: rvalue
      });
      actuals.set(evalActuals(node.coords, env));
      fun = lookup('[<-', env, node.loc);
      evalCall(fun, actuals, node.loc);
   }

   function evalFunDef(node, env) {
      var formals, i, formal;

      formals = {};

      for (i = 0; i < node.params.length; i += 1) {
         formal = node.params[i].name === 'param_dots' ? '...' : node.params[i].id;
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
         switch (expr.name) {
         case 'arg_named':
            addNamedValue(expr.id, Value.makeDelayed(expr.value, env), expr.loc);
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
            }(lookup('...', env, expr.loc)));
            break;
         case 'arg_empty':
            addValue(Value.makeUndefined());
            break;
         default:
            addValue(Value.makeDelayed(expr, env));
         }
      });

      return actuals;
   }

   // "actuals" will be a Base.List
   function evalCall(clos, actuals, loc, env) {
      if (clos.type === 'closure' || clos.type === 'builtin') {
         try {
            return Value.functionFromValue(clos)(actuals, env);
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

      testResult = evalInEnvironment(node.test, env);
      testResult = Resolver.resolveValue(['boolean'])(testResult);

      if (testResult) {
         return evalInEnvironment(node.then, env);
      }
      if (typeof node.else !== 'undefined') {
         return evalInEnvironment(node.else, env);
      }
      // No else case
      return Value.makeNull();
   }

   function evalWhile(node, env) {
      var testResult;

      try {
         /* eslint-disable no-constant-condition */
         while (true) {
            testResult = evalInEnvironment(node.test, env);
            testResult = Resolver.resolveValue(['boolean'])(testResult);
            if (!testResult) { break; }
            evalInEnvironment(node.body, env);
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

      seq = evalInEnvironment(node.seq, env);
      seq = Resolver.resolveValue(['variable', 'list'])(seq);

      try {
         seq.each(function(v) {
            env.store(node.var, Value.wrap(v));
            try {
               evalInEnvironment(node.body, env);
            } catch (e) { // cath a next
               if (!(e instanceof Value.ControlFlowException)) { throw e; }
               if (e.type !== 'next') { throw e; }
            }
         });
      } catch (e) { // catch a break
         if (!(e instanceof Value.ControlFlowException)) { throw e; }
         if (e.type !== 'break') { throw e; }
      }

      return Value.makeNull();
   }

   function errorInfo(msg, loc) {
      return Value.makeError({ message: msg, loc: loc });
   }

   return Evaluate;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
