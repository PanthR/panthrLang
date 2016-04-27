(function(define) {
'use strict';
define(function(require) {

   function Evaluate() {
      this.store = {};
      // Users overwrite this
      this.emit = function(value, node) {};
   }

   Evaluate.prototype = {
      reset: function() {
         this.store = {};
      },
      run: function(node) {
         var store, val;

         store = this.store;

         val = _run(node);
         this.emit(val);

         return val;

         function _run(node) {
            switch (node.name) {
            case 'number': return node.args[0];
            case 'range': return _run(node.args[0]); // FIXME
            case 'arithop':
               return do_arith(node.args[0],
                               _run(node.args[1]),
                               _run(node.args[2]));
            default:
               throw new Error('Unknown node: ' + name);
            }
         }

      }
   };

   function do_arith(op, v1, v2) {
      switch (op) {
         case '+': return v1 + v2;
         case '-': return v1 - v2;
         case '*': return v1 * v2;
         case '/': return v1 / v2;
      }
   }

   return Evaluate;


});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
