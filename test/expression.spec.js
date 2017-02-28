var main = require('..');
var Base = require('panthrbase/index');
var chai = require('chai');
var expect = chai.expect;
var Expression = require('../panthrlang/expression');

describe('Expression objects', function() {
   describe('can be constructed from panthrLang syntax', function() {
      it('variables becoming symbols', function() {
         main.parse('x', function(nodes) {
            var expr = Expression.maker(nodes[0]);
            expect(expr).to.be.an.instanceof(Expression.Symbol);
            expect(expr.id).to.equal('x');
         });
      });
      it('literals becoming literals', function() {
         main.parse('"x"; 4; TRUE', function(nodes) {
            var expr = Expression.maker(nodes[0]);
            expect(expr).to.equal('x');

            expr = Expression.maker(nodes[1]);
            expect(expr).to.equal(4);

            expr = Expression.maker(nodes[2]);
            expect(expr).to.equal(true);
         });
      });
      it('null expressions becoming null', function() {
         main.parse('NULL', function(nodes) {
            var expr = Expression.maker(nodes[0]);
            expect(expr).to.equal(null);
         });
      });
      it('function calls becoming expression objects', function() {
         main.parse('f(x, 2)', function(nodes) {
            var expr = Expression.maker(nodes[0]);
            expect(expr).to.be.an.instanceof(Expression);
            expect(expr.length()).to.equal(3);
            expect(expr.get(1)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(1).id).to.equal('f');
            expect(expr.get(2)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(2).id).to.equal('x');
            expect(expr.get(3)).to.equal(2);
         });
      });
      it('treating named arguments in function calls properly', function() {
         main.parse('f(x, y=2)', function(nodes) {
            var expr = Expression.maker(nodes[0]);
            expect(expr).to.be.an.instanceof(Expression);
            expect(expr.length()).to.equal(3);
            expect(expr.get(3)).to.equal(2);
            expect(expr.get('y')).to.equal(2);
         });
      });
      it('treating dots in function calls properly', function() {
         main.parse('f(x, ...)', function(nodes) {
            var expr = Expression.maker(nodes[0]);
            expect(expr).to.be.an.instanceof(Expression);
            expect(expr.length()).to.equal(3);
            expect(expr.get(3)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(3).id).to.equal('...');
         });
      });
      it('function definitions becoming appropriate expression objects', function() {
         main.parse('function(x, y) x', function(nodes) {
            var expr = Expression.maker(nodes[0]);
            expect(expr).to.be.an.instanceof(Expression);
            expect(expr.length()).to.equal(3);
            expect(expr.get(1)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(1).id).to.equal('function');
            expect(expr.get(3)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(3).id).to.equal('x');
            expect(expr.get(2)).to.be.an.instanceof(Base.List);
            expect(expr.get(2).length()).to.equal(2);
            expect(expr.get(2).names().toArray()).to.deep.equal(['x', 'y']);
            expect(expr.get(2).get('x')).to.to.equal(undefined);
            expect(expr.get(2).get('y')).to.to.equal(undefined);
         });
      });
      it('treating default values in function definitions properly', function() {
         main.parse('function(x, y=x) x', function(nodes) {
            var expr = Expression.maker(nodes[0]);
            expect(expr).to.be.an.instanceof(Expression);
            expect(expr.length()).to.equal(3);
            expect(expr.get(2)).to.be.an.instanceof(Base.List);
            expect(expr.get(2).length()).to.equal(2);
            expect(expr.get(2).names().toArray()).to.deep.equal(['x', 'y']);
            expect(expr.get(2).get('y')).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(2).get('y').id).to.equal('x');
         });
      });
      it('treating dots in function definitions properly', function() {
         main.parse('function(x, ...) x', function(nodes) {
            var expr = Expression.maker(nodes[0]);
            expect(expr).to.be.an.instanceof(Expression);
            expect(expr.length()).to.equal(3);
            expect(expr.get(2)).to.be.an.instanceof(Base.List);
            expect(expr.get(2).length()).to.equal(2);
            expect(expr.get(2).names().toArray()).to.deep.equal(['x', '...']);
            expect(expr.get(2).get('...')).to.equal(undefined);
         });
      });
      it('"if" expressions becoming appropriate expression objects', function() {
         main.parse('if (x) 3 else 4; if (y) 2', function(nodes) {
            var expr = Expression.maker(nodes[0]);
            expect(expr).to.be.an.instanceof(Expression);
            expect(expr.length()).to.equal(4);
            expect(expr.get(1)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(1).id).to.equal('if');
            expect(expr.get(2)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(2).id).to.equal('x');
            expect(expr.get(3)).to.equal(3);
            expect(expr.get(4)).to.equal(4);

            expr = Expression.maker(nodes[1]);
            expect(expr).to.be.an.instanceof(Expression);
            expect(expr.length()).to.equal(3);
            expect(expr.get(1)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(1).id).to.equal('if');
            expect(expr.get(2)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(2).id).to.equal('y');
            expect(expr.get(3)).to.equal(2);
         });
      });
      it('"while" expressions becoming appropriate expression objects', function() {
         main.parse('while (x) y', function(nodes) {
            var expr = Expression.maker(nodes[0]);
            expect(expr).to.be.an.instanceof(Expression);
            expect(expr.length()).to.equal(3);
            expect(expr.get(1)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(1).id).to.equal('while');
            expect(expr.get(2)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(2).id).to.equal('x');
            expect(expr.get(3)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(3).id).to.equal('y');
         });
      });
      it('"for" expressions becoming appropriate expression objects', function() {
         main.parse('for (x in 4) y', function(nodes) {
            var expr = Expression.maker(nodes[0]);
            expect(expr).to.be.an.instanceof(Expression);
            expect(expr.length()).to.equal(4);
            expect(expr.get(1)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(1).id).to.equal('for');
            expect(expr.get(2)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(2).id).to.equal('x');
            expect(expr.get(3)).to.equal(4);
            expect(expr.get(4)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(4).id).to.equal('y');
         });
      });
      it('double and single bracket indexing becoming appropriate expression objects', function() {
         main.parse('x[[1]]; x[1, , 2]', function(nodes) {
            var expr = Expression.maker(nodes[0]);
            expect(expr).to.be.an.instanceof(Expression);
            expect(expr.length()).to.equal(3);
            expect(expr.get(1)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(1).id).to.equal('[[');
            expect(expr.get(2)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(2).id).to.equal('x');
            expect(expr.get(3)).to.equal(1);

            expr = Expression.maker(nodes[1]);
            expect(expr).to.be.an.instanceof(Expression);
            expect(expr.length()).to.equal(5);
            expect(expr.get(1)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(1).id).to.equal('[');
            expect(expr.get(2)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(2).id).to.equal('x');
            expect(expr.get(3)).to.equal(1);
            expect(expr.get(4)).to.equal(undefined);
            expect(expr.get(5)).to.equal(2);
         });
      });
      it('assignment expressions becoming appropriate expression objects', function() {
         main.parse('x <- 3; x[1] <- 2', function(nodes) {
            var expr = Expression.maker(nodes[0]);
            expect(expr).to.be.an.instanceof(Expression);
            expect(expr.length()).to.equal(3);
            expect(expr.get(1)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(1).id).to.equal('<-');
            expect(expr.get(2)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(2).id).to.equal('x');
            expect(expr.get(3)).to.equal(3);

            expr = Expression.maker(nodes[1]);
            expect(expr).to.be.an.instanceof(Expression);
            expect(expr.length()).to.equal(3);
            expect(expr.get(1)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(1).id).to.equal('<-');
            expect(expr.get(2)).to.be.an.instanceof(Expression);
            expect(expr.get(2).get(2)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(3)).to.equal(2);
         });
      });
      it('blocks becoming appropriate expression objects', function() {
         main.parse('{ x; y }', function(nodes) {
            var expr = Expression.maker(nodes[0]);
            expect(expr).to.be.an.instanceof(Expression);
            expect(expr.length()).to.equal(3);
            expect(expr.get(1)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(1).id).to.equal('{');
            expect(expr.get(2)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(2).id).to.equal('x');
            expect(expr.get(3)).to.be.an.instanceof(Expression.Symbol);
            expect(expr.get(3).id).to.equal('y');
         });
      });
  });
});
