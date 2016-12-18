var main = require('../..');
var Base = require('panthrbase/index');
var chai = require('chai');
var expect = chai.expect;

describe('The evaluator handles standard math functions:', function() {
   it('exp', function() {
      var ev = main.eval('exp(0.001)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.be.closeTo(1.0010005001667, 1e-10);
   });
   it('expm1', function() {
      var ev = main.eval('expm1(0.00001)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.be.closeTo(1.0000050000166668e-5, 1e-10);
   });
   it('log', function() {
      var ev = main.eval('log(2.3); log(2.3, 3)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.be.closeTo(0.83290912293510, 1e-10);
      expect(ev[1].type).to.equal('scalar');
      expect(ev[1].value.toArray()[0]).to.be.closeTo(0.75814655591088, 1e-10);

   });
   it('log10', function() {
      var ev = main.eval('log10(1000)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.equal(3);
   });
   it('log2', function() {
      var ev = main.eval('log2(2^(10:13))');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()).to.deep.equal([10, 11, 12, 13]);
   });
   it('log1p', function() {
      var ev = main.eval('log1p(1e-5)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.be.closeTo(9.99995000033333e-6, 1e-15);
   });
});
