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
   it('contains dnorm', function() {
      var evs = main.eval('dnorm(3, 1, 1, log=TRUE); dnorm(44:45, 50, 3); dnorm(2, mean=c(1, 5), sd=1:4)');

      expect(evs[0].type).to.equal('scalar');
      expect(evs[0].value.length()).to.equal(1);
      expect(evs[0].value.get(1)).to.be.below(0);

      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value.length()).to.equal(2);
      expect(evs[1].value.get(1)).to.be.below(evs[1].value.get(2));

      expect(evs[2].type).to.equal('scalar');
      expect(evs[2].value.length()).to.equal(4);
      expect(evs[2].value.get(1)).to.be.within(0, .5);
      expect(evs[2].value.get(2)).to.be.within(0, .5);
      expect(evs[2].value.get(3)).to.be.within(0, .5);
      expect(evs[2].value.get(4)).to.be.within(0, .5);

   });
   it('contains pnorm', function() {
      var evs = main.eval('pnorm(3, 1, 1, log=TRUE); pnorm(44:45, 50, 3, log.p=TRUE); pnorm(2, mean=c(1, 5), sd=1:4, lower.tail=FALSE)');

      expect(evs[0].type).to.equal('scalar');
      expect(evs[0].value.length()).to.equal(1);
      expect(evs[0].value.get(1)).to.be.below(0);

      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value.length()).to.equal(2);
      expect(evs[1].value.get(2)).to.be.below(0);
      expect(evs[1].value.get(1)).to.be.below(evs[1].value.get(2));

      expect(evs[2].type).to.equal('scalar');
      expect(evs[2].value.length()).to.equal(4);
      expect(evs[2].value.get(1)).to.be.below(0.5);
      expect(evs[2].value.get(2)).to.be.above(0.5);
      expect(evs[2].value.get(3)).to.be.below(0.5);
      expect(evs[2].value.get(4)).to.be.above(0.5);
   });
});
