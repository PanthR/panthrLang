var main = require('..');
var chai = require('chai');
var expect = chai.expect;

describe('The evaluator', function() {
   it('is accessible via eval', function() {
      expect(main).to.respondTo('eval');
      expect(function() { main.eval('2'); }).to.not.throw();
   });
   it('evaluates numbers', function() {
      ['5', '23', '2.34', '0.23', '0', '0.1e-10'].forEach(function(num) {
         var evs = main.eval(num);
         expect(evs.length).to.equal(1);
         expect(evs[0].type).to.equal('scalar');
         expect(evs[0].value).to.equal(parseFloat(num));
      });
   });
   it('evaluates arithmetic operations correctly', function() {
      ['5 + 2', '-23 * -2', '2.34+1.2',
       '-0.23 * 2 + 3', '-0.23 + 2 * 3'].forEach(function(expr) {
         var evs = main.eval(expr);
         expect(evs.length).to.equal(1);
         expect(evs[0].type).to.equal('scalar');
         expect(evs[0].value).to.equal(eval(expr));
      });
   });
   it('evaluates powers correctly', function() {
      [['2^3', 8], ['2^3+2', 10],
       ['2^-2', 0.25], ['-2^2', -4],
       ['2^2^3', 256]
      ].forEach(function(pair) {
         var expr = pair[0];
         var value = pair[1];
         var evs = main.eval(expr);
         expect(evs.length).to.equal(1);
         expect(evs[0].type).to.equal('scalar');
         expect(evs[0].value).to.equal(value);
      });
   });
   it('evaluates parenthetical expressions correctly', function() {
      ['-0.23 * (2 + 3)', '(-0.23 + 2) * 3'].forEach(function(expr) {
         var evs = main.eval(expr);
         expect(evs.length).to.equal(1);
         expect(evs[0].type).to.equal('scalar');
         expect(evs[0].value).to.equal(eval(expr));
      });
   });
   it('evaluates assignments properly', function() {
      var evs = main.eval('x<- 3 + 4\ny = x * 5\nx+y');
      expect(evs.map(function(v) { return v.value; })).to.deep.equal([7, 35, 42]);
   });
   it('evaluates function definitions', function() {
      var evs = main.eval('function(x, y) { x + y }');
      expect(evs.length).to.equal(1);
      expect(evs[0].type).to.equal('closure');
      expect(evs[0].value).to.have.keys(['env', 'func']);
      expect(evs[0].value.func.name).to.equal('fun_def');

      evs = main.eval('function(x, y) x + y / 2');
      expect(evs.length).to.equal(1);
      expect(evs[0].type).to.equal('closure');
      expect(evs[0].value).to.have.keys(['env', 'func']);
      expect(evs[0].value.func.name).to.equal('fun_def');
   });
   it('evaluates blocks properly', function() {
      var evs = main.eval('x <- { 3 + 4\n2*3\n}\n x');
      expect(evs.length).to.equal(2);
      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value).to.equal(6);

      evs = main.eval('x <- { x<-3 + 4; 2*3\n}\n x');
      expect(evs.length).to.equal(2);
      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value).to.equal(6);
   });
   it('evaluates normal function calls properly', function() {
      var evs = main.eval('f <- function(x, y) { x + y }\n x<-4; f(2, 4); x; f(x, 4); x');
      expect(evs.length).to.equal(6);
      expect(evs[2].value).to.equal(6);
      expect(evs[3].value).to.equal(4);
      expect(evs[4].value).to.equal(8);
      expect(evs[5].value).to.equal(4);
   });
   it('evaluates named parameters in function calls properly', function() {
      var evs = main.eval('f <- function(x, y) { x / y }\n x<-4; f(y=2, 4); x; f(2, 4); x');
      expect(evs.length).to.equal(6);
      expect(evs[2].value).to.equal(4 / 2);
      expect(evs[3].value).to.equal(4);
      expect(evs[4].value).to.equal(2 / 4);
      expect(evs[5].value).to.equal(4);
   });
   it('passes dotted arguments to future calls properly', function() {
      var evs = main.eval('g <- function(y, z) { y / z }; f <- function(x, ...) { x + g(...) }\n f(y=2, 4, 6)');
      expect(evs.length).to.equal(3);
      expect(evs[2].value).to.equal(4 + 2 / 6);
   });
   it('computes default parameters properly', function() {
      var evs = main.eval('g <- function() { x <- 1; function(y, w = z + 1, z = x + 1) { w + y / z } }; x <- 5; g()(1)');
      expect(evs.length).to.equal(3);
      expect(evs[2].value).to.equal(3 + 1 / 2);
   });
   it('implements "<<-" assignment properly', function() {
      var evs = main.eval('g <<- 2; g; f <- function(x, y) { g <<- 5 }\n f(2, 4)\n g');
      expect(evs.length).to.equal(5);
      expect(evs[0].value).to.equal(2);
      expect(evs[1].value).to.equal(2);
      expect(evs[4].value).to.equal(5);
   });

   it('evaluates package-loading', function() {
      var evs = main.eval('library(base)\n sin(3)');
      expect(evs.length).to.equal(2);
      expect(evs[1].value.values.values).to.deep.equal([Math.sin(3)]);
   });

   it('evaluates range expressions', function() {
      var evs = main.eval('1:5; 1:(2+3)');

      expect(evs.length).to.equal(2);
      evs.forEach(function(ev) {
         expect(ev.type).to.equal('scalar');
         expect(ev.value.values.values).to.deep.equal([1, 2, 3, 4, 5]);
      });
   });


   describe('errors', function() {
      it('for failed lookups', function() {
         var evs = main.eval('x + y; 2 + y');
         expect(evs[0].type).to.equal('error');
         expect(evs[0].toString()).to.contain('symbol');
         expect(evs[0].toString()).to.contain('x');
         expect(evs[1].type).to.equal('error');
         expect(evs[1].toString()).to.contain('symbol');
         expect(evs[1].toString()).to.contain('y');
         expect(evs[1].toString()).to.match(/11|12|13/);
      });
      it('for dots used when not available', function() {
         var evs = main.eval('f <- function(x) { f(...) }; f(5)');
         expect(evs[0].type).to.not.equal('error');
         expect(evs[1].type).to.equal('error');
         expect(evs[1].toString()).to.contain('...');
         expect(evs[1].toString()).to.match(/21|22|23|24/);
      });
      it('for named argument given twice in a call', function() {
         var evs = main.eval('f <- function(x) { x }; f(x=5, x=10)');
         expect(evs[0].type).to.not.equal('error');
         expect(evs[1].type).to.equal('error');
         expect(evs[1].toString()).to.contain('occurred twice');
         expect(evs[1].toString()).to.contain('x');
         expect(evs[1].toString()).to.match(/31|32|33|34|35/);
      });
      it('for unknown packages', function() {
         var evs = main.eval('library(fwegt2t)');
         expect(evs[0].type).to.equal('error');
         expect(evs[0].toString()).to.contain('package');
         expect(evs[0].toString()).to.contain('fwegt2t');
         // expect(evs[0].toString()).to.match(/8|9|10|11|12|13|14|15/);
      });
      it('for calling non-function', function() {
         var evs = main.eval('3+4; (2+3)(4)');
         expect(evs[1].type).to.equal('error');
         expect(evs[1].toString()).to.contain('non-function');
         expect(evs[1].toString()).to.match(/4|5|6|7|8|9/);
      });
      it('for arithmetic on non-scalars', function() {
         var evs = main.eval('f <- function() { x }; f + 3');
         expect(evs[1].type).to.equal('error');
         expect(evs[1].toString()).to.contain('non-scalar');
         expect(evs[1].toString()).to.match(/23|24|25|26/);
      });
   });
   describe('handles parse errors', function() {
      it('for unmatched parens', function() {
         var evs = main.eval('(3+(4); 3+4');
         expect(evs.length).to.equal(2);
         expect(evs[0].type).to.equal('error');
         expect(evs[1].type).to.equal('scalar');
      });
   });
});
