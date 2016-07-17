var main = require('../..');
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
         expect(evs[0].type).to.equal('scalar');
         expect(evs[0].value).to.equal(parseFloat(num));
      });
   });
   it('evaluates boolean literals', function() {
      var evs = main.eval('TRUE;FALSE');
      expect(evs.length).to.equal(2);
      expect(evs[0].type).to.equal('logical');
      expect(evs[0].value).to.equal(true);
      expect(evs[1].type).to.equal('logical');
      expect(evs[1].value).to.equal(false);
   });
   it('evaluates parenthetical expressions correctly', function() {
      ['-0.23 * (2 + 3)', '(-0.23 + 2) * 3'].forEach(function(expr) {
         var evs = main.eval(expr);
         expect(evs.length).to.equal(1);
         expect(evs[0].type).to.equal('scalar');
         expect(evs[0].value).to.equal(eval(expr));
      });
   });
   it('evaluates assignments properly', function() {
      var evs = main.eval('x<- 3 + 4\ny = x * 5\nx+y');
      expect(evs.map(function(v) { return v.value; })).to.deep.equal([7, 35, 42]);
   });
   it('implements "<<-" assignment properly', function() {
      var evs = main.eval('g <<- 2; g; f <- function(x, y) { g <<- 5 }\n f(2, 4)\n g');
      expect(evs.length).to.equal(5);
      expect(evs[0].value).to.equal(2);
      expect(evs[1].value).to.equal(2);
      expect(evs[4].value).to.equal(5);
   });

   it('evaluates package-loading', function() {
      var evs = main.eval('library(base)\n sin(3)');
      expect(evs.length).to.equal(2);
      expect(evs[1].value.values.values).to.deep.equal([Math.sin(3)]);
   });

   it('evaluates range expressions', function() {
      var evs = main.eval('1:5; 1:(2+3)');

      expect(evs.length).to.equal(2);
      evs.forEach(function(ev) {
         expect(ev.type).to.equal('scalar');
         expect(ev.value.values.values).to.deep.equal([1, 2, 3, 4, 5]);
      });
   });
});
