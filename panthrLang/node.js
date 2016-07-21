(function(define) {
'use strict';
define(function(require) {

   /**
    * Simple AST structure for PanthrLang.
    *
    * Each node consists of a name and a (possibly empty) list of arguments.
    *
    * Never call this directly. Use makeNode instead.
    */
   function Node(name, loc, obj) {
      var key;

      this.name = name;
      this.loc = {
         firstLine: loc.first_line,
         lastLine: loc.last_line,
         firstColumn: loc.first_column,
         lastColumn: loc.last_column
      };
      if (obj != null) {
         for (key in obj) {
            if (obj.hasOwnProperty(key)) {
               this[key] = obj[key];
            }
        }
      }
   }

   Node.error = function makeError(loc, err) {
      return new Node('error', loc, { error: err });
   };

   Node.assign = function makeAssign(loc, lvalue, expr) {
      return new Node('assign', loc, { lvalue: lvalue, rvalue: expr });
   };

   Node.assignExisting = function makeAssignExisting(loc, lvalue, expr) {
      return new Node('assign_existing', loc, { lvalue: lvalue, rvalue: expr });
   };

   Node.number = function makeNumber(loc, n) {
      return new Node('number', loc, { value: n });
   };

   Node.boolean = function makeBoolean(loc, b) {
      return new Node('boolean', loc, { value: b });
   };

   Node.variable = function makeVariable(loc, id) {
      return new Node('variable', loc, { id: id });
   };

   Node.funCall = function makeFunCall(loc, f, args) {
      return new Node('fun_call', loc, { fun: f, args: args });
   };

   Node.funDef = function makeFunDef(loc, params, body) {
      return new Node('fun_def', loc, { params: params, body: body });
   };

   Node.range = function makeRange(loc, from, to) {
      return new Node('range', loc, { from: from, to: to });
   };

   Node.block = function makeBlock(loc, exprs) {
      return new Node('block', loc, { exprs: exprs });
   };

   Node.library = function makeLibrary(loc, id) {
      return new Node('library', loc, { id: id });
   };

   Node.argNamed = function makeArgNamed(loc, id, expr) {
      return new Node('arg_named', loc, { id: id, value: expr });
   };

   Node.argDots = function makeArgDots(loc) {
      return new Node('arg_dots', loc);
   };

   Node.param = function makeParam(loc, id) {
      return new Node('param', loc, { id: id });
   };

   Node.paramDefault = function makeParamDefault(loc, id, expr) {
      return new Node('param_default', loc, { id: id, default: expr });
   };

   Node.paramDots = function makeArgDots(loc) {
      return new Node('param_dots', loc);
   };

   return Node;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
