(function(define) {
'use strict';
define(function(require) {

   var Value, Base, knownTypes, checkers;

   Value = require('./value');
   Base = require('panthrbase/index');

   knownTypes = {};  // conversions
   checkers = {};

   // TODO: Add standard types and conversions, checkers

   function Resolver() {
      this.parameters = [];
      this.rules = [];
   }

   Resolver.addType = function(type, check) {
      if (!knownTypes.hasOwnProperty(type)) {
         knownTypes[type] = {};
         checkers[type] = check;
      }

      return this;
   };

   Resolver.addConversion = function(from, to, fun) {
      if (!knownTypes.hasOwnProperty(to)) {
         throw new Error('Asked to convert to unknown type: ' + to);
      }
      if (!knownTypes.hasOwnProperty(from)) {
         throw new Error('Asked to convert from unknown type: ' + from);
      }
      if (knownTypes[from].hasOwnProperty(to)) {
         throw new Error('Already know how to convert from ' + from + ' to ' + to);
      }
      knownTypes[from][to] = fun;

      return this;
   }

   Resolver.prototype = {};

   Resolver.prototype.addParameter = function(param, types, required) {
      required = required === true;

      if (typeof types === 'string') {
         types = [types];
      }
      if (typeof types !== 'function') {
         types.forEach(function(type) {
            if (!Resolver.knownTypes.hasOwnProperty(type)) {
               throw new Error('Unknown type: ' + type);
            }
         });
      }
      this.parameters.push({ name: param, types: types, required: required });

      return this;
   };

   Resolver.prototype.addDots = function() {
      this.parameters.push({ name: '...' });
   };

   Resolver.prototype.addDefault = function(param, fun) {
      if (!this.has(param)) {
         throw new Error('Cannot add default for unknown parameter: ' + param);
      }
      this.rules.push({ type: 'default', param: param, fun: fun });
      return this;
   };

   Resolver.prototype.addDependent = function(dependent, parent, fun) {
      if (!this.has(dependent)) {
         throw new Error('Cannot add dependency for unknown parameter: ' + dependent);
      }
      if (!this.has(parent)) {
         throw new Error('Cannot add dependency with unknown parameter: ' + parent);
      }
      this.rules.push({
         type: 'dependency', dependent: dependent, parent: parent, fun: fun
      });
      return this;
   };

   Resolver.prototype.addNormalize = function(fun) {
      this.rules.push({ type: 'normalize', fun: fun });
      return this;
   };

   Resolver.prototype.has = function(param) {
      var i;

      for (i = 0; i < this.params.length; i += 1) {
         if (this.params[i].name === param) {
            return true;
         }
      }
      return false;
   };

   Resolver.prototype.resolve = function(actuals) {
      // TODO
      // BIG TODO
      // LOTS OF STUFF HERE
      return actuals.map(function(v) { return v.value; });
   };

   return Resolver;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
