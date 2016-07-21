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
         firstLine: loc.first_line,
         lastLine: loc.last_line,
         firstColumn: loc.first_column,
         lastColumn: loc.last_column
      };
      this.args = args;
   }

   /* Takes arbitrary many arguments */
   Node.makeNode = function makeNode(name, loc) {
      return new Node(name, loc, Array.prototype.slice.call(arguments, 2));
   };

   return Node;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
