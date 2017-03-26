(function(define) {
'use strict';
define(function(require) {

   /*
    * Constructor for an evaluation environment. It contains:
    * - A `enclosure` pointer to its enclosure environment. Variable lookups will traverse
    *     this enclosure chain. The global environment has `null` enclosure.
    * - A `frame` object containing the bindings for the environment. `Environment#store` method
    *     can be used to create bindings.
    */
   function Environment(enclosure) {
      this.enclosure = enclosure;
      this.frame = {};
   }

   Environment.prototype = {
      // Extends the environment. If obj is provided, it adds the key-value
      // bindings specified by that object.
      // Returns the new environment.
      extend: function extend(obj) {
         var env;

         env = new Environment(this);
         if (obj) {
            Object.keys(obj).forEach(function(symbol) {
               env.store(symbol, obj[symbol]);
            });
         }

         return env;
      },
      // Looks a symbol up in the current environment, continuing to its
      // enclosure if it is not found.
      lookup: function lookup(symbol) {
         if (this.frame.hasOwnProperty(symbol)) {
            return this.frame[symbol];
         }
         if (this.enclosure === null) { return null; }

         return this.enclosure.lookup(symbol);
      },
      // Stores the symbol-value pair in the environment. Returns the environment
      store: function store(symbol, value) {
         this.frame[symbol] = value;

         return this;
      },
      // Returns whether the environment itself has a symbol
      hasOwnSymbol: function hasOwnSymbol(symbol) {
         return this.frame.hasOwnProperty(symbol);
      },
      // Returns the correct environment for assigning to a given symbol
      // if isGlobal === true, starts looking at the enclosure environment
      // (or, if current environment is global, uses global environment)
      // otherwise, looks at current environment only
      getEnvironmentForSymbol: function getEnvironmentForSymbol(symbol, isGlobal) {
         var currEnvironment;

         if (this.enclosure === null || !isGlobal) { return this; }

         currEnvironment = this.enclosure;
         while (!currEnvironment.hasOwnSymbol(symbol) &&
                currEnvironment.getEnclosure() !== null) {
            currEnvironment = currEnvironment.getEnclosure();
         }

         return currEnvironment;
      },
      // returns `this` environment, or `this.enclosure`, whichever is the appropriate
      // evaluation environment for the assignment type (global versus local).
      getRelevantEnvironment: function getRelevantEnvironment(isGlobal) {
         if (this.enclosure === null || !isGlobal) { return this; }

         return this.enclosure;
      },
      // Returns the environment's enclosure
      getEnclosure: function getEnclosure() { return this.enclosure; },
      // Returns the "global" environment corresponding to the environment, by following
      // enclosure pointers
      getGlobal: function() {
         if (this.enclosure === null) { return this; }

         return this.enclosure.getGlobal();
      },
      // Looks a symbol up in the global environment.
      // Only useful before storing something in the global environment.
      lookupGlobal: function(symbol) {
         return this.getGlobal().lookup(symbol);
      },
      // Stores the value as corresponding to the symbol, in the global environment.
      storeGlobal: function(symbol, value) {
         this.getGlobal().store(symbol, value);

         return this;
      }
   };

   Environment.newGlobal = function newGlobal() {
      return new Environment(null);
   };

   return Environment;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
