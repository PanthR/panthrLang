var main = require('../..');
var chai = require('chai');
var expect = chai.expect;

describe('The parser parses', function() {
   it('single-bracket lvalues', function() {
      main.parse('x[3]<-5', function(nodes) {
         expect(nodes.length).to.equal(1);
         var node = nodes[0];
         expect(node.name).to.equal('assign');
         expect(node.lvalue.name).to.equal('single_bracket_access');
      });
   });
   it('double-bracket lvalues', function() {
      main.parse('x[[3]]<-5', function(nodes) {
         expect(nodes.length).to.equal(1);
         var node = nodes[0];
         expect(node.name).to.equal('assign');
         expect(node.lvalue.name).to.equal('dbl_bracket_access');
      });
   });
   it('function call lvalues', function() {
      main.parse('names(x)<-"hi"', function(nodes) {
         expect(nodes.length).to.equal(1);
         var node = nodes[0];
         expect(node.name).to.equal('assign');
         expect(node.lvalue.name).to.equal('fun_call');
      });
   });
   it('dollar-sign lvalues', function() {
      main.parse('x$d<-7', function(nodes) {
         expect(nodes.length).to.equal(1);
         var node = nodes[0];
         expect(node.name).to.equal('assign');
         expect(node.lvalue.name).to.equal('dollar_access');
      });
   });
   it('variable lvalues', function() {
      main.parse('n<-2', function(nodes) {
         expect(nodes.length).to.equal(1);
         var node = nodes[0];
         expect(node.name).to.equal('assign');
         expect(node.lvalue.name).to.equal('variable');
      });
   });
   it('complex lvalues', function() {
      main.parse('names(x)[3]<-"yes"', function(nodes) {
         expect(nodes.length).to.equal(1);
         var node = nodes[0];
         expect(node.name).to.equal('assign');
         expect(node.lvalue.name).to.equal('single_bracket_access');
         expect(node.lvalue.object.name).to.equal('fun_call');
      });
      main.parse('names(x[[3]])<-"yes"', function(nodes) {
         expect(nodes.length).to.equal(1);
         var node = nodes[0];
         expect(node.name).to.equal('assign');
         expect(node.lvalue.name).to.equal('fun_call');
         expect(node.lvalue.args[0].name).to.equal('dbl_bracket_access');
      });
   });
});
