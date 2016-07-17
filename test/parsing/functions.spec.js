var main = require('../..');
var chai = require('chai');
var expect = chai.expect;

describe('The parser', function() {
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
});
