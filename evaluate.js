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
