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
         return Value.make_closure(node, frame);
      case 'expr_seq':
         return eval_seq(node.args[0], frame);
      case 'fun_call':
         return eval_call(evalInFrame(node.args[0], frame),
                          node.args[1].map(function(node) {
                             return evalInFrame(node, frame);
                          }));
      case 'actual':  // TODO: Need to adjust when proper calls in place
         return evalInFrame(node.args[0], frame);
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
      return val;
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
   // TODO: This all should be done cleaner
   function eval_call(clos, actuals) {
      var formals, body, closExtFrame, i, result;
      if (clos.type !== 'closure') {
         throw new Error('trying to call non-closure');
      }
      formals = clos.value.func.args[0];
      body = clos.value.func.args[1];
      if (formals.length !== actuals.length) {
         throw new Error('function called with wrong number of arguments');
      }

      closExtFrame = clos.value.env.extend();
      for (i = 0; i < formals.length; i += 1) {
         closExtFrame.store(formals[i].args[0], actuals[i]);
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
