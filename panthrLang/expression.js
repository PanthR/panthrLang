(function(define) {
'use strict';
define(function(require) {

   var Base;

   Base = require('panthrbase/index');

   /**
    * This is a subclass of Base.List used solely so that lists that are meant to be
    * expressions can be distinguised from normal lists in Value.
    *
    * See panthrBase Lists for the possible forms of values
    *
    * Expressions are produced from nodes via `Expression.maker`.
    */
   function Expression(values) {
      Base.List.apply(this, arguments);
   }

   Expression.prototype = Object.create(Base.List.prototype);

   // Constructor to be used for single symbol expression
   // An "empty" id is used to represent a missing expression
   Expression.Symbol = function Symbol(id) {
      this.id = id;
   };

   // Constructor to be used for single literal expression.
   // Used for literals such as a number, null, a boolean, or a character.
   Expression.Literal = function Literal(value) {
      this.value = value;
   };

   // A pair of a string `name` and an Expression `expr`
   Expression.Pair = function Pair(name, expr) {
      this.name = name;
      this.expr = expr;
   };

   /*
    * Visits the `node` and produces an "expression"-like result. This could be:
    * - A literal (number, boolean, string)
    * - An `Expression.Symbol`, used to represent variable nodes
    * - undefined for missing values
    * - An `Expression` object, which is an underlying `Base.List`, that represents
    *   the syntactic expression that the node represents. The result varies with
    *   the node:
    *     - control flow constructs like if, while, for, are represented with the
    *       keyword as the first element, followed by one entry for each remaining
    *       element.
    *     - Function calls contain the function element as the first list entry
    *       followed by one entry per argument. Named arguments give rise to named
    *       list entries.
    *     - Function definitions contain the keyword "function" as the first element.
    *       The second element is a `Base.List` with one entry for each formal parameter.
    *       The formal arguments become the names of the list entries. Dots becomes '...'.
    *       Default values for arguments are the values at the corresponding list entry.
    *       All other entries have value `undefined`.
    *       The third element of the expression is the expression corresponding to
    *       the body node.
    *     - Range, assignments and bracket indexing are treated as functions.
    */
   Expression.maker = function(node) {
      var maker;

      maker = new ExpressionMaker();

      return maker.visit(node);
   };

   // Used for the prototype
   function ExpressionMaker() {}

   ExpressionMaker.prototype = {
      visit: function(node) {
         return node.accept(this);
      },
      // Creates an expression with first item the `symbol`
      // and subsequent items from visits to remaining passed arguments
      makeSpecial: function(symbol) {
         var i, processedEntries, otherTerms;

         processedEntries = [new Expression.Symbol(symbol)];
         otherTerms = Array.prototype.slice.call(arguments, 1);
         for (i = 0; i < otherTerms.length; i += 1) {
            processedEntries[i + 1] = this.visit(otherTerms[i]);
         }

         return new Expression(processedEntries);
      },
      // Specific visit methods
      visitNumber: function(node) {
         return new Expression.Literal(node.value);
      },
      visitBoolean: function(node) {
         return new Expression.Literal(node.value);
      },
      visitString: function(node) {
         return new Expression.Literal(node.value);
      },
      visitMissing: function(node) {
         return undefined;
      },
      visitNull: function(node) {
         return new Expression.Literal(null);
      },
      visitBreak: function(node) {
         return this.makeSpecial('break');
      },
      visitNext: function(node) {
         return this.makeSpecial('next');
      },
      visitRange: function(node) {
         return this.makeSpecial(':', node.from, node.to);
      },
      visitVariable: function(node) {
         return new Expression.Symbol(node.id);
      },
      visitAssign: function(node) {
         // Both <- and = assignments become the same expression
         return this.makeSpecial('<-', node.lvalue, node.rvalue);
      },
      visitAssignExisting: function(node) {
         return this.makeSpecial('<<-', node.lvalue, node.rvalue);

      },
      visitDblBracketAccess: function(node) {
         return this.makeSpecial('[[', node.object, node.index);
      },
      visitSingleBracketAccess: function(node) {
         // Need to pass the coords as separate arguments, not an array
         return this.makeSpecial.bind(this, '[', node.object)
            .apply(this, node.coords);
      },
      visitFunDef: function(node) {
         return new Expression([
            new Expression.Symbol('function'),
            this.buildFormalParams(node.params),
            this.visit(node.body)
         ]);
      },
      visitFunCall: function(node) {
         var i, processedArg, allTerms;

         allTerms = new Expression();
         allTerms.push(this.visit(node.fun));

         for (i = 0; i < node.args.length; i += 1) {
            processedArg = this.visit(node.args[i]);
            if (processedArg instanceof Expression.Pair) {
               allTerms.set(processedArg.name, processedArg.expr);
            } else {
               allTerms.push(processedArg);
            }
         }

         return allTerms;
      },
      visitBlock: function(node) {
         return this.makeSpecial.bind(this, '{')
            .apply(this, node.exprs);
      },
      visitIf: function(node) {
         if (typeof node.else === 'undefined') {
            return this.makeSpecial('if', node.test, node.then);
         }

         return this.makeSpecial('if', node.test, node.then, node.else);
      },
      visitWhile: function(node) {
         return this.makeSpecial('while', node.test, node.body);
      },
      visitFor: function(node) {
         return new Expression([
            new Expression.Symbol('for'),
            new Expression.Symbol(node.var),
            this.visit(node.seq),
            this.visit(node.body)
         ]);
      },
      visitLibrary: function(node) {
         return new Expression([
            new Expression.Symbol('for'),
            new Expression.Symbol(node.id)
         ]);
      },
      visitError: function(node) {
         throw node.error;
      },
      // Handles the formal parameter list in a function definition
      buildFormalParams: function(params) {
         var i, exprPair, resultList;

         resultList = new Base.List();
         for (i = 0; i < params.length; i += 1) {
            exprPair = this.visit(params[i]);
            resultList.set(exprPair.name, exprPair.expr);
         }

         return resultList;
      },
      visitParam: function(node) {
         return new Expression.Pair(node.id, undefined);
      },
      visitParamDefault: function(node) {
         return new Expression.Pair(node.id, this.visit(node.default));
      },
      visitParamDots: function(node) {
         return new Expression.Pair('...', undefined);
      },
      visitArgNamed: function(node) {
         return new Expression.Pair(node.id, this.visit(node.value));
      },
      visitArgDots: function(node) {
         return new Expression.Symbol('...');
      },
      visitArgEmpty: function(node) {
         return this.visitMissing(node);
      }
   };

   return Expression;
});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
