var main = require('../..');
var chai = require('chai');
var expect = chai.expect;

describe('The parser handles operators', function() {
   it('basic arithmetic', function() {
      ['5 + 2', '-23 * -3', '2.34+1.2',
       '-0.23 * 2 + 3', '-0.23 + 2 * 3',
       '2^3', '2^3+2', '2^-2', '-2^2'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.name).to.equal('fun_call');
            expect(node.fun.name).to.equal('variable');
            expect(node.args.length).to.equal(2);
         });
      });
   });
   it('(unary operators) properly', function() {
      main.parse('-23 * -3', function(nodes) {
         expect(nodes[0].fun.id).to.equal('`*`');
      });
   });
   it('to make multiplication before addition', function() {
      main.parse('-0.23 * 2 + 3', function(nodes) {
         expect(nodes[0].fun.id).to.equal('`+`');
         expect(nodes[0].args[0].fun.id).to.equal('`*`');
      });
   });
   it('to make exponentiation before unary operations', function() {
      main.parse('-2 ^ 4', function(nodes) {
         expect(nodes[0].fun.id).to.equal('`-`');
         expect(nodes[0].args[1].fun.id).to.equal('`^`');
      });
   });
   it('div and mod', function() {
      ['5 %% 2', '5 %/% 2', '5 %% 3 %/% 2',
       '5 %% 4 %% 3',' 5 %/% 4 %/% 3'
      ].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.name).to.equal('fun_call');
            expect(node.fun.name).to.equal('variable');
            expect(node.args.length).to.equal(2);
         });
      });
      // unary operators handled properly
      main.parse('-23 %% -3', function(nodes) {
         expect(nodes[0].fun.id).to.equal('`%%`');
      });
      main.parse('-23 %/% -3', function(nodes) {
         expect(nodes[0].fun.id).to.equal('`%/%`');
      });
      // div and mod before multiplication
      main.parse('23 * 2 %% 3', function(nodes) {
         expect(nodes[0].fun.id).to.equal('`*`');
         expect(nodes[0].args[1].fun.id).to.equal('`%%`');
      });
      main.parse('23 * 2 %/% 3', function(nodes) {
         expect(nodes[0].fun.id).to.equal('`*`');
         expect(nodes[0].args[1].fun.id).to.equal('`%/%`');;
      });
   });
   it('logical pointwise', function() {
      main.parse('5 | 3', function(nodes) {
         expect(nodes[0].name).to.equal('fun_call');
         expect(nodes[0].fun.name).to.equal('variable');
         expect(nodes[0].fun.id).to.equal('`|`');
      });
      main.parse('5 | 3 | 2', function(nodes) {
         expect(nodes[0].name).to.equal('fun_call');
         expect(nodes[0].args[0].name).to.equal('fun_call');
         expect(nodes[0].args[1].name).to.not.equal('fun_call');
      });
      main.parse('5 & 3', function(nodes) {
         expect(nodes[0].name).to.equal('fun_call');
      });
      main.parse('5 & 3 & 2', function(nodes) {
         expect(nodes[0].name).to.equal('fun_call');
         expect(nodes[0].args[0].name).to.equal('fun_call');
         expect(nodes[0].args[1].name).to.not.equal('fun_call');
      });
      main.parse('! 3', function(nodes) {
         expect(nodes[0].name).to.equal('fun_call');
      });
      main.parse('! ! 3', function(nodes) {
         expect(nodes[0].name).to.equal('fun_call');
         expect(nodes[0].args.length).to.equal(1);
         expect(nodes[0].args[0].name).to.equal('fun_call');
      });
      main.parse('!5 | 3 & 2', function(nodes) {
         expect(nodes[0].fun.id).to.equal('`|`');
         expect(nodes[0].args[0].name).to.equal('fun_call');
         expect(nodes[0].args[1].fun.id).to.equal('`&`');
      });
   });
});
