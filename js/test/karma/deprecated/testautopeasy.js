var exports, module, require, _ref;

if (typeof window === 'object') {
  _ref = twoside('/test/karma/deprecated/testautopeasy'), require = _ref.require, exports = _ref.exports, module = _ref.module;
}

(function(require, exports, module) {
  var a, autoComputeLeftRecursives, b, char, hasOwnProperty, initialize, p, parse1, parse2, parse3, parser, x, _ref1;
  _ref1 = parser = p = require("../../../deprecated/autopeasy"), char = _ref1.char, initialize = _ref1.initialize, autoComputeLeftRecursives = _ref1.autoComputeLeftRecursives;
  hasOwnProperty = Object.hasOwnProperty;
  a = char('a');
  b = char('b');
  x = char('x');
  parse1 = function(text) {
    var rules;
    rules = {
      A: function(start) {
        var m;
        return (m = rules.A(start)) && x(p.cur()) && m + 'x' || m || a(start);
      },
      rootSymbol: 'A'
    };
    initialize();
    autoComputeLeftRecursives(rules);
    return parser.parse(text, rules);
  };
  parse2 = function(text) {
    var rules;
    rules = {
      A: function(start) {
        var m;
        return (m = rules.B(start)) && x(p.cur()) && m + 'x' || m || a(start);
      },
      B: function(start) {
        return rules.A(start) || b(start);
      },
      rootSymbol: 'A'
    };
    initialize();
    autoComputeLeftRecursives(rules);
    return parser.parse(text, rules);
  };
  parse3 = function(text) {
    var rules;
    rules = {
      A: function(start) {
        var m;
        return (m = rules.B(start)) && x(p.cur()) && m + 'x' || m || a(start);
      },
      B: function(start) {
        return rules.C(start);
      },
      C: function(start) {
        return rules.A(start) || b(start);
      },
      rootSymbol: 'A'
    };
    initialize();
    autoComputeLeftRecursives(rules);
    return parser.parse(text, rules);
  };
  return describe('auto peasy', function() {
    it("test A: Ax|a", function() {
      var parse;
      parse = parse1;
      expect(parse('a')).toBe('a');
      expect(parse('ax')).toBe('ax');
      expect(parse('axx')).toBe('axx');
      return expect(parse('axxx')).toBe('axxx');
    });
    it("test A: Bx|a; B:A|b", function() {
      var parse;
      parse = parse2;
      expect(parse('a')).toBe('a');
      expect(parse('ax')).toBe('ax');
      expect(parse('axx')).toBe('axx');
      expect(parse('axxx')).toBe('axxx');
      expect(parse('b')).toBe('b');
      expect(parse('bx')).toBe('bx');
      expect(parse('bxxx')).toBe('bxxx');
      expect(parse('bxg')).toBe('bx');
      expect(parse('bxxg')).toBe('bxx');
      expect(parse('bxxxg')).toBe('bxxx');
      expect(parse('fg')).toBe(void 0);
      return expect(parse('')).toBe(void 0);
    });
    return it("test A: Bx|a; B:C; C:A|b", function() {
      var parse;
      parse = parse3;
      expect(parse('a')).toBe('a');
      expect(parse('ax')).toBe('ax');
      expect(parse('axx')).toBe('axx');
      expect(parse('axxx')).toBe('axxx');
      expect(parse('b')).toBe('b');
      expect(parse('bx')).toBe('bx');
      expect(parse('bxxx')).toBe('bxxx');
      expect(parse('bxg')).toBe('bx');
      expect(parse('bxxg')).toBe('bxx');
      expect(parse('bxxxg')).toBe('bxxx');
      expect(parse('fg')).toBe(void 0);
      return expect(parse('')).toBe(void 0);
    });
  });
})(require, exports, module);
