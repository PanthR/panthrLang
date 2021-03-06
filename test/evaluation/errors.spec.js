var main = require('../..');
var chai = require('chai');
var expect = chai.expect;
var evalInst = main.getInitializedEvaluate();

describe('The evaluator', function() {
   describe('errors', function() {
      it('for failed lookups', function() {
         var evs = evalInst.parseAndEval('x + y; 2 + y');
         expect(evs[0].type).to.equal('error');
         expect(evs[0].toString()).to.contain('symbol');
         expect(evs[0].toString()).to.contain('x');
         expect(evs[1].type).to.equal('error');
         expect(evs[1].toString()).to.contain('symbol');
         expect(evs[1].toString()).to.contain('y');
         expect(evs[1].toString()).to.match(/11|12|13/);
      });
      it('for dots used when not available', function() {
         var evs = evalInst.parseAndEval('f <- function(x) { f(...) }; f(5)');
         expect(evs[0].type).to.not.equal('error');
         expect(evs[1].type).to.equal('error');
         expect(evs[1].toString()).to.contain('...');
         expect(evs[1].toString()).to.match(/21|22|23|24/);
      });
      it('for named argument given twice in a call', function() {
         var evs = evalInst.parseAndEval('f <- function(x) { x }; f(x=5, x=10)');
         expect(evs[0].type).to.not.equal('error');
         expect(evs[1].type).to.equal('error');
         expect(evs[1].toString()).to.contain('occurred twice');
         expect(evs[1].toString()).to.contain('x');
         expect(evs[1].toString()).to.match(/31|32|33|34|35/);
      });
      it('for unknown packages', function() {
         var evs = evalInst.parseAndEval('library(fwegt2t)');
         expect(evs[0].type).to.equal('error');
         expect(evs[0].toString()).to.contain('package');
         expect(evs[0].toString()).to.contain('fwegt2t');
         expect(evs[0].toString()).to.match(/8|9|10|11|12|13|14|15|16/);
      });
      it('for calling non-function', function() {
         var evs = evalInst.parseAndEval('3+4; (2+3)(4)');
         expect(evs[1].type).to.equal('error');
         expect(evs[1].toString()).to.contain('non-function');
         expect(evs[1].toString()).to.match(/4|5|6|7|8|9|10/);
      });
      it('for duplicate formal parameter', function() {
         var evs = evalInst.parseAndEval('function(x, y, x) {}; function(x, ..., y, ...) {}');
         expect(evs[0].type).to.equal('error');
         expect(evs[0].toString()).to.contain('repeated formal');
         expect(evs[0].toString()).to.contain('x');
         expect(evs[1].type).to.equal('error');
         expect(evs[1].toString()).to.contain('repeated formal');
         expect(evs[1].toString()).to.contain('...');
      });
      it('for arithmetic on non-scalars', function() {
         var evs = evalInst.parseAndEval('f <- function() { x }; f + 3');
         expect(evs[1].type).to.equal('error');
         // TODO: Would be nice to recover these tests at some point
         expect(evs[1].toString()).to.contain('scalar');
         expect(evs[1].toString()).to.match(/23|24|25|26|27|28/);
      });
      it('for pointwise binary operations on incompatible vector lengths', function() {
         evalInst.parseAndEval('1:3 + 1:2; 1:3 - 1:2; 1:3 * 1:2; 1:3 / 1:2; (1:3) ^ (1:2); 1:3 %/% 1:2; 1:3 %% 1:2')
            .forEach(function(ev) {
               expect(ev.type).to.equal('error');
            });
      });
      it('for bad lhs on assignments', function() {
         evalInst.parseAndEval('1:5<-1:10').forEach(function(ev) {
            expect(ev.type).to.equal('error');
            expect(ev.toString()).to.match(/1|2|3|4|5/);
         });
      });
      it('for bad lhs on function-assignment calls', function() {
         evalInst.parseAndEval('names(3)<-1:10; names() <- 1; names(x, y) <- 1')
         .forEach(function(ev) {
            expect(ev.type).to.equal('error');
         });
      });
   });
   describe('handles parse errors', function() {
      it('for unmatched parens', function() {
         var evs = evalInst.parseAndEval('(3+(4); 3+4');
         expect(evs.length).to.equal(2);
         expect(evs[0].type).to.equal('error');
         expect(evs[1].type).to.equal('scalar');
      });
   });
});
