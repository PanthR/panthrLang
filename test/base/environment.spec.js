var main = require('../..');
var Base = require('panthrbase/index');
var chai = require('chai');
var expect = chai.expect;

describe('Environment handling methods work:', function() {
   it('environment', function() {
      var evs = main.eval('environment()');
      expect(evs.length).to.equal(1);
      expect(evs[0].type).to.equal('env');
      expect(evs[0].value.isGlobal).to.equal(true);
   });
});
