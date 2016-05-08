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
      },
      eval: function(str) {
         return (new Evaluate()).parseAndEval(str);
      }
   }

   return panthrLang;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
