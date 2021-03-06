var main = require('../..');
var Base = require('panthrbase/index');
var chai = require('chai');
var expect = chai.expect;
var evalInst = main.getInitializedEvaluate();

describe('The evaluator handles standard math functions:', function() {
   it('exp', function() {
      var ev = evalInst.parseAndEval('exp(0.001)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.be.closeTo(1.0010005001667, 1e-10);
   });
   it('expm1', function() {
      var ev = evalInst.parseAndEval('expm1(0.00001)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.be.closeTo(1.0000050000166668e-5, 1e-10);
   });
   it('log', function() {
      var ev = evalInst.parseAndEval('log(2.3); log(2.3, 3)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.be.closeTo(0.83290912293510, 1e-10);
      expect(ev[1].type).to.equal('scalar');
      expect(ev[1].value.toArray()[0]).to.be.closeTo(0.75814655591088, 1e-10);

   });
   it('log10', function() {
      var ev = evalInst.parseAndEval('log10(1000)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.equal(3);
   });
   it('log2', function() {
      var ev = evalInst.parseAndEval('log2(2^(10:13))');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()).to.deep.equal([10, 11, 12, 13]);
   });
   it('log1p', function() {
      var ev = evalInst.parseAndEval('log1p(1e-5)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.be.closeTo(9.99995000033333e-6, 1e-15);
   });
   it('abs', function() {
      var ev = evalInst.parseAndEval('abs(-3.7); abs(5.3)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.equal(3.7);
      expect(ev[1].type).to.equal('scalar');
      expect(ev[1].value.toArray()[0]).to.equal(5.3);
   });
   it('sqrt', function() {
      var ev = evalInst.parseAndEval('sqrt(23.1); sqrt(16)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.be.closeTo(4.8062459362791667417, 1e-10);
      expect(ev[1].type).to.equal('scalar');
      expect(ev[1].value.toArray()[0]).to.equal(4);
   });
   it('floor', function() {
      var ev = evalInst.parseAndEval('floor(-3.57); floor(3.57); floor(5)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.equal(-4);
      expect(ev[1].type).to.equal('scalar');
      expect(ev[1].value.toArray()[0]).to.equal(3);
      expect(ev[2].type).to.equal('scalar');
      expect(ev[2].value.toArray()[0]).to.equal(5);
   });
   it('ceiling', function() {
      var ev = evalInst.parseAndEval('ceiling(-4.57); ceiling(2.57)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.equal(-4);
      expect(ev[1].type).to.equal('scalar');
      expect(ev[1].value.toArray()[0]).to.equal(3);
   });
   it('gamma', function() {
      var ev = evalInst.parseAndEval('gamma(3.4)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.be.closeTo(2.981206426810332, 1e-10);
   });
   it('lgamma', function() {
      var ev = evalInst.parseAndEval('lgamma(3.4)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.be.closeTo(1.09232805980274, 1e-10);
   });
   it('beta', function() {
      var ev = evalInst.parseAndEval('beta(b = 4, a = 3)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.be.closeTo(0.01666666666666, 1e-10);
   });
   it('lbeta', function() {
      var ev = evalInst.parseAndEval('lbeta(b = 4, a = 3)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.be.closeTo(-4.09434456222210, 1e-10);
   });
   it('lchoose', function() {
      var ev = evalInst.parseAndEval('lchoose(n = 10, k = 3)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.be.closeTo(4.7874917427820458116, 1e-10);
   });
   it('choose', function() {
      var ev = evalInst.parseAndEval('choose(n = 10, k = 3)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.equal(120);
   });
   it('factorial', function() {
      var ev = evalInst.parseAndEval('factorial(5); factorial(5.4)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.equal(120);
      expect(ev[1].type).to.equal('scalar');
      expect(ev[1].value.toArray()[0]).to.be.closeTo(240.83377998344604976, 1e-10);
   });
   it('lfactorial', function() {
      var ev = evalInst.parseAndEval('lfactorial(5)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.be.closeTo(Math.log(120), 1e-10);
   });
   it('cumsum', function() {
      var ev = evalInst.parseAndEval('cumsum(1:5)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()).to.deep.equal([1, 3, 6, 10, 15]);
   });
   it('cumprod', function() {
      var ev = evalInst.parseAndEval('cumprod(1:5)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()).to.deep.equal([1, 2, 6, 24, 120]);
   });
   it('cummax', function() {
      var ev = evalInst.parseAndEval('cummax(1:5)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()).to.deep.equal([1, 2, 3, 4, 5]);
   });
   it('cummin', function() {
      var ev = evalInst.parseAndEval('cummin(1:5)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()).to.deep.equal([1, 1, 1, 1, 1]);
   });
   it('diff', function() {
      var ev = evalInst.parseAndEval('diff(1:5)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()).to.deep.equal([1, 1, 1, 1]);
   });
});
