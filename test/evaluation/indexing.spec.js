var main = require('../..');
var Base = require('panthrbase/index');
var chai = require('chai');
var expect = chai.expect;

describe('The evaluator', function() {
   it('evaluates dollar-sign list access', function() {
      var evs = main.eval('x <- list(a=1:3, b=2, c=TRUE); x$a; x$b; x$c; x$d');

      expect(evs.length).to.equal(5);
      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value.toArray()).to.deep.equal([1, 2, 3]);
      expect(evs[2].value.toArray()).to.deep.equal([2]);
      expect(evs[3].type).to.equal('logical');
      expect(evs[3].value.toArray()).to.deep.equal([true]);
      expect(evs[4].type).to.equal('null');
   });
   it('evaluates double-bracket list access with strings', function() {
      var evs = main.eval('x <- list(a=list(d=1:4, e=5:6), b=2); x[["a"]]; x[[c("a", "d")]]');
      expect(evs[1].type).to.equal('list');
      expect(evs[2].type).to.equal('scalar');
      expect(evs[2].value.toArray()).to.deep.equal([1, 2, 3, 4]);
   });
   it('evaluates double-bracket list access with position numbers', function() {
      var evs = main.eval('x <- list(a=list(d=1:4, e=5:6), b=2, c=TRUE); x[[1]]; x[[4]]; x[[c(1, 1)]]; x[[c(1, 2)]]');

      expect(evs.length).to.equal(5);
      expect(evs[1].type).to.equal('list');
      expect(evs[2].type).to.equal('error');
      expect(evs[3].type).to.equal('scalar');
      expect(evs[3].value.toArray()).to.deep.equal([1, 2, 3, 4]);
      expect(evs[4].type).to.equal('scalar');
      expect(evs[4].value.toArray()).to.deep.equal([5, 6]);
   });
   describe('evaluates single-bracket access of variables', function() {
      it('as a function call', function() {
         var evs = main.eval('`[`(5:1, 2); `[`(5:1, 2:3); `[`(5:1, 7); `[`(3:1,)');
         expect(evs[0].type).to.equal('scalar');
         expect(evs[0].value.toArray()).to.deep.equal([4]);
         expect(evs[1].type).to.equal('scalar');
         expect(evs[1].value.toArray()).to.deep.equal([4, 3]);
         expect(evs[2].type).to.equal('scalar');
         expect(evs[2].value.toArray().length).to.deep.equal(1);
         expect(isNaN(evs[2].value.get(1))).to.be.ok;
         expect(evs[3].type).to.equal('scalar');
         expect(evs[3].value.toArray()).to.deep.equal([3, 2, 1]);
      });
      it('with numeric indices', function() {
         var evs = main.eval('(5:1)[2]; (5:1)[2:3]; (5:1)[7]');
         expect(evs[0].type).to.equal('scalar');
         expect(evs[0].value.toArray()).to.deep.equal([4]);
         expect(evs[1].type).to.equal('scalar');
         expect(evs[1].value.toArray()).to.deep.equal([4, 3]);
         expect(evs[2].type).to.equal('scalar');
         expect(evs[2].value.toArray().length).to.deep.equal(1);
         expect(isNaN(evs[2].value.get(1))).to.be.ok;
      });
      it('with string indices', function() {
         console.log("TODO write these tests!");
      });
      it('with logical indices', function() {
         var evs = main.eval('(5:1)[c(FALSE, TRUE, TRUE, FALSE, FALSE)]');
         expect(evs[0].type).to.equal('scalar');
         expect(evs[0].value.toArray()).to.deep.equal([4, 3]);
      });
      it('with empty arguments', function() {
         var evs = main.eval('x<- 5:1; y =x[]');
         expect(evs[0].type).to.equal('scalar');
         expect(evs[0].value.toArray()).to.deep.equal([5, 4, 3, 2, 1]);
         expect(evs[1].value.toArray()).to.deep.equal([5, 4, 3, 2, 1]);
         expect(evs[0].value).to.not.equal(evs[1].value);
      });
   });
});
