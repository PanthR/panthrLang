var main = require('../..');
var Base = require('panthrbase/index');
var chai = require('chai');
var expect = chai.expect;

describe('The stats package', function() {
   it('contains rnorm', function() {
      var evs = main.eval('rnorm(5, 1, 1); rnorm(5, 50, 3); rnorm(2:5); rnorm(4, mean=c(1, 20))');

      expect(evs[0].type).to.equal('scalar');
      expect(evs[0].value.length()).to.equal(5);
      evs[0].value.each(function(v) {
         expect(v).to.be.within(1 - 5 * 1, 1 + 5 * 1);
      });

      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value.length()).to.equal(5);
      evs[1].value.each(function(v) {
         expect(v).to.be.within(50 - 5 * 3, 50 + 5 * 3);
      });

      expect(evs[2].type).to.equal('scalar');
      expect(evs[2].value.length()).to.equal(4);
      evs[2].value.each(function(v) {
         expect(v).to.be.within(0 - 5 * 1, 0 + 5 * 1);
      });
      expect(evs[3].type).to.equal('scalar');
      expect(evs[3].value.length()).to.equal(4);
      expect(evs[3].value.get(1)).to.be.within(1 - 5 * 1, 1 + 5 * 1);
      expect(evs[3].value.get(3)).to.be.within(1 - 5 * 1, 1 + 5 * 1);
      expect(evs[3].value.get(2)).to.be.within(20 - 5 * 1, 20 + 5 * 1);
      expect(evs[3].value.get(4)).to.be.within(20 - 5 * 1, 20 + 5 * 1);
   });
});
