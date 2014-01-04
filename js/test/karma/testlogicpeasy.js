var exports, module, require, _ref,
  __slice = [].slice;

if (typeof window === 'object') {
  _ref = twoside('/test/karma/testlogicpeasy'), require = _ref.require, exports = _ref.exports, module = _ref.module;
}

(function(require, exports, module) {
  var Parser, Trail, cons, uarray, uobject, vari, _ref1;
  _ref1 = require('../../logicpeasy'), vari = _ref1.vari, cons = _ref1.cons, uobject = _ref1.uobject, uarray = _ref1.uarray, Trail = _ref1.Trail, Parser = _ref1.Parser;
  return describe('logicpeasy', function() {
    var orp, unify;
    orp = unify = null;
    beforeEach(function() {
      var parser;
      parser = new Parser;
      parser.trail = new Trail;
      unify = function(x, y) {
        return parser.unify(x, y);
      };
      return orp = function() {
        var items;
        items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return parser.orp.apply(parser, items)();
      };
    });
    it("should unify 1 1", function() {
      return expect(unify(1, 1)).toBe(true);
    });
    it("should unify 1 2", function() {
      return expect(unify(1, 2)).toBe(false);
    });
    it("should unify logicvar", function() {
      return expect(unify(vari(), 1)).toBe(true);
    });
    it("should sequential unify logicvar", function() {
      var $a;
      return expect(($a = vari()) && unify($a, 1) && unify($a, 2)).toBe(false);
    });
    it("should unify logicvar with backtracking", function() {
      var $a;
      return expect(($a = vari()) && orp((function() {
        return unify($a, 1) && unify($a, 2);
      }), function() {
        return unify($a, 2);
      })).toBe(true);
    });
    it("should unify cons 1", function() {
      return expect(unify(cons(1, null), cons(1, null))).toBe(true);
    });
    it("should unify cons 2", function() {
      return expect(unify(cons(vari(), null), cons(1, null))).toBe(true);
    });
    it("should unify cons 3", function() {
      var $a;
      return expect(($a = vari()) && unify(cons($a, null), cons(1, null)) && unify($a, 2)).toBe(false);
    });
    it("should unify cons 4", function() {
      var $a;
      return expect(($a = vari()) && orp((function() {
        return unify(cons($a, null), cons(1, null)) && unify($a, 2);
      }), function() {
        return unify($a, 2);
      })).toBe(true);
    });
    it("should unify uobject 1", function() {
      return expect(unify(uobject({
        a: 1
      }), {
        a: 1
      })).toBe(true);
    });
    it("should unify uobject 2", function() {
      return expect(unify(uobject({
        a: 1
      }), {
        a: 2
      })).toBe(false);
    });
    it("should unify uobject 3", function() {
      return expect(unify(uobject({
        a: vari()
      }), {
        a: 1
      })).toBe(true);
    });
    it("should unify uobject 4", function() {
      var $a;
      return expect(($a = vari()) && unify(uobject({
        a: $a
      }), {
        a: 1
      }) && unify($a, 2)).toBe(false);
    });
    it("should unify uobject 5", function() {
      var $a;
      return expect(($a = vari()) && orp((function() {
        return unify(uobject({
          a: $a
        }), {
          a: 1
        }) && unify($a, 2);
      }), function() {
        return unify($a, 2);
      })).toBe(true);
    });
    it("should unify array, uarray 1", function() {
      return expect(unify([], [])).toBe(false);
    });
    it("should unify array, uarray 2", function() {
      return expect(unify(uarray([]), [])).toBe(true);
    });
    it("should unify array, uarray 3", function() {
      return expect(unify(uarray([vari()]), [])).toBe(false);
    });
    it("should unify array, uarray 4", function() {
      return expect(unify(uarray([vari()]), [1])).toBe(true);
    });
    it("should unify array, uarray 5", function() {
      var $a;
      return expect(($a = vari()) && unify(uarray([$a]), [1]) && unify($a, 2)).toBe(false);
    });
    return it("should unify array, uarray 6", function() {
      var $a;
      return expect(($a = vari()) && orp((function() {
        return unify(uarray([$a]), [1]) && unify($a, 2);
      }), function() {
        return unify($a, 2);
      })).toBe(true);
    });
  });
})(require, exports, module);
