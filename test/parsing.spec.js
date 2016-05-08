var main = require('..');
var chai = require('chai');
var expect = chai.expect;

describe('The parser', function() {
   it('is accessible via parse', function() {
      expect(main).to.respondTo('parse');
      expect(function() { main.parse('2', function() {}); }).to.not.throw();
   });
   it('parses integers correctly', function() {
      ['5', '23', '0'].forEach(function(num) {
         main.parse(num, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.name).to.equal('number');
         });
      });
   });
   it('parses floats correctly', function() {
      ['2.34', '0.23', '0.1e-10'].forEach(function(num) {
         main.parse(num, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.name).to.equal('number');
            expect(node.args[0]).to.equal(parseFloat(num));
         });
      });
   });
   it('parses arithmetic operations', function() {
      ['5 + 2', '-23 * -3', '2.34+1.2',
       '-0.23 * 2 + 3', '-0.23 + 2 * 3'].forEach(function(num) {
         main.parse(num, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.name).to.equal('arithop');
         });
      });
      // unary operators handled properly
      main.parse('-23 * -3', function(nodes) {
         expect(nodes[0].args[0]).to.equal('*');
      });
      // Multiplication before addition
      main.parse('-0.23 * 2 + 3', function(nodes) {
         expect(nodes[0].args[0]).to.equal('+');
         expect(nodes[0].args[1].args[0]).to.equal('*');
      });
   });
   it('parses variables', function() {
      ['xy23', '_foo', 'test.this'].forEach(function(str) {
         main.parse(str, function(nodes) {
            expect(nodes.length).to.equal(1);
            expect(nodes[0].name).to.equal('var');
            expect(nodes[0].args[0]).to.equal(str);
         });
      });
   });
   it('parses parenthetical expressions', function() {
      ['-0.23 * (2 + 3)', '(-0.23 + 2) * 3'].forEach(function(num) {
         main.parse(num, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.name).to.equal('arithop');
            expect(node.args[0]).to.equal('*');
         });
      });
   });
   it('parses blocks', function() {
      ['{ 3 + 4\n2*3; 4\n}'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.name).to.equal('expr_seq');
            expect(node.args.length).to.equal(1);
            expect(node.args[0].length).to.equal(3);
         });
      });
   });
   it('parses assignments', function() {
      ['x<- 3 + 4', 'y23 = 3 * 5'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.name).to.equal('assign');
         });
      });
   });
   it('parses function definitions', function() {
      ['function(x, y) { x + y }'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.name).to.equal('fun_def');
         });
      });
   });
   it('parses default arguments and "..." in function definitions', function() {
      ['function(x, y = 3, ...) { x + y }'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            var formals = node.args[0];
            expect(formals.length).to.equal(3);
            expect(formals[0].name).to.equal('arg');
            expect(formals[1].name).to.equal('arg_default');
            expect(formals[2].name).to.equal('arg_dots');
         });
      });
   });
   it('parses function calls', function() {
      ['f <- function(x, y) { x + y }\n f(2, 4)'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(2);
            var node = nodes[1];
            expect(node.name).to.equal('fun_call');
         });
      });
   });
   it('parses named arguments and "..." in function calls', function() {
      ['f(2, y = 3 + 5, ...)'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            var actuals = node.args[1];
            expect(actuals.length).to.equal(3);
            expect(actuals[0].name).to.equal('actual');
            expect(actuals[1].name).to.equal('actual_named');
            expect(actuals[2].name).to.equal('actual_dots');
         });
      });
   });
   it('parses function definitions and calls with no arguments', function() {
      ['f(); function() { 2 }'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(2);
         });
      });
   });

   it('parses "<<-" assignments', function() {
      ['g <<- 2; f <- function(x, y) { g <<- 5 }\n f(2, 4)\n g'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(4);
            var node = nodes[0];
            expect(node.name).to.equal('assign_inherit');
         });
      });
   });

   it('parses package-loading', function() {
      ['library(base)'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(1);
            expect(nodes[0].name).to.equal('library');
            expect(nodes[0].args[0]).to.equal('base');
         });
      });
   });

});
