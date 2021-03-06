var main = require('../..');
var chai = require('chai');
var expect = chai.expect;
var evalInst = main.getInitializedEvaluate();

describe('The evaluator', function() {
   it('evaluates function definitions', function() {
      var evs = evalInst.parseAndEval('function(x, y) { x + y }');
      expect(evs.length).to.equal(1);
      expect(evs[0].type).to.equal('closure');
      expect(evs[0].value).to.have.keys(['env', 'fun']);
      expect(evs[0].value.fun.type).to.equal('fun_def');

      evs = evalInst.parseAndEval('function(x, y) x + y / 2');
      expect(evs.length).to.equal(1);
      expect(evs[0].type).to.equal('closure');
      expect(evs[0].value).to.have.keys(['env', 'fun']);
      expect(evs[0].value.fun.type).to.equal('fun_def');
   });
   it('evaluates blocks properly', function() {
      var evs = evalInst.parseAndEval('x <- { 3 + 4\n2*3\n}\n x');
      expect(evs.length).to.equal(2);
      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value.get(1)).to.equal(6);

      evs = evalInst.parseAndEval('x <- { x<-3 + 4; 2*3\n}\n x');
      expect(evs.length).to.equal(2);
      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value.get(1)).to.equal(6);
   });
   it('evaluates normal function calls properly', function() {
      var evs = evalInst.parseAndEval('f <- function(x, y) { x + y }\n x<-4; f(2, 4); x; f(x, 4); x');
      expect(evs.length).to.equal(6);
      expect(evs[2].value.get(1)).to.equal(6);
      expect(evs[3].value.get(1)).to.equal(4);
      expect(evs[4].value.get(1)).to.equal(8);
      expect(evs[5].value.get(1)).to.equal(4);
   });
   it('evaluates named parameters in function calls properly', function() {
      var evs = evalInst.parseAndEval('f <- function(x, y) { x / y }\n x<-4; f(y=2, 4); x; f(2, 4); x');
      expect(evs.length).to.equal(6);
      expect(evs[2].value.get(1)).to.equal(4 / 2);
      expect(evs[3].value.get(1)).to.equal(4);
      expect(evs[4].value.get(1)).to.equal(2 / 4);
      expect(evs[5].value.get(1)).to.equal(4);
   });
   it('allows empty arguments in function calls if the empty value is not accessed', function() {
      var evs = evalInst.parseAndEval('f <- function(x, y, z) { x + z }\n f(1,, 2)');
      expect(evs.length).to.equal(2);
      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value.toArray()).to.deep.equal([3]);
   });
   it('does not allow empty arguments in function calls if the empty value is accessed', function() {
      var evs = evalInst.parseAndEval('f <- function(x, y, z) { y }\n f(1,, 2)');
      expect(evs.length).to.equal(2);
      expect(evs[1].type).to.equal('error');
   });
   it('passes dotted arguments to future calls properly', function() {
      var evs = evalInst.parseAndEval('g <- function(y, z) { y / z }; f <- function(x, ...) { x + g(...) }\n f(y=2, 4, 6)');
      expect(evs.length).to.equal(3);
      expect(evs[2].value.get(1)).to.equal(4 + 2 / 6);
   });
   it('computes default parameters properly', function() {
      var evs = evalInst.parseAndEval('g <- function() { x <- 1; function(y, w = z + 1, z = x + 1) { w + y / z } }; x <- 5; g()(1)');
      expect(evs.length).to.equal(3);
      expect(evs[2].value.get(1)).to.equal(3 + 1 / 2);
      evs = evalInst.parseAndEval('(function(x, y=z) { 2 })(3)');
      expect(evs.length).to.equal(1);
      expect(evs[0].type).to.equal('scalar');
      expect(evs[0].value.get(1)).to.equal(2);

      evs = evalInst.parseAndEval('f <- function(x, y = 4, z) { x + y + z }\n f(1,, 2)');
      expect(evs.length).to.equal(2);
      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value.toArray()).to.deep.equal([7]);
   });
   it('resolves passed parameters lazily', function() {
      var evs = evalInst.parseAndEval('g <- function(y) { }; x <- 1:3; g((x[1] = 4)); x');
      expect(evs[3].value.toArray()).to.deep.equal([1, 2, 3]);
   });
   it('resolves passed parameters at most once', function() {
      var evs = evalInst.parseAndEval('g <- function(y) { y; y }; x <- 1:3; g((x[1] = x[1]+1)); x');
      expect(evs[3].value.toArray()).to.deep.equal([2, 2, 3]);
   });
});
