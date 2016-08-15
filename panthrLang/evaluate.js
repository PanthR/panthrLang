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
         throw errorInfo('Unknown package ' + packageName, loc);
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
               assign(name, Value.makeBuiltin(f, resolver), newEval.global);
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

      return Value.makePackage(newEval);
   }

   // "runs" a certain node to completion.
   // Emits the resulting value
   /* eslint-disable complexity */
   function evalInFrame(node, frame) {
      switch (node.name) {
      case 'number': return Value.makeScalar(node.value);
      case 'boolean': return Value.makeLogical(node.value);
      case 'missing': return Value.makeLogical(Base.utils.missing);
      case 'range':
         return evalRange(evalInFrame(node.from, frame),
                          evalInFrame(node.to, frame),
                          frame, node.from.loc);
      case 'variable':
         return lookup(node.id, frame, node.loc);
      case 'assign':
         return assign(node.lvalue.id,
                       evalInFrame(node.rvalue, frame),
                       frame);
      case 'assign_existing':
         return assignExisting(node.lvalue.id,
                              evalInFrame(node.rvalue, frame),
                              frame);
      case 'fun_def':
         return evalFunDef(node, frame);
      case 'block':
         return evalSeq(node.exprs, frame);
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
         throw errorInfo('Unknown symbol ' + symbol, loc);
      }
      return val.resolve();
   }
   // Assigns value in the current frame (possibly shadowing existing value)
   function assign(symbol, value, frame) {
      frame.store(symbol, value);

      return value;
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
   // If it is present (it would have a value from the current function call).
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
            throw errorInfo(e.message || e.toString(), loc);
         }
      }
      throw errorInfo('trying to call non-function ' + clos.toString(), loc);
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
