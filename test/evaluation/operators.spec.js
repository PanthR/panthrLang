var main = require('../..');
var chai = require('chai');
var expect = chai.expect;

describe('The evaluator', function() {
   it('evaluates arithmetic operations correctly', function() {
      ['5 + 2', '-23 * -2', '2.34+1.2',
       '-0.23 * 2 + 3', '-0.23 + 2 * 3'].forEach(function(expr) {
         var evs = main.eval(expr);
         expect(evs.length).to.equal(1);
         expect(evs[0].type).to.equal('scalar');
         expect(evs[0].value).to.equal(eval(expr));
      });
   });
   it('evaluates powers correctly', function() {
      [['2^3', 8], ['2^3+2', 10],
       ['2^-2', 0.25], ['-2^2', -4],
       ['2^2^3', 256]
      ].forEach(function(pair) {
         var expr = pair[0];
         var value = pair[1];
         var evs = main.eval(expr);
         expect(evs.length).to.equal(1);
         expect(evs[0].type).to.equal('scalar');
         expect(evs[0].value).to.equal(value);
      });
   });
   it('evaluates div and mod correctly', function() {
      [['5 %% 3', 2], ['5 %/% 3', 1],
       ['5 %% -3', -1], ['5 %/% -3', -2],
       ['-5 %% -3', -2], ['-5 %/% -3', 1],
       ['-5 %% 3', 1], ['-5 %/% 3', -2]
      ].forEach(function(pair) {
         var expr = pair[0];
         var value = pair[1];
         var evs = main.eval(expr);
         expect(evs.length).to.equal(1);
         expect(evs[0].type).to.equal('scalar');
         expect(evs[0].value).to.equal(value);
      });
   });
   it('div and mod with divisor of 0 work correctly', function() {
      expect(main.eval('5 %% 0')[0].value).to.be.NaN;
      expect(main.eval('5 %/% 0')[0].value).to.equal(Infinity);
      expect(main.eval('-5 %% 0')[0].value).to.be.NaN;
      expect(main.eval('-5 %/% 0')[0].value).to.equal(-Infinity);
      expect(main.eval('0 %% 0')[0].value).to.be.NaN;
      expect(main.eval('0 %/% 0')[0].value).to.be.NaN;
   });
   it('evaluates pointwise logical operators', function() {
   });
});
