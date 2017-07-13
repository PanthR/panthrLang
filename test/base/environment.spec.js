var main = require('../..');
var Base = require('panthrbase/index');
var chai = require('chai');
var expect = chai.expect;
var evalInst = main.getInitializedEvaluate();

describe('Environment handling methods work:', function() {
   it('environment() returns current environment', function() {
      var evs = evalInst.parseAndEval('environment()');
      expect(evs.length).to.equal(1);
      expect(evs[0].type).to.equal('env');
      expect(evs[0].value.isGlobal).to.equal(true);
      expect(evs[0].value.name).to.equal('.GlobalEnv');
   });
   it('environment(fun) returns closure\'s environment', function() {
      var evs = evalInst.parseAndEval('f = function(){function(){}}; g = f(); \
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
      var evs = evalInst.parseAndEval('environment(sin)');
      var envsin = evs[0];
      expect(evs.length).to.equal(1);
      expect(envsin.type).to.equal('null');
   });
   it('environment<- sets the closure\'s environment', function() {
      var evs = evalInst.parseAndEval(
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
      var evs = evalInst.parseAndEval('baseenv()');
      var baseenv = evs[0];
      expect(baseenv.type).to.equal('env');
      expect(baseenv.value.frame).to.have.ownProperty('baseenv');
   });
   it('emptyenv returns the empty environment', function() {
      var evs = evalInst.parseAndEval('emptyenv()');
      var emptyenv = evs[0];
      expect(emptyenv.type).to.equal('env');
      expect(emptyenv.value.getEnclosure()).to.equal(null);
   });
   it('globalenv returns the global environment', function() {
      var evs = evalInst.parseAndEval('f <- function() { globalenv() }; f(); environment()');
      var globalenv = evs[2];
      expect(evs[1].type).to.equal('env');
      expect(evs[1].value).to.equal(globalenv.value);
   });
   it('environmentName returns the name of the environment', function() {
      var evs = evalInst.parseAndEval('environmentName(baseenv()); f<-function() {environmentName(environment())}; f()');
      var baseName = evs[0];
      expect(baseName.type).to.equal('string');
      expect(baseName.value.get(1)).to.match(/base$/);
      expect(baseName.value.length()).to.equal(1);
      expect(evs[2].type).to.equal('string');
      expect(evs[2].value.get(1)).to.equal('');
      expect(evs[2].value.length()).to.equal(1);
   });
   it('parent.frame returns the appropriate environment', function() {
      var evs = evalInst.parseAndEval('f = function(n=1) { parent.frame(n)}; g=function(n=1) { f(n) };\
                           g(); g(2); f(); environment()');
      expect(evs.length).to.equal(6);
      expect(evs[2].type).to.equal('env');
      expect(evs[2].value.enclosure).to.equal(evs[5].value);
      expect(evs[3].type).to.equal('env');
      expect(evs[3].value).to.equal(evs[5].value);
      expect(evs[4].type).to.equal('env');
      expect(evs[4].value).to.equal(evs[5].value);
   });
   it('new.env returns a new environment with correct enclosure', function() {
      var evs = evalInst.parseAndEval('new.env(parent=emptyenv()); new.env(); environment()');
      expect(evs.length).to.equal(3);
      expect(evs[0].type).to.equal('env');
      expect(evs[1].type).to.equal('env');
      expect(evs[0].value.enclosure.name).to.equal('.EmptyEnv');
      expect(evs[1].value.enclosure === evs[2].value).to.equal(true);
   });
   it('parent.env returns its argument\'s enclosure', function() {
      var evs = evalInst.parseAndEval('parent.env(new.env()); environment(); parent.env(baseenv()); emptyenv()');
      expect(evs.length).to.equal(4);
      expect(evs[0].type).to.equal('env');
      expect(evs[2].type).to.equal('env');
      expect(evs[0].value).to.equal(evs[1].value);
      expect(evs[2].value).to.equal(evs[3].value);
   });
   it('search returns a string variable starting and ending correctly', function() {
      var evs = evalInst.parseAndEval('search()');
      expect(evs[0].type).to.equal('string');
      var len = evs[0].value.length();
      expect(evs[0].value.get(1)).to.match(/globalenv/i);
      expect(evs[0].value.get(len)).to.match(/base/i);
   });
   it('simple assign', function() {
      var evs = evalInst.parseAndEval('assign("x", 1:2); x');
      expect(evs.length).to.equal(2);
      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value.toArray()).to.deep.equal([1,2]);
   });
   it('assign with pos = -1 or 1', function() {
      var evs = evalInst.parseAndEval('f=function(){assign("x",2:4,-1); assign("x",1:2,1); x}; f(); x');
      expect(evs.length).to.equal(3);
      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value.toArray()).to.deep.equal([2,3,4]);
      expect(evs[2].type).to.equal('scalar');
      expect(evs[2].value.toArray()).to.deep.equal([1,2]);
   });
   it('assign with pos = environment name', function() {
      var evs = main.eval('x<-1:2; assign("x",3:6,"package:base"); f=function(){x}; environment(f)<-baseenv(); f(); x');
      expect(evs.length).to.equal(6);
      expect(evs[4].type).to.equal('scalar');
      expect(evs[4].value.toArray()).to.deep.equal([3,4,5,6]);
      expect(evs[5].type).to.equal('scalar');
      expect(evs[5].value.toArray()).to.deep.equal([1,2]);
   });
   it('assign with pos = an actual environment', function() {
      var evs = evalInst.parseAndEval('env<-new.env(parent=baseenv()); x<-1:2; assign("x",3:6,env); f=function(){x}; environment(f)<-env; f(); x');
      expect(evs.length).to.equal(7);
      expect(evs[0].type).to.equal('env');
      expect(evs[0].value.hasOwnSymbol('x')).to.equal(true);
      expect(evs[5].type).to.equal('scalar');
      expect(evs[5].value.toArray()).to.deep.equal([3,4,5,6]);
      expect(evs[6].type).to.equal('scalar');
      expect(evs[6].value.toArray()).to.deep.equal([1,2]);
   });
   it('assign with inherits = TRUE', function() {
      var evs = main.eval(
         'env<-new.env(parent=baseenv()); assign("x",1:2,"package:base"); \
         assign("x",3:6,env,inherits=TRUE); assign("y",12,env,inherits=TRUE); \
         x; y; \
         f=function(){y}; g=function(){x}; \
         environment(f)<-env; environment(g)<-env; \
         f(); g()'
      );
      var x = evs[4];
      var y = evs[5];
      var callf = evs[10];
      var callg = evs[11];

      expect(evs.length).to.equal(12);
      expect(x.type).to.equal('scalar');
      expect(y.type).to.equal('scalar');
      expect(x.value.toArray()).to.deep.equal([3,4,5,6]);
      expect(y.value.toArray()).to.deep.equal([12]);
      expect(callf.type).to.equal('error');
      expect(callg.type).to.equal('scalar');
      expect(callg.value.toArray()).to.deep.equal([3,4,5,6]);
   });
   it('get with envir specified', function() {
      var evs = evalInst.parseAndEval('env <- new.env(baseenv()); \
         assign("x", 20, envir=env); \
         get("x", pos=env);\
         get("x", envir=env)');

      expect(evs[2].value.toArray()).to.deep.equal([20]);
      expect(evs[3].value.toArray()).to.deep.equal([20]);
   });
   it('get with (default) inherits=TRUE', function() {
      var evs = evalInst.parseAndEval('x <- 5; \
         f = function() { x <- 1; get("x", inherits=TRUE) }; \
         f(); \
         g = function() { get("x", inherits=TRUE) }; \
         g(); \
         h = function() { x <- 1; get("x", pos=1, inherits=TRUE) }; \
         h(); \
         c = 1:5;\
         get("c", mode="function"); \
         get("c", mode="integer"); \
         env <- new.env(baseenv()); \
         assign("x", 20, envir=env); \
         get("x", pos=env);\
         get("x", envir=env); \
      ');
      var callf = evs[2];
      var callg = evs[4];
      var callh = evs[6];

      expect(callf.type).to.equal('scalar');
      expect(callg.type).to.equal('scalar');
      expect(callh.type).to.equal('scalar');
      expect(callf.value.toArray()).to.deep.equal([1]);
      expect(callg.value.toArray()).to.deep.equal([5]);
      expect(callh.value.toArray()).to.deep.equal([5]);
      expect(evs[8].type).to.equal('builtin');
      expect(evs[9].type).to.equal('scalar');
      expect(evs[12].value.toArray()).to.deep.equal([20]);
      expect(evs[13].value.toArray()).to.deep.equal([20]);
   });
   it('get with inherits=FALSE', function() {
      var evs = main.eval('x <- 5; \
         f = function() { get("x", inherits=FALSE) }; \
         f(); \
         c = 1:5; \
         get("c", mode="function", inherits=FALSE); \
      ');

      expect(evs[2].type).to.equal('error');
      expect(evs[4].type).to.equal('error');
   });
   it('as.environment', function() {
      var evs = evalInst.parseAndEval('f=function(){as.environment(-1)}; f(); environment()');
      expect(evs.length).to.equal(3);
      expect(evs[1].value.getEnclosure()).to.equal(evs[2].value);

      evs = evalInst.parseAndEval('f=function(x=as.environment(-1)){z=as.environment(-1); \
         list(x=x,y=as.environment(-1),z=z)}; f(); \
         g=function(){f()}; g()');
      expect(evs.length).to.equal(4);
      expect(evs[1].value.get(1)).to.equal(evs[1].value.get(2));
      expect(evs[1].type).to.equal('list');
      expect(evs[1].value.get(1)).to.equal(evs[1].value.get(3));
      expect(evs[3].value.get(1)).to.equal(evs[3].value.get(2));
      expect(evs[3].type).to.equal('list');
      expect(evs[3].value.get(1)).to.equal(evs[3].value.get(3));
   });
   it('as.environment with a list argument', function() {
      var evs = evalInst.parseAndEval('as.environment(list(x=1:3, y=2:4)); emptyenv()');
      expect(evs.length).to.equal(2);
      expect(evs[0].type).to.equal('env');
      expect(evs[0].value.getEnclosure()).to.equal(evs[1].value);
      expect(evs[0].value.hasOwnSymbol('x')).to.equal(true);
      expect(evs[0].value.hasOwnSymbol('y')).to.equal(true);
      expect(evs[0].value.getOwnSymbols().length).to.equal(2);
   });
   it('list2env', function() {
      var evs = evalInst.parseAndEval('e=list2env(list(x=1:3,y=1:2)); f=list2env(list(x=2:3), parent=e); list2env(list(z=5), f); globalenv()');
      expect(evs.length).to.equal(4);
      expect(evs[0].type).to.equal('env');
      expect(evs[0].value.getEnclosure()).to.equal(evs[3].value);
      expect(evs[0].value.getOwnSymbols()).to.deep.equal(['x', 'y']);
      expect(evs[1].type).to.equal('env');
      expect(evs[1].value.getEnclosure()).to.equal(evs[0].value);
      expect(evs[1].value.getOwnSymbols()).to.deep.equal(['x', 'z']);
      expect(evs[1].value.lookup('x').value.toArray()).to.deep.equal([2, 3]);
      expect(evs[1].value.lookup('z').value.toArray()).to.deep.equal([5]);
      expect(evs[2].value).to.equal(evs[1].value);
   });
   it('exists', function() {
      var evs = evalInst.parseAndEval('exists("sin", mode = "numeric")\n\
            exists("sin", mode = "function")\n\
            sin <- 5; exists("sin", where = 2, mode = "scalar")\n\
            exists("sin", mode = "scalar")');
      expect(evs[0].type).to.equal('logical');
      expect(evs[0].value.get(1)).to.equal(false);
      expect(evs[1].type).to.equal('logical');
      expect(evs[1].value.get(1)).to.equal(true);
      expect(evs[3].type).to.equal('logical');
      expect(evs[3].value.get(1)).to.equal(false);
      expect(evs[4].type).to.equal('logical');
      expect(evs[4].value.get(1)).to.equal(true);
   });
   it('substitute', function() {
      var evs = evalInst.parseAndEval('x <- 2; substitute(x); substitute(x, list(x=2)); \
         f= function(x) { y <- 3; substitute(x+y) }; f(w)');

      expect(evs[1].type).to.equal('symbol');
      expect(evs[1].value.id).to.equal('x');
      expect(evs[2].type).to.equal('scalar');
      expect(evs[2].value.toArray()).to.deep.equal([2]);
      expect(evs[4].type).to.equal('expression');
      expect(evs[4].value.get(1).id).to.equal('+');
      expect(evs[4].value.get(2).id).to.equal('w');
      expect(evs[4].value.get(3)).to.be.instanceof(main.Expression.Value);
      expect(evs[4].value.get(3).value.value.toArray()).to.deep.equal([3]);
   });
   it('$ for environments', function() {
      var evs = evalInst.parseAndEval('g <- list2env(list(x=1:3, y=1:4)); g$x; g$`x`; g$"x"; g$z');
      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value.toArray()).to.deep.equal([1, 2, 3]);
      expect(evs[2].type).to.equal('scalar');
      expect(evs[2].value.toArray()).to.deep.equal([1, 2, 3]);
      expect(evs[3].type).to.equal('scalar');
      expect(evs[3].value.toArray()).to.deep.equal([1, 2, 3]);
      expect(evs[4].type).to.equal('null');
   });
   it('$<- for environments', function() {
      var evs = main.eval('g <- list2env(list(x=1:3, y=1:4)); g$x <- 4:6; g$x; g$z <- 1:3; g$z');
      expect(evs[2].type).to.equal('scalar');
      expect(evs[2].value.toArray()).to.deep.equal([4, 5, 6]);
      expect(evs[4].type).to.equal('scalar');
      expect(evs[4].value.toArray()).to.deep.equal([1, 2, 3]);
   });
   it('[[ for environments', function() {
      var evs = evalInst.parseAndEval('g <- list2env(list(x=1:3, y=1:4)); g[["x"]]; z<-"x"; g[[z]]; f[[c("x", "y")]]');
      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value.toArray()).to.deep.equal([1, 2, 3]);
      expect(evs[3].type).to.equal('scalar');
      expect(evs[3].value.toArray()).to.deep.equal([1, 2, 3]);
      expect(evs[4].type).to.equal('error');
   });
   it('[[<- for environments', function() {
      var evs = main.eval('g <- list2env(list(x=1:3, y=1:4)); g[["x"]] <- 4:6; g$x; g[["z"]] <- 1:3; g$z');
      expect(evs[2].type).to.equal('scalar');
      expect(evs[2].value.toArray()).to.deep.equal([4, 5, 6]);
      expect(evs[4].type).to.equal('scalar');
      expect(evs[4].value.toArray()).to.deep.equal([1, 2, 3]);
   });
});
