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
            expect(node.index).to.be.a('string');
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
});
