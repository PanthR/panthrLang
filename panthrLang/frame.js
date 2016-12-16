(function(define) {
'use strict';
define(function(require) {

   /*
    * Constructor for an evaluation frame/activation record. It contains:
    * - A `parent` pointer to its parent frame. Variable lookups will traverse
    *     this parent chain. The global frame has `null` parent.
    * - A `values` object containing the bindings for the frame. `Frame#store` method
    *     can be used to create bindings.
    */
   function Frame(parent) {
      this.parent = parent;
      this.values = {};
   }

   Frame.prototype = {
      // Extends the frame. If obj is provided, it adds the key-value
      // bindings specified by that object.
      // Returns the new frame.
      extend: function extend(obj) {
         var frame;

         frame = new Frame(this);
         if (obj) {
            Object.keys(obj).forEach(function(symbol) {
               frame.store(symbol, obj[symbol]);
            });
         }

         return frame;
      },
      // Looks a symbol up in the current frame, continuing to its
      // parent if it is not found.
      lookup: function lookup(symbol) {
         if (this.values.hasOwnProperty(symbol)) {
            return this.values[symbol];
         }
         if (this.parent === null) { return null; }

         return this.parent.lookup(symbol);
      },
      // Stores the symbol-value pair in the frame. Returns the frame
      store: function store(symbol, value) {
         this.values[symbol] = value;

         return this;
      },
      // Returns whether the frame itself has a symbol
      hasOwnSymbol: function hasOwnSymbol(symbol) {
         return this.values.hasOwnProperty(symbol);
      },
      // Returns the correct frame for assigning to a given symbol
      // if isGlobal === true, starts looking at the parent frame
      // (or, if current frame is global, uses global frame)
      // otherwise, looks at current frame only
      getFrameForSymbol: function getFrameForSymbol(symbol, isGlobal) {
         var currFrame;

         if (this.parent === null || !isGlobal) { return this; }

         currFrame = this.parent;
         while (!currFrame.hasOwnSymbol(symbol) &&
                currFrame.getParent() !== null) {
            currFrame = currFrame.getParent();
         }

         return currFrame;
      },
      // returns `this` frame, or `this.parent`, whichever is the appropriate
      // evaluation frame for the assignment type (global versus local).
      getRelevantFrame: function getRelevantFrame(isGlobal) {
         if (this.parent === null || !isGlobal) { return this; }

         return this.parent;
      },
      // Returns the frame's parent frame
      getParent: function getParent() { return this.parent; },
      // Returns the "global" frame corresponding to the frame, by following
      // parent pointers
      getGlobal: function() {
         if (this.parent === null) { return this; }

         return this.parent.getGlobal();
      },
      // Looks a symbol up in the global frame.
      // Only useful before storing something in the global frame.
      lookupGlobal: function(symbol) {
         return this.getGlobal().lookup(symbol);
      },
      // Stores the value as corresponding to the symbol, in the global frame.
      storeGlobal: function(symbol, value) {
         this.getGlobal().store(symbol, value);

         return this;
      }
   };

   Frame.newGlobal = function newGlobal() {
      return new Frame(null);
   };

   return Frame;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
