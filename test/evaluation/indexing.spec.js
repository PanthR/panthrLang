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
      // console.log(evs[4]);
      expect(evs[4].type).to.equal('error');
   });
   // TODO -- need to implement strings first
   // it('evaluates double-bracket list access with strings', function() {
   //    var evs = main.eval('x <- list(a=1:3, b=2, c=TRUE); x[["a"]]; x[["b"]]; x[["c"]]; x[["d"]]');

   //    // tests here
   // });
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
});
