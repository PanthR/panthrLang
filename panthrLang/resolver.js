(function(define) {
'use strict';
define(function(require) {

   var Value, Base, missingValue;

   Value = require('./value');
   Base = require('panthrbase/index');

   // Used to indicate a parameter was not matched.
   missingValue = {};

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
   };

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
      if (!Resolver.hasType(to) || !Resolver.hasType(from) ||
          !Resolver.types[from].conversions.hasOwnProperty(to)) {
         return null;
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

   Resolver.prototype.getParam = function(param) {
      var i;

      for (i = 0; i < this.parameters.length; i += 1) {
         if (this.parameters[i].name === param) {
            return this.parameters[i];
         }
      }

      return null;
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

   /* eslint-disable complexity, max-statements */
   /*
    * When this method is called, it is provided an "actuals" list
    * for the function call to be evaluated. This list is then compared to
    * the specifications in the `parameters` property and an initial
    * processing is performed (e.g. vector->number and other conversions).
    * This produces a new list, which is then transformed using the `rules` one
    * at a time in the order in which they were inserted in the array.
    *
    * Returns an object containing two keys:
    * - `processed`: the resulting list of processed actuals values
    * - `dots`: the list of arguments that matched the dots.
    *
    * Caution: This method will change the `actuals` list.
    */
   Resolver.prototype.resolve = function(actuals) {
      var processed, i, j, name, formal, params, dots;

      processed = new Base.List();
      params = this.parameters;
      dots = new Base.List();

      // Find named actuals, match them and remove them
      i = 1;
      while (i < actuals.length()) {
         name = actuals.names(i);
         if (Base.utils.isMissing(name)) {
            i += 1;
         } else {
            if (processed.has(name)) {
               throw new Error('Duplicate parameter name in function call: ' + name);
            }
            formal = this.getParam(name);
            if (formal != null) {
               processed.set(name, this.resolveValue(formal, actuals.get(i)));
               actuals.delete(i);
            } else {
               i += 1;
            }
         }
      }
      // No matching named actuals past this point
      j = 1; // corresponds to next unnamed value
      for (i = 0; i < params.length; i += 1) {
         // Move past named actuals
         while (j <= actuals.length() && !Base.utils.isMissing(actuals.names(j))) {
            j += 1;
         }
         formal = params[i];
         if (formal.name === '...') {
            dots = actuals;
            actuals = new Base.List();
         } else if (j > actuals.length()) {
            processed.set(formal.name, missingValue);
         } else {
            processed.set(formal.name, this.resolveValue(formal, actuals.get(j)));
            actuals.delete(j);
         }
      }
      // At this point, parameters are processed. Any remaining actuals
      // are an error
      if (actuals.length() > 0) {
         throw new Error('Too many arguments passed to function call');
      }
      // Apply rules
      this.rules.forEach(function(rule) {
         switch (rule.type) {
         case 'default':
            if (processed.get(rule.param) === missingValue) {
               processed.set(rule.param, rule.fun(processed));
            }
            break;
         case 'dependency':
            if (processed.get(rule.dependent) === missingValue &&
                processed.get(rule.parent) !== missingValue) {
               processed.set(rule.dependent, rule.fun(processed.get(rule.parent)));
            }
            break;
         case 'normalize':
            rule.fun(processed);
            break;
         default:
            throw new Error('Unknown resolver rule type: ' + rule.type);
         }
      });
      // Check required have been provided
      for (i = 0; i < params.length; i += 1) {
         if (params[i].required && processed.get(params[i].name) === missingValue) {
            throw new Error('Parameter required but not provided: ' + params[i].name);
         }
      }

      return {
         processed: processed,
         dots: dots
      };
   };
   /* eslint-enable complexity, max-statements */

   Resolver.prototype.resolveValue = function(formal, value) {
      var i, j, valueTypes, conversion;

      valueTypes = Resolver.getValueTypes(value);

      for (i = 0; i < formal.types.length; i += 1) {
         if (valueTypes.indexOf(formal.types[i]) !== -1) {
            return Resolver.types[formal.types[i]].unwrap(value);
         }
      }
      for (i = 0; i < formal.types.length; i += 1) {
         for (j = 0; j < valueTypes.length; j += 1) {
            conversion = Resolver.getConversion(formal.types[i], valueTypes[j]);
            if (conversion != null) {
               return conversion(Resolver.types[valueTypes[j]].unwrap(value));
            }
         }
      }
      throw new Error('Conversion error: ' + value + ' could not be converted to any of: ' +
         formal.types.join(', '));
   };

   Resolver.getValueTypes = function(value) {
      return Object.keys(Resolver.types).filter(function(type) {
         return Resolver.types[type].check(value);
      });
   };

   return Resolver;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
