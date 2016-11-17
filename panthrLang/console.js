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
         this.evaluator.parseAndEval('library(base); library(stats)');

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
         var that;

         that = this;

         return results.map(function(v) {
            var o;

            o = { type: v.type };
            switch (v.type) {
               case 'builtin':
                  o.string = '<func: builtin>';
                  break;
               case 'closure':
                  o.string = '<func: closure>';
                  break;
               case 'null':
                  o.string = 'NULL';
                  break;
               case 'undefined':
                  o.string = 'TODO Should print error here';
                  break;
               case 'error':
                  o.string = v.value.message;
                  break;
               case 'pack':
                  o.string = '<package: ' + v.value.package.name + '>';
                  break;
               case 'logical':
               case 'scalar':
               case 'factor':
               case 'string':
               case 'datetime':
                  o.html = '<table>' + v.value.format(that.options).toHTML(that.options) +
                             '</table>';
                  break;
            }

            return o;
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
