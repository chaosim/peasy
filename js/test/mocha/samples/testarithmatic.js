var exports, module, require, _ref;

if (typeof window === 'object') {
  _ref = twoside('/test/mocha/samples/testarithmatic'), require = _ref.require, exports = _ref.exports, module = _ref.module;
}

(function(require, exports, module) {
  var arithmatic, chai, expect, parse, parse1, _ref1;
  chai = require('chai');
  expect = chai.expect;
  _ref1 = arithmatic = require('../../../samples/arithmatic'), parse = _ref1.parse, parse1 = _ref1.parse1;
  describe("run samples/testarithmatic:", function() {
    return it('', function() {});
  });
  return describe("arithmatic", function() {
    it("parse 1", function() {
      return expect(parse('1')).to.equal('1');
    });
    it("parse 1+1", function() {
      return expect(parse('1+1')).to.equal('1+1');
    });
    it("parse 1+1*1", function() {
      return expect(parse('1+1*1')).to.equal('1+1*1');
    });
    it("parse 1*1+1", function() {
      return expect(parse('1*1+1')).to.equal('1*1+1');
    });
    it("parse 1*1", function() {
      return expect(parse('1*1')).to.equal('1*1');
    });
    it("parse 1*1*1", function() {
      return expect(parse('1*1*1')).to.equal('1*1*1');
    });
    it("parse (1*1)", function() {
      return expect(parse('(1*1)')).to.equal('(1*1)');
    });
    it("parse (1*1)", function() {
      return expect(parse('(1*1)')).to.equal('(1*1)');
    });
    it("parse a=1", function() {
      return expect(parse('a=1')).to.equal('a=1');
    });
    it.only("parse a  = 1", function() {
      return expect(parse('a  = 1')).to.equal('a=1');
    });
    it.only("parse a  = b = 1", function() {
      return expect(parse('a  = b = 1')).to.equal('a=b=1');
    });
    return it("parse1 1", function() {
      expect(parse1('1')).to.equal('1');
      expect(parse1('3')).to.equal('3');
      return expect(parse1('2')).to.equal(void 0);
    });
  });
})(require, exports, module);
