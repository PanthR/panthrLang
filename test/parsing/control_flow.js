var main = require('../..');
var chai = require('chai');
var expect = chai.expect;

describe('The parser parses', function() {

   it('if-else expressions', function() {
      main.parse('if (TRUE) 3 else 5', function(nodes) {
         expect(nodes.length).to.equal(1);
         expect(nodes[0].type).to.equal('if');
         expect(nodes[0].test.type).to.equal('boolean');
         expect(nodes[0].then.type).to.equal('number');
         expect(nodes[0].else.type).to.equal('number');
      });
   });
   it('if expressions with no else', function() {
      main.parse('if (TRUE) 3', function(nodes) {
         expect(nodes.length).to.equal(1);
         expect(nodes[0].type).to.equal('if');
         expect(nodes[0].test.type).to.equal('boolean');
         expect(nodes[0].then.type).to.equal('number');
         expect(nodes[0].else).to.equal(undefined);
      });
   });
   it('nested if-else expressions', function() {
      main.parse('if (FALSE) if (TRUE) 6 else 10', function(nodes) {
         expect(nodes.length).to.equal(1);
         expect(nodes[0].type).to.equal('if');
         expect(nodes[0].test.type).to.equal('boolean');
         expect(nodes[0].then.type).to.equal('if');
         expect(nodes[0].then.else.type).to.equal('number');
         expect(nodes[0].else).to.equal(undefined);
      });
   });
   it('uses the correct precedence for if and if-else', function() {
      main.parse('if (TRUE) 3 else 5 + 10', function(nodes) {
         expect(nodes.length).to.equal(1);
         expect(nodes[0].type).to.equal('if');
         expect(nodes[0].test.type).to.equal('boolean');
         expect(nodes[0].then.type).to.equal('number');
         expect(nodes[0].else.type).to.equal('fun_call');
      });
      main.parse('if (TRUE) 3 + 10', function(nodes) {
         expect(nodes.length).to.equal(1);
         expect(nodes[0].type).to.equal('if');
         expect(nodes[0].test.type).to.equal('boolean');
         expect(nodes[0].then.type).to.equal('fun_call');
         expect(nodes[0].else).to.equal(undefined);
      });
   });
   it('while expressions', function() {
      main.parse('while (TRUE) 3', function(nodes) {
         expect(nodes.length).to.equal(1);
         expect(nodes[0].type).to.equal('while');
         expect(nodes[0].test.type).to.equal('boolean');
         expect(nodes[0].body.type).to.equal('number');
      });
   });
   it('for expressions', function() {
      main.parse('y = 0; for (x in 1:5) { y = y + x }; y', function(nodes) {
         expect(nodes.length).to.equal(3);
         expect(nodes[1].type).to.equal('for');
         expect(nodes[1].var).to.equal('x');
         expect(nodes[1].seq).to.be.defined;
         expect(nodes[1].body.type).to.equal('block');
      });
   });
   it('break and next expressions', function() {
      main.parse('x = 0; for (i in 1:10) { if (i < 3) next; if (i > 5) break; x=x+i; }; i; x',
         function(nodes) {
         expect(nodes.length).to.equal(4);
         expect(nodes[1].body.exprs[0].then.type).to.equal('next');
         expect(nodes[1].body.exprs[1].then.type).to.equal('break');
      });
   });
});
