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

   var panthrLang, Parser, parser, Node, Evaluate;

   Node = require('./node');
   Evaluate = require('./evaluate');
   parser = require('./parser').parser;
   Parser = require('./parser').Parser;
   Parser.prototype.parseError = function parseError(str, hash) {
       if (hash.recoverable) {
         this.myError = { str: str, hash: hash };
         this.trace(str);
       } else {
           function _parseError (msg, hash) {
               this.message = msg;
               this.hash = hash;
           }
           _parseError.prototype = Error;

           throw new _parseError(str, hash);
       }
   };

   panthrLang = {
      Node: Node,
      Evaluate: Evaluate,
      parse: function(str, action) {
         if (action == null) { action = function(x) { console.log(x); }; }
         // action is the function to call on each completed node
         parser.yy.emit = function(node) { action(node); };
         return parser.parse(str);
      },
      eval: function(str) {
         var ev = new Evaluate();

         ev.parseAndEval('library(base)');

         return ev.parseAndEval(str);
      }
   };

   Evaluate.addPackage('base', require('./packages/base'));

   return panthrLang;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
