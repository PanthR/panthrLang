(function(define) {
'use strict';
define(function(require) {

   var global = {}; // "global" frame

   function Evaluate() {
      this.reset();
      // Users overwrite this
      this.emit = function(value, node) {};
   }

   Evaluate.prototype = {
      reset: function() {
         this.frames = [global, {}];
      },
      run: function(node) {
         var frames, val;

         frames = this.frames;

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
               return do_lookup(frames, node.args[0]);
            case 'assign':
               return do_assign(frames, node.args[0], _run(node.args[1]));
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

   function do_assign(frames, lvalue, v) {
      var name;

      name = lvalue.args[0];
      frames[frames.length - 1][name] = v;

      return v;
   }

   function do_lookup(frames, s) {
      if (!(frames[frames.length - 1].hasOwnProperty(s))) {
         throw new Error("Unknown property: ", s);
      }
      return frames[frames.length - 1][s];
   }

   return Evaluate;


});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
