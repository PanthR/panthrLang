var main = require('../..');
var Base = require('panthrbase/index');
var chai = require('chai');
var expect = chai.expect;

describe('Environment handling methods work:', function() {
   it('environment() returns current environment', function() {
      var evs = main.eval('environment()');
      expect(evs.length).to.equal(1);
      expect(evs[0].type).to.equal('env');
      expect(evs[0].value.isGlobal).to.equal(true);
   });
   it('environment(fun) returns closure\'s environment', function() {
      var evs = main.eval('f = function(){function(){}}; g = f(); \
      	environment(f); environment(g); environment()');
      var envf = evs[2];
      var envg = evs[3];
      var envcurr = evs[4];
      expect(evs.length).to.equal(5);
      expect(envf.type).to.equal('env');
      expect(envg.type).to.equal('env');
      expect(envf.value).to.not.equal(envg.value);
      expect(envf.value).to.equal(envcurr.value);
      expect(envg.value.isGlobal).to.equal(false);
   });
   it('environment(builtin) returns null', function() {
      var evs = main.eval('environment(sin)');
      var envsin = evs[0];
      expect(evs.length).to.equal(1);
      expect(envsin.type).to.equal('null');
   });
});
