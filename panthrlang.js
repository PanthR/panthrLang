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

   var panthrLang, Parser, parser, Node, Evaluate, Expression, Console;

   Node = require('./panthrLang/node');
   Console = require('./panthrLang/console');
   Evaluate = require('./panthrLang/evaluate');
   Expression = require('./panthrLang/expression');
   parser = require('./panthrLang/parser').parser;
   Parser = require('./panthrLang/parser').Parser;
   Parser.prototype.parseError = function parseError(str, hash) {
      function _parseError(msg, hash2) {
         this.message = msg;
         this.hash = hash2;
      }
      if (hash.recoverable) {
         this.myError = { str: str, hash: hash };
         this.trace(str);
      } else {
         _parseError.prototype = Error;

         throw new _parseError(str, hash);
      }
   };

   panthrLang = {
      Node: Node,
      Console: Console,
      Evaluate: Evaluate,
      Expression: Expression,
      parse: function(str, action) {
         if (action == null) { action = function(x) { console.log(x); }; }
         // action is the function to call on each completed node
         parser.yy.emit = function(node) { action(node); };
         return parser.parse(str);
      },
      eval: function(str) {
         var ev;

         ev = new Evaluate();
         ev.initialSetup();

         return ev.parseAndEval(str);
      }
   };

   Evaluate.addPackage('base', require('./packages/base'));
   Evaluate.addPackage('stats', require('./packages/stats'));

   return panthrLang;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
