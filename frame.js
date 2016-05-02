(function(define) {
'use strict';
define(function(require) {

   // TODO comment
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
