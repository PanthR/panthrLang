(function(define) {
'use strict';
define(function(require) {

   /**
    * Simple AST structure for PanthrLang.
    *
    * Each node consists of a name and a (possibly empty) list of arguments.
    *
    * Never call this directly. Use make_node instead.
    */
   function Node(name, args) {
      this.name = name;
      this.args = args;
   }

   /* Takes arbitrary many arguments */
   Node.make_node = function make_node(name) {
      return new Node(name, Array.prototype.slice.call(arguments, 1));
   }

      /**
       * Recurses a function over a node structure.
       *
       * For a given node, it first recurses on all
       * arguments that are themselves nodes, creating an
       * array of the results. It then calls `f` with first argument
       * the node's name, followed by the array of arguments
       * as further arguments (i.e. using Function.prototype.apply)
       */
   Node.recurse = function recurse(f) {
      var func;

      func = function(o) {
         var evaledArgs;
         if (!(o instanceof Node)) { return o; }
         evaledArgs = o.args.map(func);
         evaledArgs.unshift(o.name);
         return f.apply(null, evaledArgs);
      };

      return func;
   };

   Node.evaluate = Node.recurse(function(name, arg1, arg2, arg3) {
      switch (name) {
      case 'number': return arg1;
      case 'range': return arg1; // FIXME
      case 'arithop':
         switch (arg1) {
            case '+': return arg2 + arg3;
            case '-': return arg2 - arg3;
            case '*': return arg2 * arg3;
            case '/': return arg2 / arg3;
         }
      default:
         throw new Error('Unknown node: ' + name);
      }
   });

   Node.prototype = {
      evaluate: function() {
         return Node.evaluate(this);
      }
   }

   return Node;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
