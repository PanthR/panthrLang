(function(define) {
'use strict';
define(function(require) {

   var Evaluate;

   Evaluate = require('./evaluate');

   function Console(options) {
      this.options = options || {};
      this.history = [];
      this.initialize();
   }

   Console.prototype = {
      initialize: function initialize() {
         this.evaluator = new Evaluate();
         this.evaluator.parseAndEval('library(base)');

         return this;
      },
      evalAndUpdate: function evalAndUpdate(input) {
         var results;

         results = this.evaluator.parseAndEval(input);
         this.lastResult = {
            input: this.inputFormat(input),
            results: this.resultsFormat(results)
         };
         this.history.push(this.lastResult);

         return this;
      },
      inputFormat: function inputFormat() {
         // Need to be implemented in each console
         throw new Error('Each console needs to implement "inputFormat"');
      },
      resultsFormat: function resultsFormat() {
         // Need to be implemented in each console
         throw new Error('Each console needs to implement "resultsFormat"');
      }
   };

   /*
    * Console with custom html input/output formatters
    */
   Console.web = function(options) {
      var webConsole;

      webConsole = new Console(options);

      webConsole.inputFormat = function(input) {
         return input;
      };

      webConsole.resultsFormat = function(results) {
         return results.map(function(v) {
            return v.type;
         });
      };

      return webConsole;
   };

   return Console;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
