(function(define) {
'use strict';
define(function(require) {

   var Frame, Value;

   Frame = require('./frame');
   Value = require('./value');

   function Evaluate() {
      this.global = Frame.newGlobal();
   }

   Evaluate.prototype = {
      eval: function(node) {
         return evalInFrame(node, this.global);
      }
   };

   // "runs" a certain node to completion.
   // Emits the resulting value
   function evalInFrame(node, frame) {
      switch (node.name) {
      case 'number': return Value.make_numeric(node.args[0]);
      case 'range': return evalInFrame(node.args[0], frames); // FIXME
      case 'arithop':
         return do_arith(node.args[0],
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
         return Value.make_closure(node, frame);
      case 'expr_seq':
         return eval_seq(node.args[0], frame);
      case 'fun_call':
         return eval_call(evalInFrame(node.args[0], frame),
                          eval_actuals(node.args[1], frame));
      default:
         throw new Error('Unknown node: ' + node.name);
      }
   }

   function lookup(symbol, frame) {
      var val;

      val = frame.lookup(symbol);
      if (val === null) {
         throw new Error("Unknown property: ", symbol);
      }
      if (Array.isArray(val)) { return val; } // Case of "..."
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

   function eval_seq(exprs, frame) {
      var i, val;

      for (i = 0; i < exprs.length; i += 1) {
         val = evalInFrame(exprs[i], frame);
      }
      return val;
   }

   // Evaluates the actuals represented by the array of exprs
   // in the current frame. It also takes care to properly transform "..."
   // If it is present (it would have a value from the current function call).
   function eval_actuals(exprs, frame) {
      var actuals, symbols;

      symbols = {}; // Used to make sure the same symbol is not provided twice.
      actuals = [];

      exprs.forEach(function(expr) {
         switch (expr.name) {
         case 'actual':
            actuals.push({ value: evalInFrame(expr.args[0], frame) });
            break;
         case 'actual_named':
            if (symbols.hasOwnProperty(expr.args[0])) {
               throw new Error('symbol occurred twice');
            }
            symbols[expr.args[0]] = evalInFrame(expr.args[1], frame);
            actuals.push({ name: expr.args[0],
                           value: symbols[expr.args[0]] });
            break;
         case 'actual_dots':
            // Need to look for a defined dots in the immediate environment
            actuals = actuals.concat(lookup('...', frame));
            break; // TODO
         default:
            throw new Error('actual expected, but got' + expr.type);
         }
      });

      return actuals;
   }

   // "actuals" will be an array of objects.
   // Each object has a property "value" corresponding to the value of that
   // actual, and also possibly a property "name" if it was a named parameter.
   function eval_call(clos, actuals) {
      var formals, body, closExtFrame, i, result, actualPos;
      if (clos.type !== 'closure') {
         throw new Error('trying to call non-closure');
      }
      // Will be messing with the array of formals, so need to copy it
      formals = clos.value.func.args[0].slice();
      body = clos.value.func.args[1];
      closExtFrame = clos.value.env.extend();

      // Go through actuals, see if they are named and match a formal
      // Compares the i-th element in the actuals list to the j-th element
      // in the formals list. It adjusts the arrays if necessary.
      function matchNamed(i, j) {
         if (i >= actuals.length) { return; }
         if (!actuals[i].hasOwnProperty('name')) { return matchNamed(i + 1, 0); }
         if (j >= formals.length) { return matchNamed(i + 1, 0); }
         if ((formals[j].name === 'arg' ||
              formals[j].name === 'arg_default') &&
             formals[j].args[0] === actuals[i].name) {
            // found match
            closExtFrame.store(formals[j].args[0], actuals[i].value);
            formals.splice(j, 1);
            actuals.splice(i, 1);
            // i-th spot now contains the next entry
            return matchNamed(i, 0);
         }
         return matchNamed(i, j + 1);
      }
      matchNamed(0, 0);

      // At this point named arguments have been matched and removed from
      // both lists.
      // Any remaining named actuals may still be absorbed by "...""
      // We match remaining arguments by position skipping named
      // actuals, until we encounter "..."
      // If there is a remaining dots argument, we need to bind it to "..."
      // If there are other remaining arguments they need to be bound to a
      // "missing" value, which if accessed should raise error.
      actualPos = 0; // Holds the place in the actuals that contains the
                     // first nonnamed actual.
      while (formals.length !== 0) {
         while (actualPos < actuals.length &&
                actuals[actualPos].hasOwnProperty('name')) {
            actualPos += 1; // Find first unnamed argument
         }
         if (formals[0].name === 'arg_dots') {
            // Need to eat up all remaining actuals.
            closExtFrame.store('...', actuals);
            actuals = [];
         } else if (actualPos < actuals.length) {
            // There is a value to read
            closExtFrame.store(formals[0].args[0], actuals[actualPos].value);
            actuals.splice(actualPos, 1);
         } else if (formals[0].name === 'arg_default') {
            // Need to evaluate the default value
            // Cannot evaluate right away because it might depend on
            // later defaults. Must create a promise. It will not be
            // executed unless needed.
            closExtFrame.store(
               formals[0].args[0],
               Value.make_promise(
                  evalInFrame.bind(null, formals[0].args[1], closExtFrame)
               )
            );
         } else {
            // Need to set to missing value
            closExtFrame.store(formals[0].args[0], Value.make_missing());
         }
         formals.splice(0, 1);
      }

      return evalInFrame(body, closExtFrame);
   }

   function do_arith(op, v1, v2) {
      if (v1.type !== 'numeric' || v2.type !== 'numeric') {
         throw new Error('operating on non-numeric values');
      }
      switch (op) {
         case '+': return Value.make_numeric(v1.value + v2.value);
         case '-': return Value.make_numeric(v1.value - v2.value);
         case '*': return Value.make_numeric(v1.value * v2.value);
         case '/': return Value.make_numeric(v1.value / v2.value);
      }
   }

   return Evaluate;


});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
