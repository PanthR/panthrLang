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
});
