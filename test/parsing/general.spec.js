var main = require('../..');
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
   it('parses assignments', function() {
      ['x<- 3 + 4', 'y23 = 3 * 5'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.name).to.equal('assign');
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

   it('parses range expressions', function() {
      ['1:5', '1:(2+3)'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(1);
            expect(nodes[0].name).to.equal('range');
            expect(nodes[0].args.length).to.equal(2);
         });
      });
      main.parse('2 ^ 1 : 4', function(nodes) {
         expect(nodes.length).to.equal(1);
         expect(nodes[0].name).to.equal('range');
         expect(nodes[0].args[0].name).to.equal('arithop');
      });
      main.parse('-1 : 4', function(nodes) {
         expect(nodes.length).to.equal(1);
         expect(nodes[0].name).to.equal('range');
         expect(nodes[0].args[0].name).to.equal('arithop');
      });
   });
});
