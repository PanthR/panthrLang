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
         expect(evs[0].value.get(1)).to.equal(eval(expr));
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
         expect(evs[0].value.get(1)).to.equal(value);
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
         expect(evs[0].value.get(1)).to.equal(value);
      });
   });
   it('div and mod with divisor of 0 work correctly', function() {
      expect(main.eval('5 %% 0')[0].value.get(1)).to.be.NaN;
      expect(main.eval('5 %/% 0')[0].value.get(1)).to.equal(Infinity);
      expect(main.eval('-5 %% 0')[0].value.get(1)).to.be.NaN;
      expect(main.eval('-5 %/% 0')[0].value.get(1)).to.equal(-Infinity);
      expect(main.eval('0 %% 0')[0].value.get(1)).to.be.NaN;
      expect(main.eval('0 %/% 0')[0].value.get(1)).to.be.NaN;
   });
   it('evaluates pointwise logical operators', function() {
      expect(main.eval('TRUE & FALSE')[0].value.get(1)).to.equal(false);
      expect(main.eval('TRUE | FALSE')[0].value.get(1)).to.equal(true);
      expect(main.eval('! TRUE')[0].value.get(1)).to.equal(false);
      expect(main.eval('! FALSE')[0].value.get(1)).to.equal(true);
      expect(main.eval('xor(TRUE, FALSE)')[0].value.get(1)).to.equal(true);
      expect(main.eval('xor(TRUE, TRUE)')[0].value.get(1)).to.equal(false);
   });
   it('evaluates non-pointwise logical operators', function() {
      expect(main.eval('TRUE && FALSE')[0].value.get(1)).to.equal(false);
      expect(main.eval('TRUE || FALSE')[0].value.get(1)).to.equal(true);
   });
   it('evaluates backticked operators', function() {
      expect(main.eval('`+`(4, 5)')[0].value.get(1)).to.equal(9);
   });
   it('extends length-one vectors as needed', function() {
      expect(main.eval('1:5 + 1')[0].value.toArray()).to.deep.equal([2, 3, 4, 5, 6]);
      expect(main.eval('1 - 1:3')[0].value.toArray()).to.deep.equal([0, -1, -2]);
   });
});
