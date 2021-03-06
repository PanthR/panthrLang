var main = require('../..');
var Base = require('panthrbase/index');
var chai = require('chai');
var expect = chai.expect;
var evalInst = main.getInitializedEvaluate();

describe('The evaluator', function() {
   it('evaluates variable assignments properly', function() {
      var evs = evalInst.parseAndEval('x<- 3 + 4\ny = x * 5\nx+y');
      expect(evs.map(function(v) { return v.value.get(1); })).to.deep.equal([7, 35, 42]);
   });
   it('implements "<<-" assignment properly', function() {
      var evs = evalInst.parseAndEval('g <<- 2; g; f <- function(x, y) { g <- 10; g <<- 5; g }\n f(2, 4)\n g');
      expect(evs.length).to.equal(5);
      expect(evs[0].value.get(1)).to.equal(2);
      expect(evs[1].value.get(1)).to.equal(2);
      expect(evs[3].value.get(1)).to.equal(10);
      expect(evs[4].value.get(1)).to.equal(5);

      evs = evalInst.parseAndEval('f = function() { x <<- 1:4; x <- 3; x[x] <<-6 }; f(); x');
      expect(evs.length).to.equal(3);
      expect(evs[2].value.toArray()).to.deep.equal([1, 2, 6, 4]);

      evs = evalInst.parseAndEval('x = list(g=list(g=3)); \
         f = function() {x = "g"; x[[x]][[x]]<<-6}; f(); x$g$g; \
         f = function() {x = "g"; x[x][[x]][[x]]<<-8}; f(); x$g$g; \
         f = function() {x = "g"; x[[x]][x][[x]]<<-10}; f(); x$g$g');
      expect(evs[2].type).to.not.equal('error');
      expect(evs[3].value.toArray()).to.deep.equal([6]);
      expect(evs[5].type).to.not.equal('error');
      expect(evs[6].value.toArray()).to.deep.equal([8]);
      expect(evs[8].type).to.not.equal('error');
      expect(evs[9].value.toArray()).to.deep.equal([10]);

      evs = evalInst.parseAndEval('f = function() { x<-10; x<<-12; `names<-`<-function(x, value) { 3 }; names(x)<<-"hi"; names(x) <- "ho"; x }; f(); x; x <- 3; names(x) <- "hi"; x');
      expect(evs[1].value.toArray()).to.deep.equal([3]);
      expect(Base.utils.isMissing(evs[1].value.names())).to.be.ok;
      expect(evs[2].value.toArray()).to.deep.equal([3]);
      expect(Base.utils.isMissing(evs[2].value.names())).to.be.ok;
      expect(evs[1].value).to.not.equal(evs[2].value);
      expect(evs[5].value.toArray()).to.deep.equal([3]);
      expect(evs[5].value.names().toArray()).to.deep.equal(["hi"]);
   });
   it('evaluates [[-[-[[ assignment chain correctly', function() {
      var evs = evalInst.parseAndEval('x = list(g=list(g=3)); \
         f = function() {x = "g"; x[[x]][x][[x]]<<-10}; f(); x$g$g');
      expect(evs[2].type).to.not.equal('error');
      expect(evs[3].value.toArray()).to.deep.equal([10]);
   });
   it('evaluates combination of function call and [ assignment correctly', function() {
      var evs = evalInst.parseAndEval('x = 1:2; names(x)[2] <-"b"; names(x)[2]');
      expect(evs[1].type).to.not.equal('error');
      expect(evs[2].value.toArray()).to.deep.equal(['b']);

      evs = evalInst.parseAndEval('x = list(g=1:2); names(x$g)[2] <-"b"; names(x$g)[2]');
      expect(evs[1].type).to.not.equal('error');
      expect(evs[2].value.toArray()).to.deep.equal(['b']);

      evs = evalInst.parseAndEval('x = list(g=1:2); \
         f = function() {x = "foo"; names(x$g)[2] <<-"b" }; f(); names(x$g)[2]');
      expect(evs[2].type).to.not.equal('error');
      expect(evs[3].value.toArray()).to.deep.equal(['b']);

      evs = evalInst.parseAndEval('x = list(g=1:2); \
         f = function() {x = "g"; names(x[[x]])[2] <<-"b" }; f(); names(x$g)[2]');
      expect(evs[2].type).to.not.equal('error');
      expect(evs[3].value.toArray()).to.deep.equal(['b']);
   });
   it('evaluates single-bracket lvalue assignment properly', function() {
      var evs = evalInst.parseAndEval('x<-1:4; x[2]<-6; x[2]; x');
      expect(evs.length).to.equal(4);
      expect(evs[1].type).to.equal('scalar');
      expect(evs[2].value.toArray()).to.deep.equal([6]);
      expect(evs[3].value.toArray()).to.deep.equal([1, 6, 3, 4]);
      evs = evalInst.parseAndEval('x<-1:4; x[2:4]<-1:3; x');
      expect(evs[1].value.toArray()).to.deep.equal([1, 2, 3]);
      expect(evs[2].value.toArray()).to.deep.equal([1, 1, 2, 3]);
      // TODO
      // add more tests after deciding about setting out-of-bounds
      // in PanthrBase.Variable
   });
   it('evaluates double-bracket lvalue assignment properly', function() {
      var evs = evalInst.parseAndEval('x<-list(a=1:4, b=3:5); x[[2]]<-6; x[[2]]; x');
      expect(evs.length).to.equal(4);
      expect(evs[2].value.toArray()).to.deep.equal([6]);
      expect(evs[3].value.names().toArray()).to.deep.equal(['a', 'b']);
   });
   it('evaluates dollar sign lvalue assignment properly', function() {
      var evs = evalInst.parseAndEval('x<-list(a=1:4, b=3:5); x$b<-6; x$b; x');
      expect(evs.length).to.equal(4);
      expect(evs[2].value.toArray()).to.deep.equal([6]);
      expect(evs[3].value.names().toArray()).to.deep.equal(['a', 'b']);
   });
   it('evaluates function lvalue assignment properly', function() {
      var evs = evalInst.parseAndEval('x<-list(a=1:4, b=3:5); names(x)<-c("A", "B"); x');
      expect(evs.length).to.equal(3);
      expect(evs[1].type).to.equal('string');
      expect(evs[1].value.toArray()).to.deep.equal(["A", "B"]);
      expect(evs[2].value.names().toArray()).to.deep.equal(['A', 'B']);
   });
   it('evaluates function lvalue assignment with custom function', function() {
      var evs = evalInst.parseAndEval('`ours<-` <- function(x, value) { value }; x<-1:5; ours(x)<-3:4; x');
      expect(evs[3].value.toArray()).to.deep.equal([3, 4]);
   });
   it('evaluates single-bracket assignment with empty argument correctly', function() {
      var evs = evalInst.parseAndEval('x<-list(a=1:5, b=2:4); x[] <- list(c=1:2, d=1:3); x');
      expect(evs[2].type).to.equal('list');
      expect(evs[2].value.length()).to.equal(2);
      expect(evs[2].value.names().toArray()).to.deep.equal(['a', 'b']);
      expect(evs[2].value.get(1).toArray()).to.deep.equal([1, 2]);
      expect(evs[2].value.get(2).toArray()).to.deep.equal([1, 2, 3]);
   });
   it('evaluates single-bracket assignment with index out of range correctly', function() {
      var evs = evalInst.parseAndEval('x<-list(a=1:5, b=2:4); x[3] <- list(c=1:2); x');
      expect(evs[2].type).to.equal('list');
      expect(evs[2].value.length()).to.equal(3);
      expect(evs[2].value.get(3).toArray()).to.deep.equal([1, 2]);
   });
});
