var main = require('..');
var Base = require('panthrbase/index');
var chai = require('chai');
var expect = chai.expect;
var Value = require('../panthrlang/value');

describe('Value objects', function() {
   describe('can be constructed via Value.wrap from', function() {
      it('an existing Value object, that is simply returned as is', function() {
         var v = new Value('something', {});
         expect(Value.wrap(v)).to.equal(v);
      });
      it('variable objects', function() {
         var w = Base.Variable([1, 3, 4]);
         var v = Value.wrap(w);
         expect(v.type).to.equal('scalar');
         expect(v.value).to.not.equal(w);
         expect(v.value.toArray()).to.deep.equal(w.toArray());
      });
      it('list objects', function() {
         var w = Base.List({ a: 1, b: 4 });
         var v = Value.wrap(w);
         expect(v.type).to.equal('list');
         expect(v.value).to.not.equal(w);
         expect(v.value.get('a')).to.equal(1);
         expect(v.value.get('b')).to.equal(4);
      });
      it('arrays', function() {
         var w = [1, 3, 4];
         var v = Value.wrap(w);
         expect(v.type).to.equal('scalar');
         expect(v.value.toArray()).to.deep.equal(w);
      });
      it('numbers, strings and booleans', function() {
         var v = Value.wrap(2);
         expect(v.type).to.equal('scalar');
         expect(v.value.toArray()).to.deep.equal([2]);

         v = Value.wrap('hi!');
         expect(v.type).to.equal('factor');
         expect(v.value.toArray()).to.deep.equal(['hi!']);

         v = Value.wrap(true);
         expect(v.type).to.equal('logical');
         expect(v.value.toArray()).to.deep.equal([true]);

         v = Value.wrap(NaN);
         expect(v.type).to.equal('scalar');
         expect(v.value.length()).to.equal(1);
      });
      it('the Value.null and value.undefined objects', function() {
         expect(Value.wrap(Value.null)).to.equal(Value.null);
         expect(Value.wrap(null)).to.equal(Value.null);
         expect(Value.wrap(undefined)).to.equal(Value.undefined);
      });
      it('appropriate functions', function() {
         var f = function() {};
         f.fun = {};
         f.env = {};
         var v = Value.wrap(f);
         expect(v.type).to.equal('closure');
         expect(v.value).to.equal(f);
         delete f.env;
         f.resolver = {};
         v = Value.wrap(f);
         expect(v.type).to.equal('builtin');
         expect(v.value).to.equal(f);
      });
      it('nothing else', function() {
         var f = function() {};
         expect(function() { Value.wrap(f); }).to.throw(Error);
         expect(function() { Value.wrap({}); }).to.throw(Error);
      });
   });
});
