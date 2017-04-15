var main = require('../..');
var chai = require('chai');
var expect = chai.expect;

describe('The parser parses', function() {
   it('dollar-sign list access correctly', function() {
      ['x$y', 'x$`true`'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.name).to.equal('dollar_access');
            expect(node.object.name).to.equal('variable');
            expect(node.id).to.be.a('string');
         });
      });
   });
   it('double-bracket list access correctly', function() {
      main.parse('x[[3]]', function(nodes) {
         expect(nodes.length).to.equal(1);
         var node = nodes[0];
         expect(node.name).to.equal('dbl_bracket_access');
         expect(node.object.name).to.equal('variable');
         expect(node.index.name).to.equal('number');
      });
   });
   it('nested list accesses properly', function() {
      main.parse('x[[3]][[2]]', function(nodes) {
         expect(nodes[0].name).to.equal('dbl_bracket_access');
         expect(nodes[0].object.name).to.equal('dbl_bracket_access');
      });
      main.parse('x$y$z', function(nodes) {
         expect(nodes[0].name).to.equal('dollar_access');
         expect(nodes[0].object.name).to.equal('dollar_access');
      });
      main.parse('x[[3]]$y', function(nodes) {
         expect(nodes[0].name).to.equal('dollar_access');
         expect(nodes[0].object.name).to.equal('dbl_bracket_access');
      });
      main.parse('x$y[[3]]', function(nodes) {
         expect(nodes[0].name).to.equal('dbl_bracket_access');
         expect(nodes[0].object.name).to.equal('dollar_access');
      });
      main.parse('x[[y$z]]', function(nodes) {
         expect(nodes[0].name).to.equal('dbl_bracket_access');
         expect(nodes[0].index.name).to.equal('dollar_access');
      });
      main.parse('x[[y[[3]]]]', function(nodes) {
         expect(nodes[0].name).to.equal('dbl_bracket_access');
         expect(nodes[0].index.name).to.equal('dbl_bracket_access');
      });
   });
   it('single bracket indexing', function() {
      main.parse('x[]; x[1+2]; x[,]; x[,3]; x[1+2,]\n x[4, 4, 5]', function(nodes) {
         expect(nodes[0].name).to.equal('single_bracket_access');
         expect(nodes[0].coords.length).to.equal(0);
         expect(nodes[1].name).to.equal('single_bracket_access');
         expect(nodes[1].coords.length).to.equal(1);
         expect(nodes[1].coords[0].name).to.equal('fun_call');
         expect(nodes[2].name).to.equal('single_bracket_access');
         expect(nodes[2].coords.length).to.equal(2);
         expect(nodes[2].coords[0].name).to.equal('arg_empty');
         expect(nodes[2].coords[1].name).to.equal('arg_empty');
         expect(nodes[3].name).to.equal('single_bracket_access');
         expect(nodes[3].coords.length).to.equal(2);
         expect(nodes[3].coords[0].name).to.equal('arg_empty');
         expect(nodes[3].coords[1].name).to.equal('number');
         expect(nodes[4].name).to.equal('single_bracket_access');
         expect(nodes[4].coords.length).to.equal(2);
         expect(nodes[4].coords[0].name).to.equal('fun_call');
         expect(nodes[4].coords[1].name).to.equal('arg_empty');
         expect(nodes[5].name).to.equal('single_bracket_access');
         expect(nodes[5].coords.length).to.equal(3);
         expect(nodes[5].coords[0].name).to.equal('number');
         expect(nodes[5].coords[0].value).to.equal(4);
         expect(nodes[5].coords[1].name).to.equal('number');
         expect(nodes[5].coords[1].value).to.equal(4);
         expect(nodes[5].coords[2].name).to.equal('number');
         expect(nodes[5].coords[2].value).to.equal(5);
      });
   });
});
