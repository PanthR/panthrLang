var main = require('../..');
var chai = require('chai');
var expect = chai.expect;

describe('The parser parses', function() {
   it('dollar-sign list access correctly', function() {
      ['x$y', 'x$`true`'].forEach(function(expr) {
         main.parse(expr, function(nodes) {
            expect(nodes.length).to.equal(1);
            var node = nodes[0];
            expect(node.name).to.equal('dollar_access');
            expect(node.object.name).to.equal('variable');
            expect(node.index).to.be.a('string');
         });
      });
   });
});
