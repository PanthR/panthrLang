(function(define) {
'use strict';
define(function(require) {

   /**
    * PanthR Language parser
    *
    * @module panthrLang
    * @version 0.0.1
    * @noPrefix
    * @author Haris Skiadas <skiadas@hanover.edu>
    */

   var panthrLang, parser, Node, Evaluate;

   Node = require('./node');
   Evaluate = require('./evaluate');
   parser = require('./parser').parser;

   panthrLang = {
      Node: Node,
      Evaluate: Evaluate,
      parse: function(str, action) {
         if (action == null) { action = function(x) { console.log(x); }}
         // action is the function to call on each completed node
         parser.yy.emit = function(node) { action(node); }
         return parser.parse(str);
      }
   }

   // A quick test

   var ev = new panthrLang.Evaluate();
   var v = panthrLang.parse("x <- 3 + 4\n (x + 2) * 4", function(node) {
      console.log("value: ", ev.run(node));
   });
   console.log(v, ev.frames);

   return panthrLang;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
