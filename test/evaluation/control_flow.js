var main = require('../..');
var Base = require('panthrbase/index');
var chai = require('chai');
var expect = chai.expect;

describe('The evaluator', function() {
   it('evaluates if-else statements', function() {
      var evs = main.eval('if (TRUE) 3 else 5 + 10');
      expect(evs.length).to.equal(1);
      expect(evs[0].type).to.equal('scalar');
      expect(evs[0].value.get(1)).to.equal(3);

      evs = main.eval('if (FALSE) 10 else 3');
      expect(evs.length).to.equal(1);
      expect(evs[0].type).to.equal('scalar');
      expect(evs[0].value.get(1)).to.equal(3);
   });
   it('evaluates while statements', function() {
      // find largest Fibonacci number less than 300, should be 233
      var evs = main.eval('a=1; b=1; while(b < 300) { sum=a+b; a=b; b=sum; }\n a;');
      expect(evs[3].type).to.equal('scalar');
      expect(evs[3].value.toArray()).to.deep.equal([233]);

      evs = main.eval('a=1; b=1; while(b < 1) { sum=a+b; a=b; b=sum; }\n b;');
      expect(evs[3].type).to.equal('scalar');
      expect(evs[3].value.toArray()).to.deep.equal([1]);
   });
   it('evaluates for statements', function() {
      var evs = main.eval('y = 0; for (x in 1:5) { y = y + x }; y');
      expect(evs[2].type).to.equal('scalar');
      expect(evs[2].value.toArray()).to.deep.equal([15]);

      evs = main.eval('y = 0; for (i in 1:5) { i = 2; y = y + i }; y');
      expect(evs[2].type).to.equal('scalar');
      expect(evs[2].value.toArray()).to.deep.equal([10]);

      evs = main.eval('y = 0; for (x in list(a=1:4, b=2:5)) { y = y + x }; y');
      expect(evs[2].type).to.equal('scalar');
      expect(evs[2].value.toArray()).to.deep.equal([3, 5, 7, 9]);
   });
});
