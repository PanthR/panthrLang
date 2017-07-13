var main = require('../..');
var Base = require('panthrbase/index');
var chai = require('chai');
var expect = chai.expect;
var evalInst = main.getInitializedEvaluate();

describe('The stats package', function() {
   it('contains rnorm', function() {
      var evs = evalInst.parseAndEval('rnorm(5, 1, 1); rnorm(5, 50, 3); rnorm(2:5); rnorm(4, mean=c(1, 20))');

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
      var evs = evalInst.parseAndEval('dnorm(3, 1, 1, log=TRUE); dnorm(44:45, 50, 3); dnorm(2, mean=c(1, 5), sd=1:4)');

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
      var evs = evalInst.parseAndEval('pnorm(3, 1, 1, log.p=TRUE); pnorm(44:45, 50, 3, log.p=TRUE); pnorm(2, mean=c(1, 5), sd=1:4, lower.tail=FALSE)');

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
   it('contains qnorm', function() {
      var evs = evalInst.parseAndEval('qnorm(-3, 1, 1, log.p=TRUE); qnorm(-2:-1, 50, 3, log.p=TRUE); qnorm(.2, mean=c(1, 5), sd=1:4, lower.tail=FALSE)');

      expect(evs[0].type).to.equal('scalar');
      expect(evs[0].value.length()).to.equal(1);
      expect(evs[0].value.get(1)).to.be.below(0);

      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value.length()).to.equal(2);
      expect(evs[1].value.get(2)).to.be.within(44, 50);
      expect(evs[1].value.get(1)).to.be.within(44, 50);
      expect(evs[1].value.get(1)).to.be.below(evs[1].value.get(2));

      expect(evs[2].type).to.equal('scalar');
      expect(evs[2].value.length()).to.equal(4);
      expect(evs[2].value.get(1)).to.be.below(5);
      expect(evs[2].value.get(2)).to.be.above(5);
      expect(evs[2].value.get(3)).to.be.below(5);
      expect(evs[2].value.get(4)).to.be.above(5);
   });


   // unif //
   it('contains runif', function() {
      var evs = evalInst.parseAndEval('runif(5); runif(5, 3, 5); runif(2:5); runif(4, min = 1:5, max = 10)');

      expect(evs[0].type).to.equal('scalar');
      expect(evs[0].value.length()).to.equal(5);
      evs[0].value.each(function(v) {
         expect(v).to.be.within(0, 1);
      });

      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value.length()).to.equal(5);
      evs[1].value.each(function(v) {
         expect(v).to.be.within(3, 5);
      });

      expect(evs[2].type).to.equal('scalar');
      expect(evs[2].value.length()).to.equal(4);
      evs[2].value.each(function(v) {
         expect(v).to.be.within(0 - 5 * 1, 0 + 5 * 1);
      });
      expect(evs[3].type).to.equal('scalar');
      expect(evs[3].value.length()).to.equal(4);
      expect(evs[3].value.get(1)).to.be.within(1, 10);
      expect(evs[3].value.get(2)).to.be.within(2, 10);
      expect(evs[3].value.get(3)).to.be.within(3, 10);
      expect(evs[3].value.get(4)).to.be.within(4, 10);
   });
   it('contains dunif', function() {
      var evs = evalInst.parseAndEval('dunif(3, 1, 2, log=TRUE); dunif(44:45, 40, 50); dunif(2, min = 1:4, max = 3)');

      expect(evs[0].type).to.equal('scalar');
      expect(evs[0].value.length()).to.equal(1);
      expect(evs[0].value.get(1)).to.equal(-Infinity);

      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value.length()).to.equal(2);
      expect(evs[1].value.get(1)).to.be.closeTo(.1, .001);
      expect(evs[1].value.get(1)).to.equal(evs[1].value.get(2));

      expect(evs[2].type).to.equal('scalar');
      expect(evs[2].value.length()).to.equal(4);
      expect(evs[2].value.get(1)).to.be.closeTo(.5, .001);
      expect(evs[2].value.get(2)).closeTo(1, .001);
      expect(Base.utils.isMissing(evs[2].value.get(3))).to.be.true;
      expect(Base.utils.isMissing(evs[2].value.get(4))).to.be.true;
   });
   it('contains punif', function() {
      var evs = evalInst.parseAndEval('punif(3, 1, 2, log.p=TRUE); punif(44:45, 40, 50); punif(2, min = 1:4, max = 3, lower.tail=FALSE)');

      expect(evs[0].type).to.equal('scalar');
      expect(evs[0].value.length()).to.equal(1);
      expect(evs[0].value.get(1)).to.equal(0);

      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value.length()).to.equal(2);
      expect(evs[1].value.get(2)).to.equal(.5);
      expect(evs[1].value.get(1)).to.equal(.4);

      expect(evs[2].type).to.equal('scalar');
      expect(evs[2].value.length()).to.equal(4);
      expect(evs[2].value.get(1)).to.equal(0.5);
      expect(evs[2].value.get(2)).to.equal(1);
      expect(evs[2].value.get(3)).to.equal(1);
      expect(Base.utils.isMissing(evs[2].value.get(4))).to.be.true;
   });
   it('contains qunif', function() {
      var evs = evalInst.parseAndEval('qunif(-.7, 1, 2, log.p=TRUE); qunif(c(.2, .3), 40, 50); qunif(.75, min = 1:4, max = 3, lower.tail=FALSE)');

      expect(evs[0].type).to.equal('scalar');
      expect(evs[0].value.length()).to.equal(1);
      expect(evs[0].value.get(1)).to.be.within(1.4, 1.6);

      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value.length()).to.equal(2);
      expect(evs[1].value.get(2)).to.be.within(40, 45);
      expect(evs[1].value.get(1)).to.be.within(40, 45);
      expect(evs[1].value.get(1)).to.be.below(evs[1].value.get(2));

      expect(evs[2].type).to.equal('scalar');
      expect(evs[2].value.length()).to.equal(4);
      expect(evs[2].value.get(1)).to.equal(1.5);
      expect(evs[2].value.get(2)).to.equal(2.25);
      expect(evs[2].value.get(3)).to.equal(3);
      expect(Base.utils.isMissing(evs[2].value.get(4))).to.be.true;
   });

   // beta //
   describe('The beta distribution r/d/p/q functions', function() {
      it('error if values for shape1 and shape2 are not provided', function() {
         var evs = evalInst.parseAndEval('rbeta(3, shape1=2); dbeta(x=.5, shape2=2); pbeta(.5); qbeta(.5)');

         expect(evs[0].type).to.equal('error');
         expect(evs[1].type).to.equal('error');
         expect(evs[2].type).to.equal('error');
         expect(evs[3].type).to.equal('error');
      });

      it('do not error when called correctly', function() {
         var evs = evalInst.parseAndEval('rbeta(3, shape2=2, shape1=3); dbeta(x=.5, shape2=2, shape1=3); pbeta(.5, shape2=2, shape1=3); qbeta(.5, shape2=2, shape1=3)');

         expect(evs[0].type).to.equal('scalar');
         expect(evs[1].type).to.equal('scalar');
         expect(evs[2].type).to.equal('scalar');
         expect(evs[3].type).to.equal('scalar');
         expect(evs[0].value.get(1)).to.be.within(0, 1);
         expect(evs[1].value.get(1)).to.be.closeTo(1.5, .001);
         expect(evs[2].value.get(1)).to.be.closeTo(.3125, .001);
         expect(evs[3].value.get(1)).to.be.within(.61, .62);
      });
   });

   // gamma //
   describe('The gamma distribution r/d/p/q functions', function() {
      it('error if value for shape is not provided', function() {
         var evs = evalInst.parseAndEval('rgamma(3); dgamma(x=.5); pgamma(.5); qgamma(.5)');

         expect(evs[0].type).to.equal('error');
         expect(evs[1].type).to.equal('error');
         expect(evs[2].type).to.equal('error');
         expect(evs[3].type).to.equal('error');
      });

      it('do not error when called correctly', function() {
         var evs = evalInst.parseAndEval('rgamma(3, shape=3, rate=2); dgamma(x=.5, scale = .5, shape=3); pgamma(.5, shape=3); qgamma(.5, shape=3)');

         expect(evs[0].type).to.equal('scalar');
         expect(evs[1].type).to.equal('scalar');
         expect(evs[2].type).to.equal('scalar');
         expect(evs[3].type).to.equal('scalar');
         expect(evs[1].value.get(1)).to.be.closeTo(0.36788, .001);
         expect(evs[2].value.get(1)).to.be.closeTo(.01439, .001);
         expect(evs[3].value.get(1)).to.be.closeTo(2.674, .001);
      });
   });
   // t //
   describe('The t distribution r/d/p/q functions', function() {
      it('error if value for df is not provided', function() {
         var evs = evalInst.parseAndEval('rt(3); dt(x=.5); pt(.5); qt(.5)');

         expect(evs[0].type).to.equal('error');
         expect(evs[1].type).to.equal('error');
         expect(evs[2].type).to.equal('error');
         expect(evs[3].type).to.equal('error');
      });

      it('do not error when called correctly', function() {
         var evs = evalInst.parseAndEval('rt(3, df=3); dt(x=.5, df=3); pt(.5, 3); qt(.7, df=3)');

         expect(evs[0].type).to.equal('scalar');
         expect(evs[1].type).to.equal('scalar');
         expect(evs[2].type).to.equal('scalar');
         expect(evs[3].type).to.equal('scalar');
         expect(evs[1].value.get(1)).to.be.closeTo(0.31318, .001);
         expect(evs[2].value.get(1)).to.be.closeTo(.6742, .001);
         expect(evs[3].value.get(1)).to.be.closeTo(.58439, .001);
      });
   });
   // chisq //
   describe('The chisq distribution r/d/p/q functions', function() {
      it('error if value for df is not provided', function() {
         var evs = evalInst.parseAndEval('rchisq(3); dchisq(x=.5); pchisq(.5); qchisq(.5)');

         expect(evs[0].type).to.equal('error');
         expect(evs[1].type).to.equal('error');
         expect(evs[2].type).to.equal('error');
         expect(evs[3].type).to.equal('error');
      });

      it('do not error when called correctly', function() {
         var evs = evalInst.parseAndEval('rchisq(3, df=3); dchisq(x=.5, df=3); pchisq(.5, 3); qchisq(.7, df=3)');

         expect(evs[0].type).to.equal('scalar');
         expect(evs[1].type).to.equal('scalar');
         expect(evs[2].type).to.equal('scalar');
         expect(evs[3].type).to.equal('scalar');
         expect(evs[1].value.get(1)).to.be.closeTo(0.21969, .001);
         expect(evs[2].value.get(1)).to.be.closeTo(.0811, .001);
         expect(evs[3].value.get(1)).to.be.closeTo(3.6649, .001);
      });
   });
   // binom //
   describe('The binom distribution r/d/p/q functions', function() {
      it('error if values for size and prob are not provided', function() {
         var evs = evalInst.parseAndEval('rbinom(3, size = 8); dbinom(x=.5, prob = .2); pbinom(.5); qbinom(.5)');

         expect(evs[0].type).to.equal('error');
         expect(evs[1].type).to.equal('error');
         expect(evs[2].type).to.equal('error');
         expect(evs[3].type).to.equal('error');
      });

      it('do not error when called correctly', function() {
         var evs = evalInst.parseAndEval('rbinom(3, 8, .25); dbinom(x=3, 8, .25); pbinom(3, 8, .25); qbinom(.7, 8, .25)');

         expect(evs[0].type).to.equal('scalar');
         expect(evs[1].type).to.equal('scalar');
         expect(evs[2].type).to.equal('scalar');
         expect(evs[3].type).to.equal('scalar');
         expect(evs[1].value.get(1)).to.be.closeTo(0.20764, .001);
         expect(evs[2].value.get(1)).to.be.closeTo(.88618, .001);
         expect(evs[3].value.get(1)).to.be.closeTo(3, .001);
      });
   });
   // pois //
   describe('The pois distribution r/d/p/q functions', function() {
      it('error if value for lambda is not provided', function() {
         var evs = evalInst.parseAndEval('rpois(3); dpois(x=.5); ppois(.5); qpois(.5)');

         expect(evs[0].type).to.equal('error');
         expect(evs[1].type).to.equal('error');
         expect(evs[2].type).to.equal('error');
         expect(evs[3].type).to.equal('error');
      });

      it('do not error when called correctly', function() {
         var evs = evalInst.parseAndEval('rpois(3, .5); dpois(x=3, lambda=.5); ppois(3, .5); qpois(.7, .5)');

         expect(evs[0].type).to.equal('scalar');
         expect(evs[1].type).to.equal('scalar');
         expect(evs[2].type).to.equal('scalar');
         expect(evs[3].type).to.equal('scalar');
         expect(evs[1].value.get(1)).to.be.closeTo(0.0126, .001);
         expect(evs[2].value.get(1)).to.be.closeTo(.9982, .001);
         expect(evs[3].value.get(1)).to.be.closeTo(1, .001);
      });
   });
   // geom //
   describe('The geom distribution r/d/p/q functions', function() {
      it('error if value for prob is not provided', function() {
         var evs = evalInst.parseAndEval('rgeom(3); dgeom(x=.5); pgeom(.5); qgeom(.5)');

         expect(evs[0].type).to.equal('error');
         expect(evs[1].type).to.equal('error');
         expect(evs[2].type).to.equal('error');
         expect(evs[3].type).to.equal('error');
      });

      it('do not error when called correctly', function() {
         var evs = evalInst.parseAndEval('rgeom(3, .2); dgeom(x=3, prob=.2); pgeom(3, .2); qgeom(.7, .2)');

         expect(evs[0].type).to.equal('scalar');
         expect(evs[1].type).to.equal('scalar');
         expect(evs[2].type).to.equal('scalar');
         expect(evs[3].type).to.equal('scalar');
         expect(evs[1].value.get(1)).to.be.closeTo(0.1024, .001);
         expect(evs[2].value.get(1)).to.be.closeTo(.5904, .001);
         expect(evs[3].value.get(1)).to.be.closeTo(5, .001);
      });
   });
   // exp //
   describe('The exp distribution r/d/p/q functions', function() {
      it('error if no parameter is provided', function() {
         var evs = evalInst.parseAndEval('rexp(); dexp(); pexp(); qexp()');

         expect(evs[0].type).to.equal('error');
         expect(evs[1].type).to.equal('error');
         expect(evs[2].type).to.equal('error');
         expect(evs[3].type).to.equal('error');
      });

      it('do not error when called correctly', function() {
         var evs = evalInst.parseAndEval('rexp(3, .2); dexp(x=3); pexp(3, .2); qexp(.7, .2)');

         expect(evs[0].type).to.equal('scalar');
         expect(evs[1].type).to.equal('scalar');
         expect(evs[2].type).to.equal('scalar');
         expect(evs[3].type).to.equal('scalar');
         expect(evs[1].value.get(1)).to.be.closeTo(0.04978, .001);
         expect(evs[2].value.get(1)).to.be.closeTo(.4512, .001);
         expect(evs[3].value.get(1)).to.be.closeTo(6.0198, .001);
      });
   });
});
