var main = require('../..');
var chai = require('chai');
var expect = chai.expect;

describe('The parser handles operators', function() {
   it('basic arithmetic', function() {
      ['5 + 2', '-23 * -3', '2.34+1.2',
       '-0.23 * 2 + 3', '-0.23 + 2 * 3',
       '2^3', '2^3+2', '2^-2', '-2^2'].forEach(function(num) {
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
      // Exponentiation before unary operations
      main.parse('-2 ^ 4', function(nodes) {
         expect(nodes[0].args[0]).to.equal('-');
         expect(nodes[0].args[2].args[0]).to.equal('^');
      });
   });
   it('div and mod', function() {
      ['5 %% 2', '5 %/% 2', '5 %% 3 %/% 2',
       '5 %% 4 %% 3',' 5 %/% 4 %/% 3'
      ].forEach(function(num) {
         main.parse(num, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.name).to.equal('arithop');
         });
      });
      // unary operators handled properly
      main.parse('-23 %% -3', function(nodes) {
         expect(nodes[0].args[0]).to.equal('MOD');
      });
      main.parse('-23 %/% -3', function(nodes) {
         expect(nodes[0].args[0]).to.equal('DIV');
      });
      // div and mod before multiplication
      main.parse('23 * 2 %% 3', function(nodes) {
         expect(nodes[0].args[0]).to.equal('*');
         expect(nodes[0].args[2].args[0]).to.equal('MOD');
      });
      main.parse('23 * 2 %/% 3', function(nodes) {
         expect(nodes[0].args[0]).to.equal('*');
         expect(nodes[0].args[2].args[0]).to.equal('DIV');
      });
   });
   it('logical pointwise', function() {
      main.parse('5 | 3', function(nodes) {
         expect(nodes[0].name).to.equal('logical-point');
         expect(nodes[0].args[0]).to.equal('|');
      });
      main.parse('5 | 3 | 2', function(nodes) {
         expect(nodes[0].name).to.equal('logical-point');
         expect(nodes[0].args[0]).to.equal('|');
         expect(nodes[0].args[1].name).to.equal('logical-point');
         expect(nodes[0].args[2].name).to.not.equal('logical-point');
      });
      main.parse('5 & 3', function(nodes) {
         expect(nodes[0].name).to.equal('logical-point');
         expect(nodes[0].args[0]).to.equal('&');
      });
      main.parse('5 & 3 & 2', function(nodes) {
         expect(nodes[0].name).to.equal('logical-point');
         expect(nodes[0].args[0]).to.equal('&');
         expect(nodes[0].args[1].name).to.equal('logical-point');
         expect(nodes[0].args[2].name).to.not.equal('logical-point');
      });
      main.parse('! 3', function(nodes) {
         expect(nodes[0].name).to.equal('negate-point');
      });
      main.parse('! ! 3', function(nodes) {
         expect(nodes[0].name).to.equal('negate-point');
         expect(nodes[0].args[0].name).to.equal('negate-point');
      });
      main.parse('!5 | 3 & 2', function(nodes) {
         expect(nodes[0].args[0]).to.equal('|');
         expect(nodes[0].args[1].name).to.equal('negate-point');
         expect(nodes[0].args[2].args[0]).to.equal('&');
      });
   });
});
