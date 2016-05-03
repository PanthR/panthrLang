(function(define) {
'use strict';
define(function(require) {

   var Frame, Value;

   Frame = require('./frame');
   Value = require('./value');

   function Evaluate() {
      this.reset();
      // Users overwrite this
      this.emit = function(value, node) {};
   }

   Evaluate.prototype = {
      reset: function() {
         this.frame = Frame.newGlobal();
      },
      // "runs" a certain node to completion.
      // Emits the resulting value
      eval: function(node) {
         var val;

         val = this.run(node);
         this.emit(val);

         return val;
      },
      run: function run(node) {
         switch (node.name) {
         case 'number': return Value.make_numeric(node.args[0]);
         case 'range': return this.run(node.args[0]); // FIXME
         case 'arithop':
            return do_arith(node.args[0],
                            this.run(node.args[1]),
                            this.run(node.args[2]));
         case 'var':
            return this.lookup(node.args[0]);
         case 'assign':
            return this.assign(node.args[0].args[0], this.run(node.args[1]));
         case 'fun_def':
            return Value.make_closure(node, this.frame);
         case 'expr_seq':
            return this.eval_seq(node.args[0]);
         case 'fun_call':
            return this.eval_call(this.run(node.args[0]),
                                  node.args[1].map(this.run.bind(this)));
         default:
            throw new Error('Unknown node: ' + node.name);
         }
      },
      lookup: function lookup(symbol) {
         var val;

         val = this.frame.lookup(symbol);
         if (val === null) {
            throw new Error("Unknown property: ", symbol);
         }
         return val;
      },
      assign: function assign(symbol, value) {
         this.frame.store(symbol, value);

         return value;
      },
      eval_seq: function eval_seq(exprs) {
         var i, val;

         for (i = 0; i < exprs.length; i += 1) {
            val = this.run(exprs[i]);
         }
         return val;
      },
      // TODO: This all should be done cleaner
      eval_call: function eval_call(clos, actuals) {
         var formals, body, oldFrame, i, result;
         if (clos.type !== 'closure') {
            throw new Error('trying to call non-closure');
         }
         formals = clos.value.func.args[0];
         body = clos.value.func.args[1];
         if (formals.length !== actuals.length) {
            throw new Error('function called with wrong number of arguments');
         }

         oldFrame = this.frame;
         this.frame = clos.value.env.extend();
         for (i = 0; i < formals.length; i += 1) {
            this.frame.store(formals[i].args[0], actuals[i]);
         }
         result = this.run(body);
         this.frame = oldFrame;

         return result;
      }
   };

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
