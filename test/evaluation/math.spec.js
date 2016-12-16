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
});
