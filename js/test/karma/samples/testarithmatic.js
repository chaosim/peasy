var exports, module, require, _ref;

if (typeof window === 'object') {
  _ref = twoside('/test/karma/testarithmatic'), require = _ref.require, exports = _ref.exports, module = _ref.module;
}

(function(require, exports, module) {
  var arithmatic, parse;
  parse = (arithmatic = require('../../../samples/arithmatic')).parse;
  console.log(arithmatic);
  describe("run samples/testarithmatic:", function() {
    return it('', function() {});
  });
  return describe("parse", function() {
    return it("parse @) shold throw error", function() {
      return expect(parse('1')).toBe(1);
    });
  });
})(require, exports, module);
