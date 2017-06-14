var main = require('../..');
var Node = require('../../panthrLang/node');
var chai = require('chai');
var expect = chai.expect;

describe('Assignment nodes can be transformed:', function() {
   it('function calls get converted properly', function() {
      main.parse('names(x)<-5; names(x) <<- 5', function(nodes) {
         nodes.forEach(function(node) {
            var transformedNode = node.transformAssign();

            expect(transformedNode.name).to.equal(node.name);
            expect(transformedNode.lvalue.name).to.equal('variable');
            expect(transformedNode.lvalue.id).to.equal('x');
            expect(transformedNode.rvalue.name).to.equal('fun_call');
            expect(transformedNode.rvalue.fun.id).to.equal('names<-');
            expect(transformedNode.rvalue.args.length).to.equal(2);
            expect(transformedNode.rvalue.args[0]).to.equal(node.lvalue.args[0]);
            expect(transformedNode.rvalue.args[1].name).to.equal('arg_named');
            expect(transformedNode.rvalue.args[1].id).to.equal('value');
            expect(transformedNode.rvalue.args[1].value).to.equal(node.rvalue);
         });
      });

      main.parse('names(x)[3]<-5; names(x)[3]<<-5', function(nodes) {
         nodes.forEach(function(node) {
            var transformedNode = node.transformAssign();

            expect(transformedNode.name).to.equal(node.name);
            expect(transformedNode.lvalue.name).to.equal('variable');
            expect(transformedNode.lvalue.id).to.equal('x');
            expect(transformedNode.rvalue.name).to.equal('fun_call');
            expect(transformedNode.rvalue.fun.id).to.equal('names<-');
            expect(transformedNode.rvalue.args.length).to.equal(2);
            expect(transformedNode.rvalue.args[0]).to.equal(node.lvalue.args[0].args[0]);
            expect(transformedNode.rvalue.args[1].name).to.equal('arg_named');
            expect(transformedNode.rvalue.args[1].id).to.equal('value');
            expect(transformedNode.rvalue.args[1].value.name).to.equal('fun_call');
            expect(transformedNode.rvalue.args[1].value.fun.id).to.equal('[<-');
            expect(transformedNode.rvalue.args[1].value.args[0]).to.equal(node.lvalue.args[0]);
            expect(transformedNode.rvalue.args[1].value.args[1]).to.equal(node.lvalue.args[1]);
            expect(transformedNode.rvalue.args[1].value.args[2].name).to.equal('arg_named');
            expect(transformedNode.rvalue.args[1].value.args[2].id).to.equal('value');
            expect(transformedNode.rvalue.args[1].value.args[2].value).to.equal(node.rvalue);
         });
      });
   });
});
