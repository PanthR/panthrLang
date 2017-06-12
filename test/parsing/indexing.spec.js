var main = require('../..');
var chai = require('chai');
var expect = chai.expect;

describe('The parser parses', function() {
   it('dollar-sign list access correctly', function() {
      ['x$y', 'x$`true`'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.name).to.equal('fun_call');
            expect(node.fun.name).to.equal('variable');
            expect(node.fun.id).to.equal('$');
            expect(node.args[0].name).to.equal('arg_named');
            expect(node.args[0].id).to.equal('x');
            expect(node.args[1].name).to.equal('variable');
         });
      });
   });
   it('double-bracket list access correctly', function() {
      main.parse('x[[3]]', function(nodes) {
         expect(nodes.length).to.equal(1);
         var node = nodes[0];
         expect(node.name).to.equal('fun_call');
         expect(node.fun.name).to.equal('variable');
         expect(node.fun.id).to.equal('[[');
         expect(node.args[0].name).to.equal('arg_named');
         expect(node.args[0].id).to.equal('x');
         expect(node.args[1].name).to.equal('number');
      });
   });
   it('nested list accesses properly', function() {
      main.parse('x[[3]][[2]]', function(nodes) {
         expect(nodes[0].name).to.equal('fun_call');
         expect(nodes[0].fun.id).to.equal('[[');
         expect(nodes[0].args[0].value.name).to.equal('fun_call');
         expect(nodes[0].args[0].value.fun.id).to.equal('[[');
      });
      main.parse('x$y$z', function(nodes) {
         expect(nodes[0].name).to.equal('fun_call');
         expect(nodes[0].fun.id).to.equal('$');
         expect(nodes[0].args[0].value.name).to.equal('fun_call');
         expect(nodes[0].args[0].value.fun.id).to.equal('$');
      });
      main.parse('x[[3]]$y', function(nodes) {
         expect(nodes[0].name).to.equal('fun_call');
         expect(nodes[0].fun.id).to.equal('$');
         expect(nodes[0].args[0].value.name).to.equal('fun_call');
         expect(nodes[0].args[0].value.fun.id).to.equal('[[');
      });
      main.parse('x$y[[3]]', function(nodes) {
         expect(nodes[0].name).to.equal('fun_call');
         expect(nodes[0].fun.id).to.equal('[[');
         expect(nodes[0].args[0].value.name).to.equal('fun_call');
         expect(nodes[0].args[0].value.fun.id).to.equal('$');
      });
      main.parse('x[[y$z]]', function(nodes) {
         expect(nodes[0].name).to.equal('fun_call');
         expect(nodes[0].fun.id).to.equal('[[');
         expect(nodes[0].args[1].name).to.equal('fun_call');
         expect(nodes[0].args[1].fun.id).to.equal('$');
      });
      main.parse('x[[y[[3]]]]', function(nodes) {
         expect(nodes[0].name).to.equal('fun_call');
         expect(nodes[0].fun.id).to.equal('[[');
         expect(nodes[0].args[1].name).to.equal('fun_call');
         expect(nodes[0].args[1].fun.id).to.equal('[[');
      });
   });
   it('single bracket indexing', function() {
      main.parse('x[]; x[1+2]; x[,]; x[,3]; x[1+2,]\n x[4, 4, 5]', function(nodes) {
         expect(nodes[0].name).to.equal('fun_call');
         expect(nodes[0].fun.id).to.equal('[');
         expect(nodes[0].args.length).to.equal(1);

         expect(nodes[1].name).to.equal('fun_call');
         expect(nodes[1].fun.id).to.equal('[');
         expect(nodes[1].args.length).to.equal(2);
         expect(nodes[1].args[1].name).to.equal('fun_call');

         expect(nodes[2].name).to.equal('fun_call');
         expect(nodes[2].fun.id).to.equal('[');
         expect(nodes[2].args.length).to.equal(3);
         expect(nodes[2].args[1].name).to.equal('arg_empty');
         expect(nodes[2].args[2].name).to.equal('arg_empty');

         expect(nodes[3].name).to.equal('fun_call');
         expect(nodes[3].fun.id).to.equal('[');
         expect(nodes[3].args.length).to.equal(3);
         expect(nodes[3].args[1].name).to.equal('arg_empty');
         expect(nodes[3].args[2].name).to.equal('number');

         expect(nodes[4].name).to.equal('fun_call');
         expect(nodes[4].fun.id).to.equal('[');
         expect(nodes[4].args.length).to.equal(3);
         expect(nodes[4].args[1].name).to.equal('fun_call');
         expect(nodes[4].args[2].name).to.equal('arg_empty');

         expect(nodes[5].name).to.equal('fun_call');
         expect(nodes[5].fun.id).to.equal('[');
         expect(nodes[5].args.length).to.equal(4);
         expect(nodes[5].args[1].name).to.equal('number');
         expect(nodes[5].args[1].value).to.equal(4);
         expect(nodes[5].args[2].name).to.equal('number');
         expect(nodes[5].args[2].value).to.equal(4);
         expect(nodes[5].args[3].name).to.equal('number');
         expect(nodes[5].args[3].value).to.equal(5);
      });
   });
});
