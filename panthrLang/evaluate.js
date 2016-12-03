(function(define) {
'use strict';
define(function(require) {

   var Frame, Value, Base, parser, Resolver, packages;

   Frame = require('./frame');
   Value = require('./value').setEvalInFrame(evalInFrame);
   Base = require('panthrbase/index');
   parser = require('./parser').parser;
   Resolver = require('./resolver');

   // This is where the external program will "setup" packages bound to names.
   // These do not get loaded at this point, but they can be found later.
   packages = {};

   function Evaluate() {
      this.global = Frame.newGlobal();
      this.global.loadedPackages = null;
   }

   // This function is used to add a package, in the form of a function
   // expecting arguments "evalLang", "addBuiltin", "Value" (see issue #16)
   Evaluate.addPackage = function addPackage(name, func) {
      if (packages.hasOwnProperty(name)) {
         console.log('Warning: A package with name ' + name + ' already exists.' +
            ' The old package will no longer be accessible.');
      }
      packages[name] = func;

      return Evaluate;
   };
   Evaluate.listPackages = function() {
      return Object.keys(packages);
   };

   Evaluate.prototype = {
      eval: function(node) {
         return evalInFrame(node, this.global);
      },
      // Parses and evaluates a string in the given Evaluate setup.
      // Returns the array of results.
      parseAndEval: function(str) {
         return parseThenEval(str, this.global);
      }
   };

   // Given a string and an "evaluation frame", parses then
   // evaluates that string in that evaluation frame.
   // Returns the array of results (as well as possibly modifying the frame).
   function parseThenEval(str, frame) {
      var vals;

      parser.yy.emit = function(nodes) {
         vals = nodes.map(function(node) {
            try {
               return evalInFrame(node, frame);
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

   // Search in the loaded packages starting from "current"
   function findPackage(packageName, current) {
      while (current != null) {
         if (current.name === packageName) {
            return current.package;
         }

         current = current.next;
      }

      return null;
   }

   // Loads a package into the current evaluation.
   // The package will be stored in the loadedPackages property
   // of the global frame corresponding to the current frame.
   function loadPackage(packageName, frame, loc) {
      var global, newEval;

      global = frame.getGlobal();  // The global frame

      if (!packages.hasOwnProperty(packageName)) {
         throw errorInfo('Unknown package: ' + packageName, loc);
      }

      // Search for existing package first
      newEval = findPackage(packageName, global.loadedPackages);
      if (newEval == null) {
         newEval = new Evaluate();  // Eval environment for the package
         // Load the package, adding to the newEval's frame.
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
            Value
         );
         // Now we need to prepend to the global's package list
         global.loadedPackages = {
            name: packageName,
            package: newEval,
            next: global.loadedPackages
         };
      }

      return Value.makePackage(global.loadedPackages);
   }

   // "runs" a certain node to completion.
   // Emits the resulting value
   /* eslint-disable complexity */
   function evalInFrame(node, frame) {
      switch (node.name) {
      case 'number': return Value.makeScalar(node.value);
      case 'boolean': return Value.makeLogical(node.value);
      case 'string': return Value.makeString(node.value);
      case 'missing': return Value.makeLogical(Base.utils.missing);
      case 'null': return Value.makeNull();
      case 'break': throw Value.break(node.loc);
      case 'next': throw Value.next(node.loc);
      case 'range':
         return evalRange(evalInFrame(node.from, frame),
                          evalInFrame(node.to, frame),
                          frame, node.from.loc);
      case 'variable':
         return lookup(node.id, frame, node.loc);
      case 'assign':
         return assign(node.lvalue,
                       evalInFrame(node.rvalue, frame).clone(),
                       frame);
      case 'assign_existing':
         return assignExisting(node.lvalue.id,
                              evalInFrame(node.rvalue, frame).clone(),
                              frame);
      case 'dbl_bracket_access':
         return evalListAccess(evalInFrame(node.object, frame),
                               evalInFrame(node.index, frame),
                               node.loc);
      case 'single_bracket_access':
         return evalArrayAccess(node, frame);
      case 'fun_def':
         return evalFunDef(node, frame);
      case 'block':
         return evalSeq(node.exprs, frame);
      case 'if':
         return evalIf(node, frame);
      case 'while':
         return evalWhile(node, frame);
      case 'for':
         return evalFor(node, frame);
      case 'fun_call':
         return evalCall(evalInFrame(node.fun, frame),
                         evalActuals(node.args, frame), node.fun.loc);
      case 'library':
         return loadPackage(node.id, frame, node.loc);
      case 'error':
         return errorInfo('unexpected token: ' + node.error.hash.text, node.loc);
      default:
         throw new Error('Unknown node: ' + node.name);
      }
   }
   /* eslint-enable complexity */

   function lookup(symbol, frame, loc) {
      var val, pack;

      val = frame.lookup(symbol);
      if (val === null) {
         // Need to look through the package chain
         pack = frame.getGlobal().loadedPackages;
         while (pack !== null) {
            val = pack.package.global.lookup(symbol);
            if (val !== null) { return val; }
            pack = pack.next;
         }
         throw errorInfo('Unknown symbol: ' + symbol, loc);
      }
      try {
         return val.resolve();
      } catch (e) {
         throw errorInfo((e.message || e.toString()) + ' when accessing symbol ' + symbol, loc);
      }
   }

   // Carries out an assignment with a possibly complex lvalue
   // lvalue is a Node
   // rvalue is a Value
   function assign(lvalue, rvalue, frame) {
      switch (lvalue.name) {
      case 'single_bracket_access':
         evalArrayAssign(lvalue, rvalue, frame);
         break;
      case 'dbl_bracket_access':
         evalListAssign(evalInFrame(lvalue.object, frame),
                        evalInFrame(lvalue.index, frame),
                        rvalue,
                        lvalue.loc);

         break;
      case 'fun_call':
         evalFunCallAssign(lvalue, rvalue, frame);
         break;
      case 'variable':
         frame.store(lvalue.id, rvalue);
         break;
      default:
         throw errorInfo('Invalid expression for left-hand-side of assignment', lvalue.loc);
      }
      return rvalue;
   }
   // Assigns value to whichever frame in the inheritance chain the
   // value is defined. If the value is not defined in a previous
   // frame, it will be created as a global value.
   function assignExisting(symbol, value, frame) {
      while (!frame.hasOwnProperty(symbol) &&
             frame.getParent() !== null) {
         frame = frame.getParent();
      }
      frame.store(symbol, value);

      return value;
   }

   function evalRange(a, b, frame, loc) {
      return evalCall(lookup('seq', frame), new Base.List({
         from: a, to: b
      }), loc);
   }

   function evalSeq(exprs, frame) {
      var i, val;

      for (i = 0; i < exprs.length; i += 1) {
         val = evalInFrame(exprs[i], frame);
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

   function evalFunCallAssign(lvalue, rvalue, frame) {
      var args, funCallResult;

      if (lvalue.args.length !== 1) {
         throw errorInfo('Wrong arguments for function call on lhs of assignment', lvalue.loc);
      }
      // 1. change the name of the function.
      if (lvalue.fun.name !== 'variable') {
         throw errorInfo('Wrong function specification on lhs of assignment', lvalue.loc);
      }
      lvalue.fun.id += '<-';
      // 2. EvalActuals the arguments to the function
      args = evalActuals(lvalue.args, frame);
      // 3. Extend them by "value=rhs"
      args.set('value', rvalue);
      // 4. Call the new function
      funCallResult = evalCall(evalInFrame(lvalue.fun, frame),
                               args,
                               lvalue.loc);
      // 5. Make an assign call, with "x" to the result of 4
      assign(lvalue.args[0], funCallResult, frame);
   }

   // Handles [] access -- "extract"
   // The node contains the call's object in node.object and
   // the "coordinates" in node.coords.
   // If object is a list, returns a sublist of values
   // If object is a variable, returns a subvariable of values
   // If object is a matrix or an array, the coordinates indicate the location(s)
   //    from which the result's value is to be obtained.
   function evalArrayAccess(node, frame) {
      var actuals, fun;

      // Add object as a named argument in actuals
      // Also make sure it is the first argument
      actuals = new Base.List({ x: evalInFrame(node.object, frame) });
      actuals.set(evalActuals(node.coords, frame));
      fun = lookup('[', frame, node.loc);

      return evalCall(fun, actuals, node.loc);
   }

   // Handles [] assignment
   function evalArrayAssign(node, rvalue, frame) {
      var actuals, fun;

      actuals = new Base.List({
         x: evalInFrame(node.object, frame),
         value: rvalue
      });
      actuals.set(evalActuals(node.coords, frame));
      fun = lookup('[<-', frame, node.loc);
      evalCall(fun, actuals, node.loc);
   }

   function evalFunDef(node, frame) {
      var formals, i, formal;

      formals = {};

      for (i = 0; i < node.params.length; i += 1) {
         formal = node.params[i].name === 'param_dots' ? '...' : node.params[i].id;
         if (formals.hasOwnProperty(formal)) {
            return errorInfo('repeated formal argument: ' + formal, node.loc);
         }
         formals[formal] = true;
      }

      return Value.makeClosure(node, frame);
   }

   // Evaluates the actuals represented by the array of exprs
   // in the current frame. It also takes care to properly transform "..."
   // if it is present (it would have a value from the current function call).
   function evalActuals(exprs, frame) {
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
            addNamedValue(expr.id, evalInFrame(expr.value, frame), expr.loc);
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
            }(lookup('...', frame, expr.loc)));
            break;
         case 'arg_empty':
            addValue(Value.makeUndefined());
            break;
         default:
            addValue(evalInFrame(expr, frame));
         }
      });

      return actuals;
   }

   // "actuals" will be a Base.List
   function evalCall(clos, actuals, loc) {
      if (clos.type === 'closure' || clos.type === 'builtin') {
         try {
            return Value.functionFromValue(clos)(actuals);
         } catch (e) {
            if (e instanceof Value.ControlFlowException) {
               throw errorInfo(e.message, e.loc);
            }
            throw errorInfo(e.message || e.toString(), loc);
         }
      }
      throw errorInfo('trying to call non-function ' + clos.toString(), loc);
   }

   function evalIf(node, frame) {
      var testResult;

      testResult = evalInFrame(node.test, frame);
      testResult = Resolver.resolveValue(['boolean'])(testResult);

      return evalInFrame(testResult ? node.then : node.else, frame);
   }

   function evalWhile(node, frame) {
      var testResult;

      try {
         /* eslint-disable no-constant-condition */
         while (true) {
            testResult = evalInFrame(node.test, frame);
            testResult = Resolver.resolveValue(['boolean'])(testResult);
            if (!testResult) { break; }
            evalInFrame(node.body, frame);
         }
         /* eslint-enable no-constant-condition */
      } catch (e) {
         if (!(e instanceof Value.ControlFlowException)) { throw e; }
         if (e.type !== 'break') { throw e; }
      }

      return Value.makeNull();
   }

   function evalFor(node, frame) {
      var seq;

      seq = evalInFrame(node.seq, frame);
      seq = Resolver.resolveValue(['variable', 'list'])(seq);

      try {
         seq.each(function(v) {
            frame.store(node.var, Value.wrap(v));
            try {
               evalInFrame(node.body, frame);
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
