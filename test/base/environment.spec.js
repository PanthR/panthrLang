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
   it('environment<- sets the closure\'s environment', function() {
      var evs = main.eval(
      	'f = function(){x<-10;function(){x}}; g = f(); x<-5; \
      	g(); environment(g)<-environment(); environment(g); \
      	environment(); g()');
      var envg = evs[5];
      var envcurr = evs[6];
      expect(evs.length).to.equal(8);
      expect(envg.value).to.equal(envcurr.value);
      expect(evs[3].value.toArray()).to.deep.equal([10]);
      expect(evs[7].value.toArray()).to.deep.equal([5]);
   });
   it('baseenv returns the base environment', function() {
      var evs = main.eval('baseenv()');
      var baseenv = evs[0];
      expect(baseenv.type).to.equal('env');
      expect(baseenv.value.frame).to.have.ownProperty('baseenv');
   });
   it('emptyenv returns the empty environment', function() {
      var evs = main.eval('emptyenv()');
      var emptyenv = evs[0];
      expect(emptyenv.type).to.equal('env');
      expect(emptyenv.value.getEnclosure()).to.equal(null);
   });
   it('globalenv returns the global environment', function() {
      var evs = main.eval('f <- function() { globalenv() }; f(); environment()');
      var globalenv = evs[2];
      expect(evs[1].type).to.equal('env');
      expect(evs[1].value).to.equal(globalenv.value);
   });
   it('environmentName returns the name of the environment', function() {
      var evs = main.eval('environmentName(baseenv()); f<-function() {environmentName(environment())}; f()');
      var baseName = evs[0];
      expect(baseName.type).to.equal('string');
      expect(baseName.value.get(1)).to.match(/base$/);
      expect(baseName.value.length()).to.equal(1);
      expect(evs[2].type).to.equal('string');
      expect(evs[2].value.get(1)).to.equal('');
      expect(evs[2].value.length()).to.equal(1);


   });
});
