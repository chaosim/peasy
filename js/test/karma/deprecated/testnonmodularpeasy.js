var exports, module, require, _ref;

if (typeof window === 'object') {
  _ref = twoside('/test/karma/deprecated/testnonmodularpeasy'), require = _ref.require, exports = _ref.exports, module = _ref.module;
}

(function(require, exports, module) {
  var a, addRecursiveCircles, b, char, computeLeftRecursives, hasOwnProperty, initialize, memo, memoA, p, parse1, parse2, parse3, parser, setRules, x, _ref1;
  _ref1 = parser = p = require("../../../deprecated/nonmodularpeasy"), initialize = _ref1.initialize, char = _ref1.char, memo = _ref1.memo, setRules = _ref1.setRules, addRecursiveCircles = _ref1.addRecursiveCircles, computeLeftRecursives = _ref1.computeLeftRecursives;
  hasOwnProperty = Object.hasOwnProperty;
  a = char('a');
  b = char('b');
  x = char('x');
  memoA = memo('A');
  parse1 = function(text) {
    var rules;
    rules = {
      A: function(start) {
        var m;
        return (m = memoA(start)) && x(p.cur()) && m + 'x' || m || a(start);
      },
      rootSymbol: 'A'
    };
    initialize();
    addRecursiveCircles(rules, ['A']);
    computeLeftRecursives(rules);
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
        return memoA(start) || b(start);
      },
      rootSymbol: 'A'
    };
    initialize();
    addRecursiveCircles(rules, ['A', 'B']);
    computeLeftRecursives(rules);
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
        return memoA(start) || b(start);
      },
      rootSymbol: 'A'
    };
    initialize();
    addRecursiveCircles(rules, ['A', 'B', 'C']);
    computeLeftRecursives(rules);
    return parser.parse(text, rules);
  };
  return describe('non modular peasy', function() {
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
