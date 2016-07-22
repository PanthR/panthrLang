(function(define) {
'use strict';
define(function(require) {

   var Value, Base;

   Value = require('./value');
   Base = require('panthrbase/index');

   function Resolver() {}

   Resolver.prototype = {};

   Resolver.prototype.resolve = function(actuals) {
      return actuals.map(function(v) { return v.value; });
   };

   return Resolver;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
