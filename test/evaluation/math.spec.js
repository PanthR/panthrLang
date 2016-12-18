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
   it('abs', function() {
      var ev = main.eval('abs(-3.7); abs(5.3)');
      console.log(ev);
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.equal(3.7);
      expect(ev[1].type).to.equal('scalar');
      expect(ev[1].value.toArray()[0]).to.equal(5.3);
   });
   it('sqrt', function() {
      var ev = main.eval('sqrt(23.1); sqrt(16)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.be.closeTo(4.8062459362791667417, 1e-10);
      expect(ev[1].type).to.equal('scalar');
      expect(ev[1].value.toArray()[0]).to.equal(4);
   });
   it('floor', function() {
      var ev = main.eval('floor(-3.57); floor(3.57); floor(5)');
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.equal(-4);
      expect(ev[1].type).to.equal('scalar');
      expect(ev[1].value.toArray()[0]).to.equal(3);
      expect(ev[2].type).to.equal('scalar');
      expect(ev[2].value.toArray()[0]).to.equal(5);
   });
   it('ceiling', function() {
      var ev = main.eval('ceiling(-4.57); ceiling(2.57)');
      console.log(ev);
      expect(ev[0].type).to.equal('scalar');
      expect(ev[0].value.toArray()[0]).to.equal(-4);
      expect(ev[1].type).to.equal('scalar');
      expect(ev[1].value.toArray()[0]).to.equal(3);
   });
});
