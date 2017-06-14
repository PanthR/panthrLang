(function(define) {
'use strict';
define(function(require) {
   var nameMethodLookup;

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
      this.loc = loc.hasOwnProperty('firstLine') ? loc : {
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

   Node.string = function makeString(loc, s) {
      s = s.replace(/\\(.)/g, function(m, c) {
         switch (c) {
         case 't': return '\t';
         case 'n': return '\n';
         case 'r': return '\r';
         default: return c;
         }
      });

      return new Node('string', loc, { value: s });
   };

   Node.boolean = function makeBoolean(loc, b) {
      return new Node('boolean', loc, { value: b });
   };

   Node.if = function makeIf(loc, test, thenExpr, elseExpr) {
      return new Node('if', loc, { test: test, then: thenExpr, else: elseExpr });
   };

   Node.while = function makeWhile(loc, test, body) {
      return new Node('while', loc, { test: test, body: body });
   };

   Node.for = function makeFor(loc, v, seq, body) {
      return new Node('for', loc, { var: v, seq: seq, body: body });
   };

   Node.break = function makeBreak(loc) {
      return new Node('break', loc);
   };

   Node.next = function makeNext(loc) {
      return new Node('next', loc);
   };

   Node.missing = function makeMissing(loc) {
      return new Node('missing', loc);
   };

   Node.null = function makeNull(loc) {
      return new Node('null', loc);
   };

   Node.variable = function makeVariable(loc, id) {
      return new Node('variable', loc, { id: id });
   };

   Node.dollarAccess = function makeDollarAccess(loc, object, id) {
      return Node.funCall(
         loc,
         Node.variable(loc, '$'),
         [object, id]
      );
   };

   Node.dblBracketAccess = function makeDblBracketAccess(loc, object, index) {
      var actuals;

      actuals = [object];
      if (typeof index !== 'undefined') { actuals.push(index); }

      return Node.funCall(loc, Node.variable(loc, '[['), actuals);
   };

   Node.singleBracketAccess = function singleBracketAccess(loc, object, coords) {
      coords.unshift(object);

      return Node.funCall(loc, Node.variable(loc, '['), coords);
   };

   Node.funCall = function makeFunCall(loc, f, args) {
      if (typeof f === 'string') {
         f = Node.variable(loc, f);
      }
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

   Node.parens = function makeParens(loc, expr) {
      return new Node('parens', loc, { expr: expr });
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

   Node.argEmpty = function makeArgEmpty(loc) {
      return new Node('arg_empty', loc);
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

   /*
    * Lookup table for node-name ---> visitor-method correspondence
    */
   /* eslint-disable quote-props */
   nameMethodLookup = {
      'number': 'visitNumber',
      'boolean': 'visitBoolean',
      'string': 'visitString',
      'missing': 'visitMissing',
      'null': 'visitNull',
      'break': 'visitBreak',
      'next': 'visitNext',
      'range': 'visitRange',
      'variable': 'visitVariable',
      'assign': 'visitAssign',
      'assign_existing': 'visitAssignExisting',
      'fun_def': 'visitFunDef',
      'fun_call': 'visitFunCall',
      'block': 'visitBlock',
      'parens': 'visitParens',
      'if': 'visitIf',
      'while': 'visitWhile',
      'for': 'visitFor',
      'param': 'visitParam',
      'param_default': 'visitParamDefault',
      'param_dots': 'visitParamDots',
      'arg_named': 'visitArgNamed',
      'arg_empty': 'visitArgEmpty',
      'arg_dots': 'visitArgDots',
      'library': 'visitLibrary',
      'error': 'visitError'
   /* eslint-enable quote-props */
   };

   Node.prototype = {
      /*
       * Visitor pattern.
       */
      accept: function(visitor) {
         var methodName;

         if (!nameMethodLookup.hasOwnProperty(this.name)) {
            throw new Error('No known method for node type: ' + this.name);
         }
         methodName = nameMethodLookup[this.name];

         if (typeof visitor[methodName] !== 'function') {
            throw new Error('Visitors must implement: ' + methodName);
         }

         return visitor[methodName](this);
      },
      // Transforms an "assign" or "assign_existing" into a "proper" form
      // where the lhs is simply x and the rhs contains the various function calls
      // and indexing that was on the lhs before.
      transformAssign: function transformAssign() {
         var oldLhs, newLhs, newArgs, newRhs;

         oldLhs = this.lvalue;

         switch (oldLhs.name) {
         case 'fun_call':
            if (oldLhs.fun.name !== 'variable') {
               throw new Error('Wrong function specification on oldLhs of assignment');
            }

            newLhs = oldLhs.args[0];
            // Need to call the function with "<-" appended on an
            // argument list expanded to include the rhs.
            newArgs = oldLhs.args.slice();
            newArgs.push(Node.argNamed(this.loc, 'value', this.rvalue));

            newRhs = Node.funCall(this.loc,
               Node.variable(this.loc, oldLhs.fun.id + '<-'),
               newArgs
            );

            return new Node(this.name, this.loc, { lvalue: newLhs, rvalue: newRhs })
                     .transformAssign();
         case 'variable':
            return this;
         default:
            throw new Error('Should not have to handle a lhs: ' + this.lvalue.name);
         }
      }
   };

   return Node;

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
