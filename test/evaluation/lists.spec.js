var main = require('../..');
var Base = require('panthrbase/index');
var chai = require('chai');
var expect = chai.expect;
var evalInst = main.getInitializedEvaluate();

describe('The evaluator handles list-related tasks:', function() {
   describe('has a list function', function() {
      it('whose components are the passed elements', function() {
         var ev = evalInst.parseAndEval('list(a=1:3, 2:3, c=4)')[0];
         expect(ev.type).to.equal('list');
         expect(ev.value.length()).to.equal(3);
         expect(ev.value.names(1)).to.equal('a');
         expect(ev.value.get('a').toArray()).to.deep.equal([1, 2, 3]);
         expect(ev.value.get(2).toArray()).to.deep.equal([2, 3]);
         expect(ev.value.get('c').toArray()).to.deep.equal([4]);
      });
      it('that clones the passed elements', function() {
         var evs = evalInst.parseAndEval('b = 1:3; list(a=b, c=b)');
         expect(evs[1].type).to.equal('list');
         expect(evs[1].value.get('a')).to.not.equal(evs[1].value.get('c'));
      });
      it('that clones nested lists', function() {
         var evs = evalInst.parseAndEval('c=1:4; b = list(c=c); list(a=b, c=b)');
         expect(evs[2].type).to.equal('list');
         expect(evs[2].value.get('a')).to.not.equal(evs[2].value.get('c'));
         expect(evs[2].value.get('a').get('c')).to.not.equal(evs[0].value);
      });
   });
});
