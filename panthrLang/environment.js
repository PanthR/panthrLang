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

   // Call stack. Only stores the environments of the currently-pending calls
   Environment.callStack = [];
   Environment.pushCall = function pushCall(env) {
      Environment.callStack.push(env);

      return Environment;
   };
   Environment.popCall = function popCall() {
      Environment.callStack.pop();

      return Environment;
   };
   // Access the n-th level of the call stack, where 1 means the current.
   Environment.getCallFrame = function(n) {
      var index; // correct index into the call stack

      index = Environment.callStack.length - 1 - n;
      if (index < 0) { index = 0; }

      return Environment.callStack[index];
   };

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

         return this.getEnclosure().lookup(symbol);
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

         if (this.isGlobal || !isGlobal) { return this; }

         currEnvironment = this.getEnclosure();
         while (!currEnvironment.hasOwnSymbol(symbol) &&
                !currEnvironment.isGlobal) {
            currEnvironment = currEnvironment.getEnclosure();
         }

         return currEnvironment;
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
      },
      // Returns the 'global' environment corresponding to the environment, by following
      // enclosure pointers
      getGlobal: function() {
         if (this.isGlobal) { return this; }

         return this.getEnclosure().getGlobal();
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
   Object.freeze(Environment.emptyenv);

   return Environment;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
