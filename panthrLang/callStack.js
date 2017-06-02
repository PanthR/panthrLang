(function(define) {
'use strict';
define(function(require) {

   function CallStack(globalEnv) {
      this.entries = [new CallStackEntry(globalEnv, globalEnv)];
   }

   function CallStackEntry(dynamicEnv, bodyEnv, fun, call) {
      this.dynamicEnv = dynamicEnv;
      this.bodyEnv = bodyEnv;
      this.fun = fun;
      this.call = call;
   }

   CallStack.prototype = {
      length: function() { return this.entries.length; },
      push: function(dynamicEnv, bodyEnv, fun, call) {
         this.entries.push(new CallStackEntry(dynamicEnv, bodyEnv, fun, call));
      },
      pop: function() {
         this.entries.pop();
      },
      peek: function() {
         return this.entries[this.entries.length - 1];
      },
      // getEntry -- `which` can be any integer
      // which is -1: one below top of stack
      // which is -2: two below top, etc.
      // which is 0: bottom of stack (global env)
      // which is 1: one above bottom of stack, etc.
      // "Non-negative values of `which` are frame numbers whereas negative
      // values are counted back from the frame number of the current evaluation."
      getEntry: function(which) {
         if (which < 0) { which = this.entries.length + which - 1; }
         if (which >= this.entries.length || which < 0) {
            throw new Error('call-stack index out of range');
         }

         return this.entries[which];
      },
      getParent: function(which) {
         return this.getEntry(which).dynamicEnv;
      },
      getParentOfTop: function() {
         return this.peek().dynamicEnv;
      },
      getFrameOfTop: function() {
         return this.peek().bodyEnv;
      },
      getFrame: function(which) {
         return this.getEntry(which).bodyEnv;
      },
      getFun: function(which) {
         return this.getEntry(which).fun;
      },
      getCall: function(which) {
         return this.getEntry(which).call;
      }
   };

   return CallStack;
});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
