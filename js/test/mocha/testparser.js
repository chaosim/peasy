var exports, module, require, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (typeof window === 'object') {
  _ref = twoside('/test/mocha/testparser'), require = _ref.require, exports = _ref.exports, module = _ref.module;
}

(function(require, exports, module) {
  var chai, charset, expect, inCharset, peasy, _ref1;
  chai = require('chai');
  expect = chai.expect;
  _ref1 = peasy = require('../../index'), charset = _ref1.charset, inCharset = _ref1.inCharset;
  describe("run testpeasy:", function() {
    return it('', function() {});
  });
  describe("peasy", function() {
    return it("charset('ab') should contain 'a'", function() {
      var set;
      set = charset('ab');
      expect(inCharset('a', set)).to.equal(true);
      return expect(inCharset('0', set)).to.equal(false);
    });
  });
  return describe("peasy.parser", function() {
    it("should parse with A: Ax|a", function() {
      var Parser, parse, parser;
      Parser = (function(_super) {
        __extends(Parser, _super);

        function Parser() {
          var a, x;
          Parser.__super__.constructor.apply(this, arguments);
          a = this.char('a');
          x = this.char('x');
          this.A = this.rec(this.orp(((function(_this) {
            return function() {
              var m;
              return (m = _this.A()) && x() && m + 'x' || m;
            };
          })(this)), a));
        }

        return Parser;

      })(peasy.Parser);
      parser = new Parser();
      parse = function(text) {
        return parser.parse(text, parser.A);
      };
      expect(parse('a')).to.equal('a');
      expect(parse('ax')).to.equal('ax');
      expect(parse('axx')).to.equal('axx');
      return expect(parse('axxx')).to.equal('axxx');
    });
    it("should parse with A: Bx|a; B:A|b", function() {
      var Parser, parse, parser;
      Parser = (function(_super) {
        __extends(Parser, _super);

        function Parser() {
          var B, a, b, x;
          Parser.__super__.constructor.apply(this, arguments);
          a = this.char('a');
          b = this.char('b');
          x = this.char('x');
          this.A = this.rec(this.orp(((function(_this) {
            return function() {
              var m;
              return (m = B()) && x() && m + 'x' || m;
            };
          })(this)), a));
          B = this.rec(this.orp(this.A, b));
        }

        return Parser;

      })(peasy.Parser);
      parser = new Parser();
      parse = function(text) {
        return parser.parse(text, parser.A);
      };
      expect(parse('a')).to.equal('a');
      expect(parse('ax')).to.equal('ax');
      expect(parse('axx')).to.equal('axx');
      expect(parse('axxx')).to.equal('axxx');
      expect(parse('b')).to.equal('b');
      expect(parse('bx')).to.equal('bx');
      expect(parse('bxxx')).to.equal('bxxx');
      expect(parse('bxg')).to.equal('bx');
      expect(parse('bxxg')).to.equal('bxx');
      expect(parse('bxxxg')).to.equal('bxxx');
      expect(parse('fg')).to.equal(void 0);
      return expect(parse('')).to.equal(void 0);
    });
    it("should parse with A: Bx|a; B:C; C:A|b", function() {
      var Parser, parse, parser;
      Parser = (function(_super) {
        __extends(Parser, _super);

        function Parser() {
          var B, C, a, b, x;
          Parser.__super__.constructor.apply(this, arguments);
          a = this.char('a');
          b = this.char('b');
          x = this.char('x');
          this.A = this.rec(this.orp(((function(_this) {
            return function() {
              var m;
              return (m = B()) && x() && m + 'x' || m;
            };
          })(this)), a));
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
      expect(parse('a')).to.equal('a');
      expect(parse('ax')).to.equal('ax');
      expect(parse('axx')).to.equal('axx');
      expect(parse('axxx')).to.equal('axxx');
      expect(parse('b')).to.equal('b');
      expect(parse('bx')).to.equal('bx');
      expect(parse('bxxx')).to.equal('bxxx');
      expect(parse('bxg')).to.equal('bx');
      expect(parse('bxxg')).to.equal('bxx');
      expect(parse('bxxxg')).to.equal('bxxx');
      expect(parse('fg')).to.equal(void 0);
      return expect(parse('')).to.equal(void 0);
    });
    it("should parse with A: Bx|a; B:C|Ay; C:A|b", function() {
      var Parser, parse, parser;
      Parser = (function(_super) {
        __extends(Parser, _super);

        function Parser() {
          var B, C, a, b, x, y;
          Parser.__super__.constructor.apply(this, arguments);
          a = this.char('a');
          b = this.char('b');
          x = this.char('x');
          y = this.char('y');
          this.A = this.rec(this.orp(((function(_this) {
            return function() {
              var m;
              return (m = B()) && x() && m + 'x' || m;
            };
          })(this)), a));
          B = this.rec(this.orp(((function(_this) {
            return function() {
              var m;
              return (m = _this.A()) && y() && m + 'y';
            };
          })(this)), function() {
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
      expect(parse('a')).to.equal('a');
      expect(parse('ax')).to.equal('ax');
      expect(parse('axx')).to.equal('axx');
      expect(parse('axxx')).to.equal('axxx');
      expect(parse('ay')).to.equal('ay');
      expect(parse('ayx')).to.equal('ayx');
      expect(parse('ayxyx')).to.equal('ayxyx');
      expect(parse('bxx')).to.equal('bxx');
      expect(parse('ayxxx')).to.equal('ayxxx');
      expect(parse('ayxmxx')).to.equal('ayx');
      expect(parse('b')).to.equal('b');
      expect(parse('bx')).to.equal('bx');
      expect(parse('bxxx')).to.equal('bxxx');
      expect(parse('bxg')).to.equal('bx');
      expect(parse('bxxg')).to.equal('bxx');
      expect(parse('bxxxg')).to.equal('bxxx');
      expect(parse('fg')).to.equal(void 0);
      return expect(parse('')).to.equal(void 0);
    });
    return it("should parse with Root: Az; A: Bx|a; B:C|Ay; C:A|b", function() {
      var Parser, parse, parser;
      Parser = (function(_super) {
        __extends(Parser, _super);

        function Parser() {
          var B, C, a, b, x, y, z;
          Parser.__super__.constructor.apply(this, arguments);
          a = this.char('a');
          b = this.char('b');
          x = this.char('x');
          y = this.char('y');
          z = this.char('z');
          this.root = (function(_this) {
            return function() {
              var m;
              return (m = _this.A()) && z() && m + 'z';
            };
          })(this);
          this.A = this.rec(this.orp(((function(_this) {
            return function() {
              var m;
              return (m = B()) && x() && m + 'x' || m;
            };
          })(this)), a));
          B = this.rec(this.orp(((function(_this) {
            return function() {
              var m;
              return (m = _this.A()) && y() && m + 'y';
            };
          })(this)), function() {
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
      expect(parse('az')).to.equal('az');
      expect(parse('axz')).to.equal('axz');
      expect(parse('axxz')).to.equal('axxz');
      expect(parse('axxxz')).to.equal('axxxz');
      expect(parse('ayz')).to.equal('ayz');
      expect(parse('ayxz')).to.equal('ayxz');
      expect(parse('ayxyxz')).to.equal('ayxyxz');
      expect(parse('bxxz')).to.equal('bxxz');
      expect(parse('ayxxxz')).to.equal('ayxxxz');
      expect(parse('ayxmxxz')).to.equal(void 0);
      expect(parse('bz')).to.equal('bz');
      expect(parse('bxz')).to.equal('bxz');
      expect(parse('bxxxz')).to.equal('bxxxz');
      expect(parse('bxgz')).to.equal(void 0);
      expect(parse('bxxgz')).to.equal(void 0);
      expect(parse('bxxxgz')).to.equal(void 0);
      expect(parse('fg')).to.equal(void 0);
      return expect(parse('')).to.equal(void 0);
    });
  });
})(require, exports, module);
