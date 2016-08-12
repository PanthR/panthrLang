var main = require('../..');
var Base = require('panthrbase/index');
var chai = require('chai');
var expect = chai.expect;

describe('The evaluator handles builtin functions:', function() {
   it('evaluates seq expressions', function() {
      [['seq(5)', [1, 2, 3, 4, 5]],
       ['seq(-2)', [1, 0, -1, -2]],
       ['seq(-2, by=3)', [-2, 1]],
       ['seq(3, 1)', [3, 2, 1]],
       ['seq(3, 7, 2)', [3, 5, 7]],
       ['seq(3, 6, 2)', [3, 5]],
       ['seq(4, along.with=2:5)', [4, 5, 6, 7]],
       ['seq(4, 5, along.with=2:6)', [4, 4.25, 4.5, 4.75, 5]],
       ['seq(4, 5, length.out=5)', [4, 4.25, 4.5, 4.75, 5]],
       ['seq(to=7, from=3)', [3, 4, 5, 6, 7]]
      ].forEach(function(pair) {
         var ev = main.eval(pair[0])[0];
         expect(ev.type).to.equal('scalar');
         expect(ev.value.toArray()).to.deep.equal(pair[1]);
      });
   });
});
