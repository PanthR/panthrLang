(function(define) {
'use strict';
define(function(require) {

   /*
    * Constructor for an evaluation environment. It contains:
    * - An `enclosure` pointer to its enclosure environment. Variable lookups will traverse
    *     this enclosure chain. The global environment has `null` enclosure.
    * - A `frame` object containing the bindings for the environment. `Environment#store` method
    *     can be used to create bindings.
    * - An `isGlobal` boolean setting determining if the environment is meant to be the global
    *     environment.
    */
   function Environment(enclosure, name) {
      this.enclosure = enclosure;
      this.frame = {};
      if (name == null) { name = ''; }
      this.name = name;
      this.isGlobal = false;
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
      // Looks a symbol up in the current environment.
      //
      // inherits is a boolean determining whether the search will continue
      // to the enclosure.
      //
      // If modeFun is present it must be a predicate function taking as input
      // a resolved value and returning whether that value's type is acceptable.
      // In that case, the first resolved value that passes modeFun is returned.
      // If modeFun is not specified, then the first found match is returned
      // unresolved.
      //
      // In the case of an unsuccessful search, `null` is returned.
      lookup: function lookup(symbol, inherits, modeFun) {
         var value;

         inherits = inherits !== false;  // inherits defaults to true
         if (this.frame.hasOwnProperty(symbol)) {
            value = this.frame[symbol];
            if (typeof modeFun !== 'function') { return value; }
            value = value.resolve();
            if (modeFun(value)) { return value; }
         }
         if (!inherits) { return null; }

         return this.getEnclosure().lookup(symbol, inherits, modeFun);
      },
      // Stores the symbol-value pair in the environment. Returns the environment
      store: function store(symbol, value) {
         this.frame[symbol] = value;

         return this;
      },
      // Stores in the special "builtin" table. Creates it if it does not exist.
      // Will not overwrite existing symbols.
      storeBuiltin: function storeBuiltin(symbol, value) {
         if (!this.hasOwnProperty('builtins')) { this.builtins = {}; }
         if (this.builtins.hasOwnProperty(symbol)) {
            throw new Error('Cannot overwrite builtin: ' + symbol);
         }
         this.builtins[symbol] = value;

         return this;
      },
      // Returns whether the environment itself has a symbol
      hasOwnSymbol: function hasOwnSymbol(symbol) {
         return this.frame.hasOwnProperty(symbol);
      },
      getOwnSymbols: function getOwnSymbols() {
         return Object.keys(this.frame).sort();
      },
      // Searches for an environment containing the symbol, starting from
      // `this` environment.
      getEnvironmentForSymbol: function getEnvironmentForSymbol(symbol) {
         if (this.hasOwnSymbol(symbol)) { return this; }

         return this.getEnclosure().getEnvironmentForSymbol(symbol);
      },
      // returns `this` environment, or `this.enclosure`, whichever is the appropriate
      // evaluation environment for the assignment type (global versus local).
      getRelevantEnvironment: function getRelevantEnvironment(isGlobal) {
         if (this.isGlobal || !isGlobal) { return this; }

         return this.getEnclosure();
      },
      // Returns the environment's enclosure
      getEnclosure: function getEnclosure() { return this.enclosure; },
      setEnclosure: function(newEnclosure) {
         this.enclosure = newEnclosure;

         return this;
      },
      // Search for ancestor with the given name.
      // If none exists, return null
      getNamedAncestor: function(name) {
         if (this.name === name) { return this; }

         return this.getEnclosure().getNamedAncestor(name);
      }
   };

   // Create a new global environment with a given parent.
   // This really should only be called once per package.
   // Not meant to be called except by the internal Evaluate mechanism.
   Environment.newGlobal = function newGlobal(enclosure) {
      var env;

      if (enclosure == null) { enclosure = Environment.emptyenv; }

      env = new Environment(enclosure, '.GlobalEnv');
      env.isGlobal = true;

      return env;
   };

   // 'Ultimate parent'.
   Environment.emptyenv = new Environment(null, '.EmptyEnv');

   Environment.emptyenv.getNamedAncestor = function(name) {
      if (this.name === name) { return this; }

      return null;
   };
   Environment.emptyenv.getEnclosure = function() { return null; };
   Environment.emptyenv.lookup = function(symbol) {
      return null;
   };
   Environment.emptyenv.getEnvironmentForSymbol = Environment.emptyenv.lookup;
   Object.freeze(Environment.emptyenv);

   return Environment;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
