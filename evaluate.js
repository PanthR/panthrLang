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
            case 'var':
               return do_lookup(store, node.args[0]);
            case 'assign':
               return do_assign(store, node.args[0], _run(node.args[1]));
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

   function do_assign(store, lvalue, v) {
      var name;

      name = lvalue.args[0];
      store[name] = v;

      return v;
   }

   function do_lookup(store, s) {
      if (!(store.hasOwnProperty(s))) {
         throw new Error("Unknown property: ", s);
      }
      return store[s];
   }

   return Evaluate;


});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
