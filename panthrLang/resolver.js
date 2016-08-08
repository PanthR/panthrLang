(function(define) {
'use strict';
define(function(require) {

   var Value, Base, knownTypes, checkers;

   Value = require('./value');
   Base = require('panthrbase/index');

   /*
    * Instantiates a resolver object. The object will then be loaded with
    * parameters and rules using the instance methods.
    *
    * See `Resolver#resolve` for details.
    * When `Resolver#resolve` is called, it is provided an "actuals" list
    * for the function call to be evaluated. This list is then compared to
    * the specifications in the `parameters` property and an initial
    * processing is performed (e.g. vector->number and other conversions).
    * This produces a new list, which is then transformed using the `rules` one
    * at a time in the order in which they were inserted in the array.
    */
   function Resolver() {
      /*
       * Array of the parameter properties (name/allowed types/required)
       */
      this.parameters = [];
      /*
       * Array of default/dependent/normalize rules to be applied to the
       * initially processed actuals list.
       */
      this.rules = [];
   }

   /*
    * Each type object has:
    * - The type's name as the key
    * - A `check` property containing the type's checker predicate
    * - A `unwrap` property containng the type's unwrapper (Value->javascript)
    * - A `conversions` property containing key-value pairs where each
    *     key is a target type and the value is the appropriate conversion function.
    */
   Resolver.types = {};

   // TODO: Add standard types and conversions, checkers


   /*
    * Adds a new type based on the string `type`. The predicate `check`
    * can take any value and must return a boolean indicating if that value is
    * of the given type.
    *
    *
    */
   Resolver.addType = function(type, check, unwrap) {
      if (!Resolver.types.hasOwnProperty(type)) {
         Resolver.types[type] = {
            check: check,
            unwrap: unwrap,
            conversions: {}
         };
      }

      return this;
   };

   Resolver.hasType = function(type) {
      return Resolver.types.hasOwnProperty(type);
   }

   /*
    * Sets up a new type conversion based on `fun`, if one does not already exist.
    * `fun` should expect as input a value of type `from` and return a value of type `to`.
    */
   Resolver.addConversion = function(from, to, fun) {
      if (!Resolver.hasType(to)) {
         throw new Error('Asked to convert to unknown type: ' + to);
      }
      if (!Resolver.hasType(from)) {
         throw new Error('Asked to convert from unknown type: ' + from);
      }
      if (Resolver.types[from].conversions.hasOwnProperty(to)) {
         throw new Error('Already know how to convert from ' + from + ' to ' + to);
      }
      Resolver.types[from].conversions[to] = fun;

      return this;
   };

   Resolver.getConversion = function(from, to) {
      if (!Resolver.hasType(to)) {
         throw new Error('Unknown type: ' + to);
      }
      if (!Resolver.hasType(from)) {
         throw new Error('Unknown type: ' + from);
      }
      if (!Resolver.types[from].conversions.hasOwnProperty(to)) {
         throw new Error('Unknown conversion from ' + from + ' to ' + to);
      }

      return Resolver.types[from].conversions[to];
   };

   Resolver.prototype = {};

   /*
    * Adds a new parameter. `types` may be a string or an array of strings.
    * `required` is a boolean defaulting to `false`.
    */
   Resolver.prototype.addParameter = function(param, types, required) {
      required = required === true;

      if (typeof types === 'string') {
         types = [types];
      }
      if (typeof types !== 'function') {
         types.forEach(function(type) {
            if (!Resolver.hasType(type)) {
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

   /*
    * The function `fun` takes as input the processed actuals list and needs
    * to return the new value for the parameter.
    */
   Resolver.prototype.addDefault = function(param, fun) {
      if (!this.has(param)) {
         throw new Error('Cannot add default for unknown parameter: ' + param);
      }
      this.rules.push({ type: 'default', param: param, fun: fun });
      return this;
   };

   /*
    * The function `fun` takes as input the value of the `parent`
    * and is meant to return the value for the `dependent`.
    */
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

   /*
    * The function `fun` takes as input the processed actuals list and can make
    * changes to it. Its return value is ignored.
    */
   Resolver.prototype.addNormalize = function(fun) {
      this.rules.push({ type: 'normalize', fun: fun });
      return this;
   };

   /*
    * Determines if a given parameter has already been defined. Used by the other
    * resolver methods to ensure the validity of the specification.
    */
   Resolver.prototype.has = function(param) {
      var i;

      for (i = 0; i < this.params.length; i += 1) {
         if (this.params[i].name === param) {
            return true;
         }
      }
      return false;
   };

   /*
    * When this method is called, it is provided an "actuals" list
    * for the function call to be evaluated. This list is then compared to
    * the specifications in the `parameters` property and an initial
    * processing is performed (e.g. vector->number and other conversions).
    * This produces a new list, which is then transformed using the `rules` one
    * at a time in the order in which they were inserted in the array.
    *
    * Returns the resulting list of processed actuals values.
    */
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
