var exports, module, require, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (typeof window === 'object') {
  _ref = twoside('/test/karma/testpeasy'), require = _ref.require, exports = _ref.exports, module = _ref.module;
}

(function(require, exports, module) {
  var peasy;
  peasy = require('../../peasy');
  describe("run testpeasy:", function() {
    return it('', function() {});
  });
  return describe("peasy", function() {
    it("should parse with A: Ax|a", function() {
      var Parser, parse, parser;
      Parser = (function(_super) {
        __extends(Parser, _super);

        function Parser() {
          var a, x,
            _this = this;
          Parser.__super__.constructor.apply(this, arguments);
          a = this.char('a');
          x = this.char('x');
          this.A = this.rec(this.orp((function() {
            var m;
            return (m = _this.A()) && x() && m + 'x' || m;
          }), a));
        }

        return Parser;

      })(peasy.Parser);
      parser = new Parser();
      parse = function(text) {
        return parser.parse(text, parser.A);
      };
      expect(parse('a')).toBe('a');
      expect(parse('ax')).toBe('ax');
      expect(parse('axx')).toBe('axx');
      return expect(parse('axxx')).toBe('axxx');
    });
    it("should parse with A: Bx|a; B:A|b", function() {
      var Parser, parse, parser;
      Parser = (function(_super) {
        __extends(Parser, _super);

        function Parser() {
          var B, a, b, x,
            _this = this;
          Parser.__super__.constructor.apply(this, arguments);
          a = this.char('a');
          b = this.char('b');
          x = this.char('x');
          this.A = this.rec(this.orp((function() {
            var m;
            return (m = B()) && x() && m + 'x' || m;
          }), a));
          B = this.rec(this.orp(this.A, b));
        }

        return Parser;

      })(peasy.Parser);
      parser = new Parser();
      parse = function(text) {
        return parser.parse(text, parser.A);
      };
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
    it("should parse with A: Bx|a; B:C; C:A|b", function() {
      var Parser, parse, parser;
      Parser = (function(_super) {
        __extends(Parser, _super);

        function Parser() {
          var B, C, a, b, x,
            _this = this;
          Parser.__super__.constructor.apply(this, arguments);
          a = this.char('a');
          b = this.char('b');
          x = this.char('x');
          this.A = this.rec(this.orp((function() {
            var m;
            return (m = B()) && x() && m + 'x' || m;
          }), a));
          B = this.rec(function() {
            return C();
          });
          C = this.rec(this.orp(this.A, b));
        }

        return Parser;

      })(peasy.Parser);
      parser = new Parser();
      parse = function(text) {
        return parser.parse(text, parser.A);
      };
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
    it("should parse with A: Bx|a; B:C|Ay; C:A|b", function() {
      var Parser, parse, parser;
      Parser = (function(_super) {
        __extends(Parser, _super);

        function Parser() {
          var B, C, a, b, x, y,
            _this = this;
          Parser.__super__.constructor.apply(this, arguments);
          a = this.char('a');
          b = this.char('b');
          x = this.char('x');
          y = this.char('y');
          this.A = this.rec(this.orp((function() {
            var m;
            return (m = B()) && x() && m + 'x' || m;
          }), a));
          B = this.rec(this.orp((function() {
            var m;
            return (m = _this.A()) && y() && m + 'y';
          }), function() {
            return C();
          }));
          C = this.rec(this.orp(this.A, b));
        }

        return Parser;

      })(peasy.Parser);
      parser = new Parser();
      parse = function(text) {
        return parser.parse(text, parser.A);
      };
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
    return it("should parse with Root: Az; A: Bx|a; B:C|Ay; C:A|b", function() {
      var Parser, parse, parser;
      Parser = (function(_super) {
        __extends(Parser, _super);

        function Parser() {
          var B, C, a, b, x, y, z,
            _this = this;
          Parser.__super__.constructor.apply(this, arguments);
          a = this.char('a');
          b = this.char('b');
          x = this.char('x');
          y = this.char('y');
          z = this.char('z');
          this.root = function() {
            var m;
            return (m = _this.A()) && z() && m + 'z';
          };
          this.A = this.rec(this.orp((function() {
            var m;
            return (m = B()) && x() && m + 'x' || m;
          }), a));
          B = this.rec(this.orp((function() {
            var m;
            return (m = _this.A()) && y() && m + 'y';
          }), function() {
            return C();
          }));
          C = this.rec(this.orp(this.A, b));
        }

        return Parser;

      })(peasy.Parser);
      parser = new Parser();
      parse = function(text) {
        return parser.parse(text);
      };
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
