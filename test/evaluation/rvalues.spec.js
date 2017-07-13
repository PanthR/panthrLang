var main = require('../..');
var chai = require('chai');
var expect = chai.expect;
var evalInst = main.getInitializedEvaluate();

describe('R-values', function() {
   it('are cloned before assignment', function() {
      var evs = evalInst.parseAndEval('x = 5:1; y = x; x; y');
      expect(evs[2].type).to.equal('scalar');
      expect(evs[2].value.toArray()).to.deep.equal([5, 4, 3, 2, 1]);
      expect(evs[3].value.toArray()).to.deep.equal([5, 4, 3, 2, 1]);
      expect(evs[2].value).to.not.equal(evs[3].value);

      evs = evalInst.parseAndEval('x = list(5, 1); y = x; x; y');
      expect(evs[2].type).to.equal('list');
      expect(evs[2].value.toVariable().toArray()).to.deep.equal([5, 1]);
      expect(evs[3].value.toVariable().toArray()).to.deep.equal([5, 1]);
      expect(evs[2].value).to.not.equal(evs[3].value);
   });
   it('are not cloned without assignment', function() {
      var evs = evalInst.parseAndEval('x = 5:1; y = x; x; x');
      expect(evs[2].type).to.equal('scalar');
      expect(evs[2].value.toArray()).to.deep.equal([5, 4, 3, 2, 1]);
      expect(evs[3].value.toArray()).to.deep.equal([5, 4, 3, 2, 1]);
      expect(evs[2].value).to.equal(evs[3].value);

      evs = evalInst.parseAndEval('x = list(5, 1); y = x; x; x');
      expect(evs[2].type).to.equal('list');
      expect(evs[2].value.toVariable().toArray()).to.deep.equal([5, 1]);
      expect(evs[3].value.toVariable().toArray()).to.deep.equal([5, 1]);
      expect(evs[2].value).to.equal(evs[3].value);
   });
});
