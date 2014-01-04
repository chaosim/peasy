var exports, module, require, _ref;

if (typeof window === 'object') {
  _ref = twoside('/test/karma/deprecated/testmodularpeasy'), require = _ref.require, exports = _ref.exports, module = _ref.module;
}

(function(require, exports, module) {
  var combinators, letters, makeInfo, parse1, parse2, parse3, parse4, parse5, _ref1;
  _ref1 = require("../../../deprecated/modularpeasy"), makeInfo = _ref1.makeInfo, letters = _ref1.letters, combinators = _ref1.combinators;
  parse1 = function(text) {
    var grammar, makeGrammar;
    makeGrammar = function(info) {
      var a, orp, rec, rules, x, _ref2, _ref3;
      _ref2 = letters(info), a = _ref2.a, x = _ref2.x;
      _ref3 = combinators(info), rec = _ref3.rec, orp = _ref3.orp;
      return rules = {
        A: rec(orp((function() {
          var m;
          return (m = rules.A()) && x() && m + 'x' || m;
        }), a))
      };
    };
    grammar = makeGrammar(makeInfo(text));
    return grammar.A(0);
  };
  parse2 = function(text) {
    var grammar, makeGrammar;
    makeGrammar = function(info) {
      var a, b, orp, rec, rules, x, _ref2, _ref3;
      _ref2 = letters(info), a = _ref2.a, b = _ref2.b, x = _ref2.x;
      _ref3 = combinators(info), rec = _ref3.rec, orp = _ref3.orp;
      rules = {};
      rules.A = rec(orp((function() {
        var m;
        return (m = rules.B()) && x() && m + 'x' || m;
      }), a));
      rules.B = rec(orp(rules.A, b));
      return rules;
    };
    grammar = makeGrammar(makeInfo(text));
    return grammar.A(0);
  };
  parse3 = function(text) {
    var grammar, makeGrammar;
    makeGrammar = function(info) {
      var a, b, orp, rec, rules, x, _ref2, _ref3;
      _ref2 = letters(info), a = _ref2.a, b = _ref2.b, x = _ref2.x;
      _ref3 = combinators(info), rec = _ref3.rec, orp = _ref3.orp;
      rules = {};
      rules.A = rec(orp((function() {
        var m;
        return (m = rules.B()) && x() && m + 'x' || m;
      }), a));
      rules.B = rec(function() {
        return rules.C();
      });
      rules.C = rec(orp(rules.A, b));
      return rules;
    };
    grammar = makeGrammar(makeInfo(text));
    return grammar.A(0);
  };
  parse4 = function(text) {
    var grammar, makeGrammar;
    makeGrammar = function(info) {
      var a, b, orp, rec, rules, x, y, _ref2, _ref3;
      _ref2 = letters(info), a = _ref2.a, b = _ref2.b, x = _ref2.x, y = _ref2.y;
      _ref3 = combinators(info), rec = _ref3.rec, orp = _ref3.orp;
      return rules = {
        A: rec(function() {
          return orp((function() {
            var m;
            return (m = rules.B()) && x() && m + 'x' || m;
          }), a)();
        }),
        B: rec(function() {
          return orp((function() {
            var m;
            return (m = rules.A()) && y() && m + 'y';
          }), rules.C)();
        }),
        C: rec(function() {
          return orp(rules.A, b)();
        })
      };
    };
    grammar = makeGrammar(makeInfo(text));
    return grammar.A(0);
  };
  parse5 = function(text) {
    var grammar, makeGrammar;
    makeGrammar = function(info) {
      var a, b, orp, rec, rules, x, y, z, _ref2, _ref3;
      _ref2 = letters(info), a = _ref2.a, b = _ref2.b, x = _ref2.x, y = _ref2.y, z = _ref2.z;
      _ref3 = combinators(info), rec = _ref3.rec, orp = _ref3.orp;
      return rules = {
        Root: function() {
          var m;
          return (m = rules.A()) && z() && m + 'z';
        },
        A: rec(orp((function() {
          var m;
          return (m = rules.B()) && x() && m + 'x' || m;
        }), a)),
        B: rec(orp((function() {
          var m;
          return (m = rules.A()) && y() && m + 'y';
        }), function() {
          return rules.C();
        })),
        C: rec(orp((function() {
          return rules.A();
        }), b))
      };
    };
    grammar = makeGrammar(makeInfo(text));
    return grammar.Root(0);
  };
  return describe('modular peasy', function() {
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
    it("test A: Bx|a; B:C; C:A|b", function() {
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
    it("test A: Bx|a; B:C|Ay; C:A|b", function() {
      var parse;
      parse = parse4;
      expect(parse('a')).toBe('a');
      expect(parse('ax')).toBe('ax');
      expect(parse('axx')).toBe('axx');
      expect(parse('axxx')).toBe('axxx');
      expect(parse('ay')).toBe('ay');
      expect(parse('ayx')).toBe('ayx');
      expect(parse('ayxyx')).toBe('ayxyx');
      expect(parse('bxx')).toBe('bxx');
      expect(parse('ayxxx')).toBe('ayxxx');
      expect(parse('ayxmxx')).toBe('ayx');
      expect(parse('b')).toBe('b');
      expect(parse('bx')).toBe('bx');
      expect(parse('bxxx')).toBe('bxxx');
      expect(parse('bxg')).toBe('bx');
      expect(parse('bxxg')).toBe('bxx');
      expect(parse('bxxxg')).toBe('bxxx');
      expect(parse('fg')).toBe(void 0);
      return expect(parse('')).toBe(void 0);
    });
    return it("test Start: Az; A: Bx|a; B:C|Ay; C:A|b", function() {
      var parse;
      parse = parse5;
      expect(parse('az')).toBe('az');
      expect(parse('axz')).toBe('axz');
      expect(parse('axxz')).toBe('axxz');
      expect(parse('axxxz')).toBe('axxxz');
      expect(parse('ayz')).toBe('ayz');
      expect(parse('ayxz')).toBe('ayxz');
      expect(parse('ayxyxz')).toBe('ayxyxz');
      expect(parse('bxxz')).toBe('bxxz');
      expect(parse('ayxxxz')).toBe('ayxxxz');
      expect(parse('ayxmxxz')).toBe(void 0);
      expect(parse('bz')).toBe('bz');
      expect(parse('bxz')).toBe('bxz');
      expect(parse('bxxxz')).toBe('bxxxz');
      expect(parse('bxgz')).toBe(void 0);
      expect(parse('bxxgz')).toBe(void 0);
      expect(parse('bxxxgz')).toBe(void 0);
      expect(parse('fg')).toBe(void 0);
      return expect(parse('')).toBe(void 0);
    });
  });
})(require, exports, module);
