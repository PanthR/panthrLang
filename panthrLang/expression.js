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
   Expression.prototype.constructor = Expression;

   // Constructor to be used for single symbol expression
   // An "empty" id is used to represent a missing expression
   Expression.Symbol = function Symbol(id) {
      this.id = id;
   };

   Expression.Symbol.prototype = {
      toString: function() {
         // TODO: need backticks on keywords
         return this.id;
      },
      substitute: function(lookup) {
         var match;

         match = lookup(this.id);

         return match == null ? this : match;
      }
   };

   // Constructor to be used for single literal expression.
   // Used for literals such as a number, null, a boolean, or a string.
   Expression.Literal = function Literal(value) {
      this.value = value;
   };

   Expression.Literal.prototype = {
      toString: function() {
         if (Number.isNaN(this.value)) { return 'NA'; }
         if (typeof this.value === 'number') { return String(this.value); }
         if (typeof this.value === 'boolean') { return String(this.value).toUpperCase(); }
         if (this.value === null) { return 'NULL'; }
         if (typeof this.value === 'string') { return JSON.stringify(this.value); }
         throw new Error('Unknown literal expression: ' + this.value);
      },
      substitute: function(lookup) {
         return this;
      }
   };

   // Used for actual `Value`s, such as those set via "substitute".
   Expression.Value = function ExprValue(value) {
      this.value = value;
   };

   Expression.Value.prototype = {
      toString: function() {
         return this.value.toString();
      },
      substitute: function(lookup) {
         return this;
      }
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
      var maker, expr;

      maker = new ExpressionMaker();

      expr = maker.visit(node);
      expr.node = node;

      return expr;
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
         return new Expression.Literal(NaN);
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
      visitFunDef: function(node) {
         return new Expression([
            new Expression.Symbol('function'),
            this.buildFormalParams(node.params),
            this.visit(node.body)
         ]);
      },
      visitFunCall: function(node) {
         var allTerms;

         allTerms = new Expression();
         allTerms.push(this.visit(node.fun));

         return this.buildActualArguments(node.args, allTerms);
      },
      visitBlock: function(node) {
         return this.makeSpecial.bind(this, '{')
            .apply(this, node.exprs);
      },
      visitParens: function(node) {
         return this.makeSpecial('(', node.expr);
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
      buildActualArguments: function(actuals, targetList) {
         var i, processedArg;

         if (typeof targetList === 'undefined') {
            targetList = new Base.List();
         }
         for (i = 0; i < actuals.length; i += 1) {
            processedArg = this.visit(actuals[i]);
            if (processedArg instanceof Expression.Pair) {
               targetList.set(processedArg.name, processedArg.expr);
            } else {
               targetList.push(processedArg);
            }
         }

         return targetList;
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
         return undefined;
      }
   };

   Expression.prototype.toString = function() {
      switch (this.get(1).id) {
      // most binary operators except '+' and -'
      case '*':
      case '/':
      case '^':
      case '%/%':
      case '%%':
      case '>':
      case '<':
      case '>=':
      case '<=':
      case '==':
      case '!=':
      case '&&':
      case '||':
      case '&':
      case '|':
      case '<-':
      case '<<-':
         return this.get(2).toString() +
                ' ' + this.get(1).id + ' ' +
                this.get(3).toString();
      // unary/binary operators
      case '+':
      case '-':
         if (this.length() === 2) {
            return this.get(1).id + this.get(2).toString();
         }
         return this.get(2).toString() +
                ' ' + this.get(1).id + ' ' +
                this.get(3).toString();
      // other unary operators
      case '!':
         return this.get(1).id + this.get(2).toString();
      // parentheses
      case '(':
         return '(' + this.get(2).toString() + ')';
      // range, dollar
      case ':':
      case '$':
         return this.get(2).toString() +
                this.get(1).id +
                this.get(3).toString();
      // control flow
      case 'if':
         if (this.length() === 4) {
            // has an else
            return 'if (' + this.get(2).toString() + ') ' +
                   this.get(3).toString() + ' else ' +
                   this.get(4).toString();
         }
         return 'if (' + this.get(2).toString() + ') ' +
                this.get(3).toString();
      case 'while':
         return 'while (' + this.get(2).toString() + ') ' +
                this.get(3).toString();
      case 'for':
         return 'for (' + this.get(2).toString() + ' in ' +
                this.get(3).toString() + ') ' +
                this.get(4).toString();
      case 'break':
      case 'next':
         return this.get(1).id;
      // block
      case '{':
         // put each inner expression on its own indented line
         return '{\n' +
                this.get().slice(1).map(indent).join('\n') +
                '\n}';
      // indexing
      case '[[':
         return this.get(2).toString() + '[[' + this.get(3).toString() + ']]';
      case '[':
         return this.reduce(function(acc, val, i, name) {
            if (i === 1) { return '['; }
            if (i === 2) { return val.toString() + acc; }
            if (i === 3) { return acc + paramToString(val, name); }

            return acc + ', ' + paramToString(val, name);
         }) + ']';
      // fun def
      case 'function':
         return 'function(' +
                this.get(2).reduce(function(acc, val, i, name) {
                   if (i === 1) { return acc + argToString(name, val); }

                   return acc + ', ' + argToString(name, val);
                }, '') +
                ') ' + this.get(3).toString();
      // default is 'fun_call':
      default:
         return this.reduce(function(acc, val, i, name) {
            if (i === 1) { return val.id + '('; }
            if (i === 2) { return acc + paramToString(val, name); }

            return acc + ', ' + paramToString(val, name);
         }) + ')';
      }
   };

   // Substitute symbols based on a `lookup` function.
   // The lookup function is given a string, and returns either
   // null if the string is not to be replaced, or an expression or
   // Value for replacing the string.
   Expression.prototype.substitute = function(lookup) {
      return this.map(function(v) { return v.substitute(lookup); });
   };

   function indent(expr) {
      return '\t' + expr.toString().replace('\n', function() { return '\n\t'; });
   }

   function paramToString(val, name) {
      if (Base.utils.isMissing(val)) { return ''; }
      if (Base.utils.isMissing(name)) { return val.toString(); }

      return name + ' = ' + val.toString();
   }

   function argToString(name, val) {
      if (typeof val === 'undefined') { return name; }

      return name + ' = ' + val.toString();
   }

   return Expression;
});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
