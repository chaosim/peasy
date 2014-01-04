var exports, module, require, _ref;

if (typeof window === 'object') {
  _ref = twoside('/test/karma/deprecated/testlogic'), require = _ref.require, exports = _ref.exports, module = _ref.module;
}

(function(require, exports, module) {
  var cons, logic, makeCmd, makeInfo, uarray, uobject, vari, _ref1;
  _ref1 = logic = require("../../../deprecated/logic"), vari = _ref1.vari, cons = _ref1.cons, uarray = _ref1.uarray, uobject = _ref1.uobject, makeInfo = _ref1.makeInfo;
  makeCmd = function() {
    var info;
    info = makeInfo('');
    return {
      unify: logic.unify(info),
      orp: logic.orp(info)
    };
  };
  return describe('logic', function() {
    it("test unify 1 1, 1 2", function() {
      var orp, unify, _ref2, _ref3;
      _ref2 = makeCmd(), unify = _ref2.unify, orp = _ref2.orp;
      expect(unify(1, 1)).toBe(true);
      _ref3 = makeCmd(), unify = _ref3.unify, orp = _ref3.orp;
      return expect(unify(1, 2)).toBe(false);
    });
    it("test unify logicvar", function() {
      var $a, orp, unify, _ref2, _ref3, _ref4;
      _ref2 = makeCmd(), unify = _ref2.unify, orp = _ref2.orp;
      expect(unify(vari(), 1)).toBe(true);
      _ref3 = makeCmd(), unify = _ref3.unify, orp = _ref3.orp;
      expect(($a = vari()) && unify($a, 1) && unify($a, 2)).toBe(false);
      _ref4 = makeCmd(), unify = _ref4.unify, orp = _ref4.orp;
      return expect(($a = vari()) && orp((function() {
        return unify($a, 1) && unify($a, 2);
      }), function() {
        return unify($a, 2);
      })()).toBe(true);
    });
    it("test unify cons", function() {
      var $a, orp, unify, _ref2, _ref3, _ref4, _ref5;
      _ref2 = makeCmd(), unify = _ref2.unify, orp = _ref2.orp;
      expect(unify(cons(1, null), cons(1, null))).toBe(true);
      _ref3 = makeCmd(), unify = _ref3.unify, orp = _ref3.orp;
      expect(unify(cons(vari(), null), cons(1, null))).toBe(true);
      _ref4 = makeCmd(), unify = _ref4.unify, orp = _ref4.orp;
      expect(($a = vari()) && unify(cons($a, null), cons(1, null)) && unify($a, 2)).toBe(false);
      _ref5 = makeCmd(), unify = _ref5.unify, orp = _ref5.orp;
      return expect(($a = vari()) && orp((function() {
        return unify(cons($a, null), cons(1, null)) && unify($a, 2);
      }), function() {
        return unify($a, 2);
      })()).toBe(true);
    });
    it("test unify uobject", function() {
      var $a, orp, unify, _ref2, _ref3, _ref4, _ref5, _ref6;
      _ref2 = makeCmd(), unify = _ref2.unify, orp = _ref2.orp;
      expect(unify(uobject({
        a: 1
      }), {
        a: 1
      })).toBe(true);
      _ref3 = makeCmd(), unify = _ref3.unify, orp = _ref3.orp;
      expect(unify(uobject({
        a: 1
      }), {
        a: 2
      })).toBe(false);
      _ref4 = makeCmd(), unify = _ref4.unify, orp = _ref4.orp;
      expect(unify(uobject({
        a: vari()
      }), {
        a: 1
      })).toBe(true);
      _ref5 = makeCmd(), unify = _ref5.unify, orp = _ref5.orp;
      expect(($a = vari()) && unify(uobject({
        a: $a
      }), {
        a: 1
      }) && unify($a, 2)).toBe(false);
      _ref6 = makeCmd(), unify = _ref6.unify, orp = _ref6.orp;
      return expect(($a = vari()) && orp((function() {
        return unify(uobject({
          a: $a
        }), {
          a: 1
        }) && unify($a, 2);
      }), function() {
        return unify($a, 2);
      })()).toBe(true);
    });
    return it("test unify array, uarray", function() {
      var $a, orp, unify, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      _ref2 = makeCmd(), unify = _ref2.unify, orp = _ref2.orp;
      expect(unify([], [])).toBe(false);
      _ref3 = makeCmd(), unify = _ref3.unify, orp = _ref3.orp;
      expect(unify(uarray([]), [])).toBe(true);
      _ref4 = makeCmd(), unify = _ref4.unify, orp = _ref4.orp;
      expect(unify(uarray([vari()]), [])).toBe(false);
      _ref5 = makeCmd(), unify = _ref5.unify, orp = _ref5.orp;
      expect(unify(uarray([vari()]), [1])).toBe(true);
      _ref6 = makeCmd(), unify = _ref6.unify, orp = _ref6.orp;
      expect(($a = vari()) && unify(uarray([$a]), [1]) && unify($a, 2)).toBe(false);
      _ref7 = makeCmd(), unify = _ref7.unify, orp = _ref7.orp;
      return expect(($a = vari()) && orp((function() {
        return unify(uarray([$a]), [1]) && unify($a, 2);
      }), function() {
        return unify($a, 2);
      })()).toBe(true);
    });
  });
})(require, exports, module);
