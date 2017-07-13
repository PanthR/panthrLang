var main = require('../..');
var Base = require('panthrbase/index');
var chai = require('chai');
var expect = chai.expect;
var evalInst = main.getInitializedEvaluate();

describe('The evaluator', function() {
   it('is accessible via eval', function() {
      expect(main).to.respondTo('eval');
      expect(function() { evalInst.parseAndEval('2'); }).to.not.throw();
   });
   it('evaluates numbers', function() {
      ['5', '23', '2.34', '0.23', '0', '0.1e-10'].forEach(function(num) {
         var evs = evalInst.parseAndEval(num);
         expect(evs.length).to.equal(1);
         expect(evs[0].type).to.equal('scalar');
         expect(evs[0].value.get(1)).to.equal(parseFloat(num));
      });
   });
   it('evaluates boolean literals', function() {
      var evs = evalInst.parseAndEval('TRUE;FALSE');
      expect(evs.length).to.equal(2);
      expect(evs[0].type).to.equal('logical');
      expect(evs[0].value.get(1)).to.equal(true);
      expect(evs[1].type).to.equal('logical');
      expect(evs[1].value.get(1)).to.equal(false);
   });
   it('evaluates string literals', function() {
      var evs = evalInst.parseAndEval('"a"; "\\\\n\\n\n"; "\\\'\\"\t"');

      expect(evs[0].type).to.equal('string');
      expect(evs[0].value.get(1)).to.equal('a');
      expect(evs[1].type).to.equal('string');
      expect(evs[1].value.get(1)).to.equal('\\n\n\n');
      expect(evs[2].type).to.equal('string');
      expect(evs[2].value.get(1)).to.equal('\'"\t');

      evs = evalInst.parseAndEval("'a'; '\\\\n\\n\n'; '\\'\\\"\t'");

      expect(evs[0].type).to.equal('string');
      expect(evs[0].value.get(1)).to.equal('a');
      expect(evs[1].type).to.equal('string');
      expect(evs[1].value.get(1)).to.equal('\\n\n\n');
      expect(evs[2].type).to.equal('string');
      expect(evs[2].value.get(1)).to.equal('\'"\t');
   });
   it('evaluates missing values', function() {
      var evs = evalInst.parseAndEval('NA;NaN');
      expect(evs.length).to.equal(2);
      expect(evs[0].type).to.equal('logical');
      expect(Base.utils.isMissing(evs[0].value.get(1))).to.be.ok;
      expect(evs[1].type).to.equal('logical');
      expect(Base.utils.isMissing(evs[1].value.get(1))).to.be.ok;
   });
   it('evaluates NULL correctly', function() {
      var evs = evalInst.parseAndEval('NULL');
      expect(evs[0].type).to.equal('null');
   });
   it('evaluates parenthetical expressions correctly', function() {
      ['-0.23 * (2 + 3)', '(-0.23 + 2) * 3'].forEach(function(expr) {
         var evs = evalInst.parseAndEval(expr);
         expect(evs.length).to.equal(1);
         expect(evs[0].type).to.equal('scalar');
         expect(evs[0].value.get(1)).to.equal(eval(expr));
      });
   });

   it('evaluates package-loading', function() {
      var evs = evalInst.parseAndEval('library(base)\n sin(3)');
      expect(evs.length).to.equal(2);
      expect(evs[1].value.toArray()).to.deep.equal([Math.sin(3)]);
   });

   it('evaluates range expressions', function() {
      var evs = evalInst.parseAndEval('1:5; 1:(2+3)');

      expect(evs.length).to.equal(2);
      evs.forEach(function(ev) {
         expect(ev.type).to.equal('scalar');
         expect(ev.value.toArray()).to.deep.equal([1, 2, 3, 4, 5]);
      });
   });

   it('evaluates concatenations', function() {
      var evs = evalInst.parseAndEval('c(1:2, 3, 9:8)');

      expect(evs.length).to.equal(1);
      expect(evs[0].type).to.equal('scalar');
      expect(evs[0].value.toArray()).to.deep.equal([1, 2, 3, 9, 8]);
   });
});
