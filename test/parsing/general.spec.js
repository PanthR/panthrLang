var main = require('../..');
var chai = require('chai');
var expect = chai.expect;

describe('The parser parses', function() {
   it('is accessible via parse', function() {
      expect(main).to.respondTo('parse');
      expect(function() { main.parse('2', function() {}); }).to.not.throw();
   });
   it('parenthetical expressions without removing the paretheses', function() {
      main.parse('(2 + 3) * (5)', function(nodes) {
         expect(nodes.length).to.equal(1);
         var node = nodes[0];
         expect(node.type).to.equal('fun_call');
         expect(node.args[0].type).to.equal('parens');
         expect(node.args[1].type).to.equal('parens');
      });
   });
   it('integers correctly', function() {
      ['5', '23', '0'].forEach(function(num) {
         main.parse(num, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.type).to.equal('number');
            expect(node.value).to.be.a('number');
         });
      });
   });
   it('integers in hexadecimal correctly', function() {
      [['0x5', 5], ['0xaA2', 2722], ['0xffff',65535]].forEach(function(pair) {
         var num = pair[0];
         var val = pair[1];
         main.parse(num, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.type).to.equal('number');
            expect(node.value).to.be.a('number');
            expect(node.value).to.equal(val);
         });
      });
   });
   it('floats correctly', function() {
      ['2.34', '0.23', '0.1e-10'].forEach(function(num) {
         main.parse(num, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.type).to.equal('number');
            expect(node.value).to.equal(parseFloat(num));
         });
      });
   });
   it('boolean literals', function() {
      main.parse('TRUE', function(nodes) {
         expect(nodes[0].type).to.equal('boolean');
         expect(nodes[0].value).to.equal(true);
      });
      main.parse('FALSE', function(nodes) {
         expect(nodes[0].type).to.equal('boolean');
         expect(nodes[0].value).to.equal(false);
      });
   });
   it('string literals', function() {
      main.parse('"a"; "\\\\n\\n\n"; "\\\'\\"\t"', function(nodes) {
         expect(nodes[0].type).to.equal('string');
         expect(nodes[0].value).to.equal('a');
         expect(nodes[1].type).to.equal('string');
         expect(nodes[1].value).to.equal('\\n\n\n');
         expect(nodes[2].type).to.equal('string');
         expect(nodes[2].value).to.equal('\'"\t');
      });
      main.parse("'a'; '\\\\n\\n\n'; '\\'\\\"\t'", function(nodes) {
         expect(nodes[0].type).to.equal('string');
         expect(nodes[0].value).to.equal('a');
         expect(nodes[1].type).to.equal('string');
         expect(nodes[1].value).to.equal('\\n\n\n');
         expect(nodes[2].type).to.equal('string');
         expect(nodes[2].value).to.equal('\'"\t');
      });
   });
   it('missing values', function() {
      main.parse('NA; NaN', function(nodes) {
         expect(nodes[0].type).to.equal('missing');
         expect(nodes[1].type).to.equal('missing');
      });
   });
   it('null', function() {
      main.parse('NULL', function(nodes) {
         expect(nodes[0].type).to.equal('null');
      });
   });
   it('variables', function() {
      ['xy23', '_foo', 'test.this', '.allowed','ok_with_this.1', '..'].forEach(function(str) {
         main.parse(str, function(nodes) {
            expect(nodes.length).to.equal(1);
            expect(nodes[0].type).to.equal('variable');
            expect(nodes[0].id).to.equal(str);
         });
      });
   });
   it('backticked variables', function() {
      ['`xy23`', '`_foo`', '`test.this`', '`+`', '`%/%`'].forEach(function(str) {
         main.parse(str, function(nodes) {
            expect(nodes.length).to.equal(1);
            expect(nodes[0].type).to.equal('variable');
            expect(nodes[0].id).to.equal(str.replace(/`/g, ''));
         });
      });
   });
   it('parenthetical expressions', function() {
      ['-0.23 * (2 + 3)', '(-0.23 + 2) * 3'].forEach(function(num) {
         main.parse(num, function(nodes) {
            expect(nodes.length).to.equal(1);
            expect(nodes[0].type).to.equal('fun_call');
            expect(nodes[0].fun.type).to.equal('variable');
            expect(nodes[0].fun.id).to.equal('*');
         });
      });
   });
   it('assignments', function() {
      ['x<- 3 + 4', 'y23 = 3 * 5'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.type).to.equal('assign');
         });
      });
   });
   it('"<<-" assignments', function() {
      ['g <<- 2; f <- function(x, y) { g <<- 5 }\n f(2, 4)\n g'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(4);
            var node = nodes[0];
            expect(node.type).to.equal('assign_existing');
            expect(nodes[1].rvalue.body.type).to.equal('block');
            expect(nodes[1].rvalue.body.exprs.length).to.equal(1);
            expect(nodes[1].rvalue.body.exprs[0].type).to.equal('assign_existing');
         });
      });
   });

   it('package-loading', function() {
      ['library(base)'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(1);
            expect(nodes[0].type).to.equal('library');
            expect(nodes[0].id).to.equal('base');
         });
      });
   });

   it('range expressions', function() {
      ['1:5', '1:(2+3)'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(1);
            expect(nodes[0].type).to.equal('range');
            expect(nodes[0]).to.contain.keys(['from', 'to']);
         });
      });
      main.parse('2 ^ 1 : 4', function(nodes) {
         expect(nodes.length).to.equal(1);
         expect(nodes[0].type).to.equal('range');
         expect(nodes[0].from.type).to.equal('fun_call');
         expect(nodes[0].from.fun.id).to.equal('^');
      });
      main.parse('-1 : 4', function(nodes) {
         expect(nodes.length).to.equal(1);
         expect(nodes[0].type).to.equal('range');
         expect(nodes[0].from.type).to.equal('fun_call');
         expect(nodes[0].from.fun.id).to.equal('-');
      });
   });

   it('comments that are on their own', function() {
      main.parse('#hey you\n', function(nodes) {
         expect(nodes.length).to.equal(0);
      });

      main.parse('#hey you\n   #whats up?\n', function(nodes) {
         expect(nodes.length).to.equal(0);
      });
   });

   it('comments that are embedded in other expressions', function() {
      main.parse('#hey you\n 75  #whats up?\n', function(nodes) {
         expect(nodes.length).to.equal(1);
         expect(nodes[0].type).to.equal('number');
      });

      main.parse('(2+#dlaskjflasfk\n3)', function(nodes) {
         expect(nodes.length).to.equal(1);
         expect(nodes[0].type).to.equal('parens');
         expect(nodes[0].expr.type).to.equal('fun_call');
         expect(nodes[0].expr.args[1].type).to.equal('number');
      });

      main.parse('(2+3#dlaskjflasfk\n)', function(nodes) {
         expect(nodes.length).to.equal(1);
         expect(nodes[0].type).to.equal('parens');
         expect(nodes[0].expr.type).to.equal('fun_call');
         expect(nodes[0].expr.args[1].type).to.equal('number');
      });

      main.parse('f(#hey  \n,3)', function(nodes) {
         expect(nodes.length).to.equal(1);
         expect(nodes[0].type).to.equal('fun_call');
         expect(nodes[0].args.length).to.equal(2);
         expect(nodes[0].args[0].type).to.equal('arg_empty');
         expect(nodes[0].args[1].type).to.equal('number');
      });
   });
});
