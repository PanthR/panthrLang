var main = require('../..');
var chai = require('chai');
var expect = chai.expect;

describe('The parser parses', function() {

   it('if-else expressions', function() {
      main.parse('if (TRUE) 3 else 5', function(nodes) {
         expect(nodes.length).to.equal(1);
         expect(nodes[0].name).to.equal('if');
         expect(nodes[0].test.name).to.equal('boolean');
         expect(nodes[0].then.name).to.equal('number');
         expect(nodes[0].else.name).to.equal('number');
      });
   });
   it('if expressions with no else', function() {
      main.parse('if (TRUE) 3', function(nodes) {
         expect(nodes.length).to.equal(1);
         expect(nodes[0].name).to.equal('if');
         expect(nodes[0].test.name).to.equal('boolean');
         expect(nodes[0].then.name).to.equal('number');
         expect(nodes[0].else.name).to.equal('null');
      });
   });
   it('nested if-else expressions', function() {
      main.parse('if (FALSE) if (TRUE) 6 else 10', function(nodes) {
         expect(nodes.length).to.equal(1);
         expect(nodes[0].name).to.equal('if');
         expect(nodes[0].test.name).to.equal('boolean');
         expect(nodes[0].then.name).to.equal('if');
         expect(nodes[0].then.else.name).to.equal('number');
         expect(nodes[0].else.name).to.equal('null');
      });
   });
   it('uses the correct precedence for if and if-else', function() {
      main.parse('if (TRUE) 3 else 5 + 10', function(nodes) {
         expect(nodes.length).to.equal(1);
         expect(nodes[0].name).to.equal('if');
         expect(nodes[0].test.name).to.equal('boolean');
         expect(nodes[0].then.name).to.equal('number');
         expect(nodes[0].else.name).to.equal('fun_call');
      });
      main.parse('if (TRUE) 3 + 10', function(nodes) {
         expect(nodes.length).to.equal(1);
         expect(nodes[0].name).to.equal('if');
         expect(nodes[0].test.name).to.equal('boolean');
         expect(nodes[0].then.name).to.equal('fun_call');
         expect(nodes[0].else.name).to.equal('null');
      });
   });
});
