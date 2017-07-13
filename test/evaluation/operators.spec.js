var main = require('../..');
var Expression = require('../../panthrLang/expression');
var chai = require('chai');
var expect = chai.expect;
var evalInst = main.getInitializedEvaluate();

describe('The evaluator', function() {
   it('evaluates arithmetic operations correctly', function() {
      ['5 + 2', '-23 * -2', '2.34+1.2',
       '-0.23 * 2 + 3', '-0.23 + 2 * 3'].forEach(function(expr) {
         var evs = evalInst.parseAndEval(expr);
         expect(evs.length).to.equal(1);
         expect(evs[0].type).to.equal('scalar');
         expect(evs[0].value.get(1)).to.equal(eval(expr));
      });
   });
   it('evaluates 1-arg minus function call correctly', function() {
      var evs = evalInst.parseAndEval('`-`(2)');
      expect(evs.length).to.equal(1);
      expect(evs[0].type).to.equal('scalar');
      expect(evs[0].value.get(1)).to.equal(-2);
   });
   it('evaluates powers correctly', function() {
      [['2^3', 8], ['2^3+2', 10],
       ['2^-2', 0.25], ['-2^2', -4],
       ['2^2^3', 256]
      ].forEach(function(pair) {
         var expr = pair[0];
         var value = pair[1];
         var evs = evalInst.parseAndEval(expr);
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
         var evs = evalInst.parseAndEval(expr);
         expect(evs.length).to.equal(1);
         expect(evs[0].type).to.equal('scalar');
         expect(evs[0].value.get(1)).to.equal(value);
      });
   });
   it('div and mod with divisor of 0 work correctly', function() {
      expect(evalInst.parseAndEval('5 %% 0')[0].value.get(1)).to.be.NaN;
      expect(evalInst.parseAndEval('5 %/% 0')[0].value.get(1)).to.equal(Infinity);
      expect(evalInst.parseAndEval('-5 %% 0')[0].value.get(1)).to.be.NaN;
      expect(evalInst.parseAndEval('-5 %/% 0')[0].value.get(1)).to.equal(-Infinity);
      expect(evalInst.parseAndEval('0 %% 0')[0].value.get(1)).to.be.NaN;
      expect(evalInst.parseAndEval('0 %/% 0')[0].value.get(1)).to.be.NaN;
   });
   it('evaluates pointwise logical operators', function() {
      expect(evalInst.parseAndEval('TRUE & FALSE')[0].value.get(1)).to.equal(false);
      expect(evalInst.parseAndEval('TRUE | FALSE')[0].value.get(1)).to.equal(true);
      expect(evalInst.parseAndEval('! TRUE')[0].value.get(1)).to.equal(false);
      expect(evalInst.parseAndEval('! FALSE')[0].value.get(1)).to.equal(true);
      expect(evalInst.parseAndEval('xor(TRUE, FALSE)')[0].value.get(1)).to.equal(true);
      expect(evalInst.parseAndEval('xor(TRUE, TRUE)')[0].value.get(1)).to.equal(false);
   });
   it('evaluates non-pointwise logical operators', function() {
      expect(evalInst.parseAndEval('TRUE && FALSE')[0].value.get(1)).to.equal(false);
      expect(evalInst.parseAndEval('TRUE || FALSE')[0].value.get(1)).to.equal(true);
   });
   it('evaluates backticked operators', function() {
      expect(evalInst.parseAndEval('`+`(4, 5)')[0].value.get(1)).to.equal(9);
   });
   it('extends length-one vectors as needed', function() {
      expect(evalInst.parseAndEval('1:5 + 1')[0].value.toArray()).to.deep.equal([2, 3, 4, 5, 6]);
      expect(evalInst.parseAndEval('1 - 1:3')[0].value.toArray()).to.deep.equal([0, -1, -2]);
   });
   it('evaluates comparison operators', function() {
      [
         ['1:5 > 2', [false, false, true, true, true]],
         ['1:5 >= 2', [false, true, true, true, true]],
         ['1:5 <= 2', [true, true, false, false, false]],
         ['1:5 < 2', [true, false, false, false, false]],
         ['0:5 > TRUE', [false, false, true, true, true, true]],
         ['"A" > "B"', [false]],
         ['"A" < "B"', [true]],
         ['"A" < 5', [false]],
         ['1:5 == 2', [false, true, false, false, false]],
         ['0:5 == TRUE', [false, true, false, false, false, false]],
         ['"A" == "B"', [false]],
         ['"A" == "A"', [true]],
         ['1:5 != 2', [true, false, true, true, true]],
         ['0:5 != TRUE', [true, false, true, true, true, true]],
         ['"A" != "B"', [true]],
         ['"A" != "A"', [false]]
      ].forEach(function(pair) {
         var res;

         res = evalInst.parseAndEval(pair[0])[0];
         expect(res.type).to.equal('logical');
         expect(res.value.toArray()).to.deep.equal(pair[1]);
      });
   });
   it('evaluates tilde operator', function() {
      var evs;

      evs = evalInst.parseAndEval('a~b; ~x');
      expect(evs.length).to.equal(2);

      expect(evs[0].type).to.equal('expression');
      expect(evs[0].value).to.be.instanceOf(Expression);
      expect(evs[0].value.get(1)).to.be.instanceOf(Expression.Symbol);
      expect(evs[0].value.get(1).id).to.equal('~');
      expect(evs[0].value.length()).to.equal(3);
      expect(evs[0].value.get(2).id).to.equal('a');
      expect(evs[0].value.get(3).id).to.equal('b');

      expect(evs[1].type).to.equal('expression');
      expect(evs[1].value).to.be.instanceOf(Expression);
      expect(evs[1].value.get(1)).to.be.instanceOf(Expression.Symbol);
      expect(evs[1].value.get(1).id).to.equal('~');
      expect(evs[1].value.length()).to.equal(2);
      expect(evs[1].value.get(2).id).to.equal('x');
   });
});
