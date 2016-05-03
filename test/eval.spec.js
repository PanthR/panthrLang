var main = require('..');
var chai = require('chai');
var expect = chai.expect;

describe('The evaluator', function() {
   it('is accessible via eval', function() {
      expect(main).to.respondTo('eval');
      expect(function() { main.eval('2'); }).to.not.throw();
   });
   it('evaluates numbers', function() {
      ['5', '23', '2.34', '0.23', '0', '0.1e-10'].forEach(function(num) {
         var evs = main.eval(num);
         expect(evs.length).to.equal(1);
         expect(evs[0].type).to.equal('numeric');
         expect(evs[0].value).to.equal(parseFloat(num));
      });
   });
   it('evaluates arithmetic operations correctly', function() {
      ['5 + 2', '-23 * -2', '2.34+1.2',
       '-0.23 * 2 + 3', '-0.23 + 2 * 3'].forEach(function(expr) {
         var evs = main.eval(expr);
         expect(evs.length).to.equal(1);
         expect(evs[0].type).to.equal('numeric');
         expect(evs[0].value).to.equal(eval(expr));
      });
   });
   it('evaluates parenthetical expressions correctly', function() {
      ['-0.23 * (2 + 3)', '(-0.23 + 2) * 3'].forEach(function(expr) {
         var evs = main.eval(expr);
         expect(evs.length).to.equal(1);
         expect(evs[0].type).to.equal('numeric');
         expect(evs[0].value).to.equal(eval(expr));
      });
   });
   it('evaluates assignments properly', function() {
      var evs = main.eval('x<- 3 + 4\ny = x * 5\nx+y');
      expect(evs.map(function(v) { return v.value; })).to.deep.equal([7, 35, 42]);
   });
   it('evaluates function definitions', function() {
      var evs = main.eval('function(x, y) { x + y }');
      expect(evs.length).to.equal(1);
      expect(evs[0].type).to.equal('closure');
      expect(evs[0].value).to.have.keys(['env', 'func']);
      expect(evs[0].value.func.name).to.equal('fun_def');

      evs = main.eval('function(x, y) x + y / 2');
      expect(evs.length).to.equal(1);
      expect(evs[0].type).to.equal('closure');
      expect(evs[0].value).to.have.keys(['env', 'func']);
      expect(evs[0].value.func.name).to.equal('fun_def');
   });
   it('evaluates blocks properly', function() {
      var evs = main.eval('x <- { 3 + 4\n2*3\n}\n x');
      expect(evs.length).to.equal(2);
      expect(evs[1].type).to.equal('numeric');
      expect(evs[1].value).to.equal(6);

      evs = main.eval('x <- { x<-3 + 4; 2*3\n}\n x');
      expect(evs.length).to.equal(2);
      expect(evs[1].type).to.equal('numeric');
      expect(evs[1].value).to.equal(6);
   });
   // it('parses function calls', function() {
   //    ['f <- function(x, y) { x + y }\n f(2, 4)'].forEach(function(expr) {
   //       main.parse(expr, function(nodes) {
   //          expect(nodes.length).to.equal(2);
   //          var node = nodes[1];
   //          expect(node.name).to.equal('fun_call');
   //       });
   //    });
   // });
});
