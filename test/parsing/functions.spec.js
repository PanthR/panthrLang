var main = require('../..');
var chai = require('chai');
var expect = chai.expect;

describe('The parser', function() {
   it('parses blocks', function() {
      ['{ 3 + 4\n2*3; 4\n}'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.type).to.equal('block');
            expect(node.exprs.length).to.equal(3);
         });
      });
   });
   it('parses function definitions', function() {
      ['function(x, y) { x + y }'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.type).to.equal('fun_def');
            expect(node.body.type).to.equal('block');
            expect(node.params.length).to.equal(2);
         });
      });
   });
   it('parses default arguments and "..." in function definitions', function() {
      ['function(x, y = 3, ...) { x + y }'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.params.length).to.equal(3);
            expect(node.params[0].type).to.equal('param');
            expect(node.params[1].type).to.equal('param_default');
            expect(node.params[2].type).to.equal('param_dots');
         });
      });
   });
   it('parses function calls', function() {
      ['f <- function(x, y) { x + y }\n f(2, 4)'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(2);
            var node = nodes[1];
            expect(node.type).to.equal('fun_call');
            expect(node.fun.type).to.equal('variable');
            expect(node.fun.id).to.equal('f');
            expect(node.args.length).to.equal(2);
         });
      });
   });
   it('parses named arguments and "..." in function calls', function() {
      ['f(2, y = 3 + 5, ...)'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.args.length).to.equal(3);
            expect(node.args[0].type).to.equal('number');
            expect(node.args[1].type).to.equal('arg_named');
            expect(node.args[1].id).to.equal('y');
            expect(node.args[1].value.type).to.equal('fun_call');
            expect(node.args[2].type).to.equal('arg_dots');
         });
      });
   });
   it('parses function definitions and calls with no arguments', function() {
      ['f(); function() { 2 }; f(,)'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(3);
            expect(nodes[0].args.length).to.equal(0);
            expect(nodes[1].params.length).to.equal(0);
            expect(nodes[2].args.length).to.equal(2);
            expect(nodes[2].args[0].type).to.equal('arg_empty');
            expect(nodes[2].args[1].type).to.equal('arg_empty');
         });
      });
   });
});
