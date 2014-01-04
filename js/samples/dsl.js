var exports, module, require, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

if (typeof window === 'object') {
  _ref = twoside('/samples/dsl'), require = _ref.require, exports = _ref.exports, module = _ref.module;
}

(function(require, exports, module) {
  var TemplateParser, charset, endTextCharset, identifierHeadChars, identifierHeadCharset, inCharset, letters, parseTemplate, peasy, templateParser, _ref1;
  _ref1 = peasy = require('../peasy'), inCharset = _ref1.inCharset, letters = _ref1.letters, charset = _ref1.charset;
  identifierHeadChars = '$_' + letters;
  endTextCharset = charset(')@' + identifierHeadChars);
  identifierHeadCharset = charset(identifierHeadChars);
  exports.TemplateParser = TemplateParser = (function(_super) {
    __extends(TemplateParser, _super);

    function TemplateParser() {
      var anySegment, at, c, error, exclam, field, lpar, mayExclam, rpar, tcall, template, text, tfield, _ref2,
        _this = this;
      TemplateParser.__super__.constructor.apply(this, arguments);
      _ref2 = (function() {
        var _i, _len, _ref2, _results,
          _this = this;
        _ref2 = '@()!';
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          c = _ref2[_i];
          _results.push((function(c) {
            return _this.char(c);
          })(c));
        }
        return _results;
      }).call(this), at = _ref2[0], lpar = _ref2[1], rpar = _ref2[2], exclam = _ref2[3];
      mayExclam = this.may(exclam);
      error = function(msg) {
        throw _this.data.slice(_this.cur - 20, +(_this.cur + 20) + 1 || 9e9) + ' ' + _this.cur + ': ' + msg;
      };
      tcall = function() {
        var args, f;
        return (f = tfield()) && lpar() && (args = template()) && ((rpar() && f + '(' + args + ')') || error('expect )'));
      };
      tfield = this.memo(function() {
        var id;
        return at() && (((id = _this.identifier()) && mayExclam() && 't.' + id) || error('expect @identifier'));
      });
      field = function() {
        var id;
        return (id = _this.identifier()) && mayExclam() && ("t.transform(e." + id + ")");
      };
      text = function() {
        var cur, data, id, result, start;
        data = _this.data;
        start = cur = _this.cur;
        result = '';
        while (1) {
          c = data[cur];
          if (!c) {
            break;
          } else if (c === '!') {
            cur++;
            c = data[cur];
            if (inCharset(c, identifierHeadCharset)) {
              _this.cur = cur;
              id = _this.identifier();
              cur = _this.cur;
              result += id;
            } else if (c === '!' || c === '@' || c === ')') {
              result += c;
              cur++;
            } else if (c) {
              result += '!' + c;
              cur++;
            } else {
              break;
            }
          } else if (c === '\n') {
            cur++;
            result += '\\n';
          } else if (inCharset(c, endTextCharset)) {
            break;
          } else {
            result += c;
            cur++;
          }
        }
        if (cur === start) {
          return;
        }
        _this.cur = cur;
        if (__indexOf.call(result, '"') >= 0) {
          return "'" + result + "'";
        } else {
          return '"' + result + '"';
        }
      };
      anySegment = this.any(this.orp(tcall, tfield, field, text));
      template = function() {
        var x;
        return (x = anySegment()) && x.join(',');
      };
      this.root = function() {
        var t;
        return (t = template()) && ((_this.eoi() && t) || error('unexpected )'));
      };
    }

    return TemplateParser;

  })(peasy.Parser);
  templateParser = new TemplateParser;
  return exports.parseTemplate = parseTemplate = function(text) {
    return templateParser.parse(text);
  };
})(require, exports, module);
