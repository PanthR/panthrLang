(function(define) {
'use strict';
define(function(require) {

   /**
    * Simple AST structure for PanthrLang.
    *
    * Each node consists of a name and a (possibly empty) list of arguments.
    *
    * Never call this directly. Use makeNode instead.
    */
   function Node(name, loc, args) {
      this.name = name;
      this.loc = {
         first_line: loc.first_line,
         last_line: loc.last_line,
         first_column: loc.first_column,
         last_column: loc.last_column
      };
      this.args = args;
   }

   /* Takes arbitrary many arguments */
   Node.makeNode = function makeNode(name, loc) {
      return new Node(name, loc, Array.prototype.slice.call(arguments, 2));
   };

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

   return Node;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
