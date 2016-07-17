var main = require('../..');
var chai = require('chai');
var expect = chai.expect;

describe('The evaluator', function() {
   it('evaluates function definitions', function() {
      var evs = main.eval('function(x, y) { x + y }');
      expect(evs.length).to.equal(1);
      expect(evs[0].type).to.equal('closure');
      expect(evs[0].value).to.have.keys(['env', 'func']);
      expect(evs[0].value.func.name).to.equal('fun_def');

      evs = main.eval('function(x, y) x + y / 2');
      expect(evs.length).to.equal(1);
      expect(evs[0].type).to.equal('closure');
      expect(evs[0].value).to.have.keys(['env', 'func']);
      expect(evs[0].value.func.name).to.equal('fun_def');
   });
   it('evaluates blocks properly', function() {
      var evs = main.eval('x <- { 3 + 4\n2*3\n}\n x');
      expect(evs.length).to.equal(2);
      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value).to.equal(6);

      evs = main.eval('x <- { x<-3 + 4; 2*3\n}\n x');
      expect(evs.length).to.equal(2);
      expect(evs[1].type).to.equal('scalar');
      expect(evs[1].value).to.equal(6);
   });
   it('evaluates normal function calls properly', function() {
      var evs = main.eval('f <- function(x, y) { x + y }\n x<-4; f(2, 4); x; f(x, 4); x');
      expect(evs.length).to.equal(6);
      expect(evs[2].value).to.equal(6);
      expect(evs[3].value).to.equal(4);
      expect(evs[4].value).to.equal(8);
      expect(evs[5].value).to.equal(4);
   });
   it('evaluates named parameters in function calls properly', function() {
      var evs = main.eval('f <- function(x, y) { x / y }\n x<-4; f(y=2, 4); x; f(2, 4); x');
      expect(evs.length).to.equal(6);
      expect(evs[2].value).to.equal(4 / 2);
      expect(evs[3].value).to.equal(4);
      expect(evs[4].value).to.equal(2 / 4);
      expect(evs[5].value).to.equal(4);
   });
   it('passes dotted arguments to future calls properly', function() {
      var evs = main.eval('g <- function(y, z) { y / z }; f <- function(x, ...) { x + g(...) }\n f(y=2, 4, 6)');
      expect(evs.length).to.equal(3);
      expect(evs[2].value).to.equal(4 + 2 / 6);
   });
   it('computes default parameters properly', function() {
      var evs = main.eval('g <- function() { x <- 1; function(y, w = z + 1, z = x + 1) { w + y / z } }; x <- 5; g()(1)');
      expect(evs.length).to.equal(3);
      expect(evs[2].value).to.equal(3 + 1 / 2);
   });
});
