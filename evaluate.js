(function(define) {
'use strict';
define(function(require) {

   var Frame, Value, Base, parser, packages;

   Frame = require('./frame');
   Value = require('./value');
   Base = require('panthrBase/index');
   parser = require('./parser').parser;

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
         // TODO: Should do something safer than silently overwriting.
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
            return evalInFrame(node, frame);
         });
      };
      parser.parse(str);

      return vals;
   }

   // Loads a package into the current evaluation.
   // The package will be stored in the loadedPackages property
   // of the global frame corresponding to the current frame.
   function loadPackage(packageName, frame) {
      // TODO: Perhaps we should first search through the list of
      // loaded packages. On the other hand, "reloading" a package
      // may be useful.
      var global, newEval;

      global = frame.getGlobal();  // The global frame
      newEval = new Evaluate();  // Eval environment for the package

      if (!packages.hasOwnProperty(packageName)) {
         throw new Error('Unknown package: ', packageName);
      }
      // Load the package, adding to the newEval's frame.
      packages[packageName](
         function evalLang(str) {
            newEval.parseAndEval(str);
         },
         function addBuiltin(name, f) {
            assign(name, Value.makeBuiltin(f), newEval.global);
         },
         Value
      );
      // Now we need to prepend to the global's package list
      global.loadedPackages = {
         name: packageName,
         package: newEval,
         next: global.loadedPackages
      };

      return Value.makePackage(newEval);
   }

   // "runs" a certain node to completion.
   // Emits the resulting value
   function evalInFrame(node, frame) {
      switch (node.name) {
      case 'number': return Value.makeScalar(node.args[0]);
      case 'range': return evalInFrame(node.args[0], frame); // FIXME
      case 'arithop':
         return doArith(node.args[0],
                        evalInFrame(node.args[1], frame),
                        evalInFrame(node.args[2], frame));
      case 'var':
         return lookup(node.args[0], frame);
      case 'assign':
         return assign(node.args[0].args[0],
                       evalInFrame(node.args[1], frame),
                       frame);
      case 'assign_inherit':
         return assignInherit(node.args[0].args[0],
                              evalInFrame(node.args[1], frame),
                              frame);
      case 'fun_def':
         // TODO: Need to do some checking to ensure argument list
         // is valid
         return Value.makeClosure(node, frame);
      case 'expr_seq':
         return evalSeq(node.args[0], frame);
      case 'fun_call':
         return evalCall(evalInFrame(node.args[0], frame),
                          evalActuals(node.args[1], frame));
      case 'library':
         return loadPackage(node.args[0], frame);
      default:
         throw new Error('Unknown node: ' + node.name);
      }
   }

   function lookup(symbol, frame) {
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
         throw new Error('Unknown property: ', symbol);
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
   // TODO: What about protecting functions like "c"?
   function assignInherit(symbol, value, frame) {
      while (!frame.hasOwnProperty(symbol) &&
             frame.getParent() !== null) {
         frame = frame.getParent();
      }
      frame.store(symbol, value);

      return value;
   }

   function evalSeq(exprs, frame) {
      var i, val;

      for (i = 0; i < exprs.length; i += 1) {
         val = evalInFrame(exprs[i], frame);
      }
      return val;
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

      function addNamedValue(name, value) {
         if (actuals.has(name)) {
            throw new Error('symbol occurred twice');
         }
         actuals.set(name, value);
      }
      exprs.forEach(function(expr) {
         switch (expr.name) {
         case 'actual':
            addValue(evalInFrame(expr.args[0], frame));
            break;
         case 'actual_named':
            addNamedValue(expr.args[0], evalInFrame(expr.args[1], frame));
            break;
         case 'actual_dots':
            // Need to look for a defined dots in the immediate environment
            (function(result) {
               if (result == null) {
                  throw new Error('Inappropriate use of ...');
               }
               result.value.each(function(value, i, name) {
                  if (name) {
                     addNamedValue(name, value);
                  } else {
                     addValue(value);
                  }
               });
            }(lookup('...', frame)));
            break;
         default:
            throw new Error('actual expected, but got' + expr.type);
         }
      });

      return actuals;
   }

   // "actuals" will be a Base.List
   function evalCall(clos, actuals) {
      if (clos.type === 'closure') {
         return evalClosure(clos, actuals);
      } else if (clos.type === 'builtin') {
         return evalBuiltin(clos, actuals);
      }
      throw new Error('trying to call non-function');
   }

   // "Builtin" functions are Javascript functions. They expect one argument
   // that is a "list" in the panthrBase sense.
   // We need here to turn "actuals" into that list.
   function evalBuiltin(builtin, actuals) {
      // Before passing to built-in function, we need to
      // "unvalue" the actuals list.
      return builtin.value.f(actuals.map(function(v) { return v.value; }));
   }

   function evalClosure(clos, actuals) {
      var formals, body, closExtFrame, actualPos;

      // Will be messing with the array of formals, so need to copy it
      formals = clos.value.func.args[0].slice();
      body = clos.value.func.args[1];
      closExtFrame = clos.value.env.extend();

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
         if ((formals[j].name === 'arg' ||
              formals[j].name === 'arg_default') &&
             formals[j].args[0] === name) {
            // found match
            closExtFrame.store(formals[j].args[0], actual);
            formals.splice(j, 1);
            actuals.delete(i);
            // i-th spot now contains the next entry
            return matchNamed(i, 0);
         }
         return matchNamed(i, j + 1);
      }
      matchNamed(1, 0);

      // At this point named arguments have been matched and removed from
      // both lists.
      // Any remaining named actuals may still be absorbed by "...""
      // We match remaining arguments by position skipping named
      // actuals, until we encounter "..."
      // If there is a remaining dots argument, we need to bind it to "..."
      // If there are other remaining arguments they need to be bound to a
      // "missing" value, which if accessed should raise error.
      actualPos = 1; // Holds the place in the actuals that contains the
                     // first nonnamed actual.
      while (formals.length !== 0) {
         while (actualPos <= actuals.length() &&
                actuals.names(actualPos)) {
            actualPos += 1; // Find first unnamed argument
         }
         if (formals[0].name === 'arg_dots') {
            // Need to eat up all remaining actuals.
            closExtFrame.store('...', Value.makeList(actuals));
            actuals = new Base.List();
         } else if (actualPos <= actuals.length()) {
            // There is a value to read
            closExtFrame.store(formals[0].args[0], actuals.get(actualPos));
            actuals.delete(actualPos);
         } else if (formals[0].name === 'arg_default') {
            // Need to evaluate the default value
            // Cannot evaluate right away because it might depend on
            // later defaults. Must create a promise. It will not be
            // executed unless needed.
            closExtFrame.store(
               formals[0].args[0],
               Value.makePromise(
                  evalInFrame.bind(null, formals[0].args[1], closExtFrame)
               )
            );
         } else {
            // Need to set to missing value
            closExtFrame.store(formals[0].args[0], Value.makeMissing());
         }
         formals.splice(0, 1);
      }

      return evalInFrame(body, closExtFrame);
   }

   function doArith(op, v1, v2) {
      if (v1.type !== 'scalar' || v2.type !== 'scalar') {
         throw new Error('operating on non-scalar values');
      }
      switch (op) {
         case '+': return Value.makeScalar(v1.value + v2.value);
         case '-': return Value.makeScalar(v1.value - v2.value);
         case '*': return Value.makeScalar(v1.value * v2.value);
         case '/': return Value.makeScalar(v1.value / v2.value);
         default: throw new Error('Unknown operation:', op);
      }
   }

   return Evaluate;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
