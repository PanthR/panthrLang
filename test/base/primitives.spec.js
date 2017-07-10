var main = require('../..');
var Base = require('panthrbase/index');
var chai = require('chai');
var expect = chai.expect;

describe('Implement "missing":', function() {
   it('should return true when the parameter is missing', function() {
      var evs = main.eval('f=function(y) { missing(y) }; f()');

      expect(evs[1].type).to.equal('logical');
      expect(evs[1].value.toArray()).to.deep.equal([true]);
   });
   it('should return false when the parameter is present', function() {
      var evs = main.eval('f=function(y) { missing(y) }; f(4)');

      expect(evs[1].type).to.equal('logical');
      expect(evs[1].value.toArray()).to.deep.equal([false]);
   });
   it('should return false when the parameter has a default', function() {
      var evs = main.eval('f=function(y=4) { missing(y) }; f()');

      expect(evs[1].type).to.equal('logical');
      expect(evs[1].value.toArray()).to.deep.equal([false]);
   });
   it('should error when the name is not a parameter', function() {
      var evs = main.eval('f=function(y) { missing(x) }; f()');

      expect(evs[1].type).to.equal('error');
   });
   it('should not attempt to evaluate its argument', function() {
      var evs = main.eval('f=function(y) { missing(y) }; x=1; f((x=2)); x');

      expect(evs[3].type).to.equal('scalar');
      expect(evs[3].value.toArray()).to.deep.equal([1]);
   });
});
describe('Implement "is... primitives":', function() {
   it('is.null', function() {
      var evs = main.eval('is.null(NULL); is.null(list()); is.null(0)');

      expect(evs[0].type).to.equal('logical');
      expect(evs[0].value.toArray()).to.deep.equal([true]);
      expect(evs[1].type).to.equal('logical');
      expect(evs[1].value.toArray()).to.deep.equal([false]);
      expect(evs[2].type).to.equal('logical');
      expect(evs[2].value.toArray()).to.deep.equal([false]);
   });
});
describe('length and length<-', function() {
   it('length', function() {
      var evs = main.eval('length(NULL); length(list(x=1:5,y=1:2)); length(1:5); length(emptyenv()); length(sin); length(quote(x+y))');
      expect(evs.length).to.equal(6);
      expect(evs[0].type).to.equal('scalar');
      expect(evs[0].value.toArray()).to.deep.equal([0]);
      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value.toArray()).to.deep.equal([2]);
      expect(evs[2].type).to.equal('scalar');
      expect(evs[2].value.toArray()).to.deep.equal([5]);
      expect(evs[3].type).to.equal('scalar');
      expect(evs[3].value.toArray()).to.deep.equal([0]);
      expect(evs[4].type).to.equal('scalar');
      expect(evs[4].value.toArray()).to.deep.equal([1]);
      expect(evs[5].type).to.equal('scalar');
      expect(evs[5].value.toArray()).to.deep.equal([3]);
   });
   it('length<-', function() {
      var evs = main.eval('x=1:5; length(x)<-2; x; y=1:2; length(y)<-5; y');
      expect(evs[1].type).to.not.equal('error');
      expect(evs[4].type).to.not.equal('error');
      expect(evs[2].value.toArray()).to.deep.equal([1,2]);
      expect(evs[5].value.length()).to.equal(5);
      expect(Base.utils.isMissing(evs[5].value.get(3))).to.equal(true);
      expect(Base.utils.isMissing(evs[5].value.get(4))).to.equal(true);
      expect(Base.utils.isMissing(evs[5].value.get(5))).to.equal(true);
      expect(evs[5].value.get(1)).to.equal(1);
      expect(evs[5].value.get(2)).to.equal(2);

      evs = main.eval('x=list(a=1:3,b=4:5,c=6:8); length(x)<-2; x; y=x; length(y)<-4; y');
      expect(evs[1].type).to.not.equal('error');
      expect(evs[2].value.length()).to.equal(2);
      expect(evs[2].value.get(1).toArray()).to.deep.equal([1,2,3]);
      expect(evs[4].type).to.not.equal('error');
      expect(evs[5].value.length()).to.equal(4);
      expect(Base.utils.isMissing(evs[5].value.get(3))).to.equal(true);
      expect(Base.utils.isMissing(evs[5].value.get(4))).to.equal(true);
      expect(evs[5].value.get(1).toArray()).to.deep.equal([1,2,3]);
      expect(evs[5].value.get(2).toArray()).to.deep.equal([4,5]);
   });
});
describe('max and min', function() {
   it('work normally', function() {
      var evs = main.eval('max(1:5); min(1:5); \
         max(2:4, 1:6); min(2:4, -1:6); \
         max(); min(); \
         max(c(TRUE, FALSE, FALSE), 3:7); min(c(TRUE, FALSE, FALSE), 3:7)');
      expect(evs[0].value.get(1)).to.equal(5);
      expect(evs[1].value.get(1)).to.equal(1);
      expect(evs[2].value.get(1)).to.equal(6);
      expect(evs[3].value.get(1)).to.equal(-1);
      expect(evs[4].value.get(1)).to.equal(-Infinity);
      expect(evs[5].value.get(1)).to.equal(Infinity);
      expect(evs[6].value.get(1)).to.equal(7);
      expect(evs[7].value.get(1)).to.equal(0);
      expect(evs[0].value.length()).to.equal(1);
      expect(evs[1].value.length()).to.equal(1);
      expect(evs[2].value.length()).to.equal(1);
      expect(evs[3].value.length()).to.equal(1);
      expect(evs[4].value.length()).to.equal(1);
      expect(evs[5].value.length()).to.equal(1);
      expect(evs[6].value.length()).to.equal(1);
      expect(evs[7].value.length()).to.equal(1);
   });
   it('work with missing present and not ignored', function() {
      var evs = main.eval('x=1:4; x[10]<-3; max(x); max(x, na.rm = TRUE); min(x); min(x, na.rm = TRUE)');
      expect(Base.utils.isMissing(evs[2].value.get(1))).to.equal(true);
      expect(evs[3].value.get(1)).to.equal(4);
      expect(Base.utils.isMissing(evs[4].value.get(1))).to.equal(true);
      expect(evs[5].value.get(1)).to.equal(1);
      expect(evs[2].value.length()).to.equal(1);
      expect(evs[3].value.length()).to.equal(1);
      expect(evs[4].value.length()).to.equal(1);
      expect(evs[5].value.length()).to.equal(1);
   });
});
