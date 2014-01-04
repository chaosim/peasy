var exports, module, require, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __slice = [].slice;

if (typeof window === 'object') {
  _ref = twoside('/peasy'), require = _ref.require, exports = _ref.exports, module = _ref.module;
}

(function(require, exports, module) {
  var Parser, charset, digits, isMatcher, letterDigits, letters, lowers, uppers;
  exports.isMatcher = isMatcher = function(item) {
    return typeof item === "function";
  };
  exports.charset = charset = function(string) {
    var dict, x, _i, _len;
    dict = {};
    for (_i = 0, _len = string.length; _i < _len; _i++) {
      x = string[_i];
      dict[x] = true;
    }
    return dict;
  };
  exports.inCharset = function(c, set) {
    return set.hasOwnProperty(c);
  };
  exports.isdigit = function(c) {
    return ('0' <= c && c <= '9');
  };
  exports.isletter = function(c) {
    return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z');
  };
  exports.islower = function(c) {
    return ('a' <= c && c <= 'z');
  };
  exports.isupper = function(c) {
    return ('A' <= c && c <= 'Z');
  };
  exports.isIdentifierLetter = function(c) {
    return c === '$' || c === '_' || ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9');
  };
  exports.digits = digits = '0123456789';
  exports.lowers = lowers = 'abcdefghijklmnopqrstuvwxyz';
  exports.uppers = uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  exports.letters = letters = lowers + uppers;
  exports.letterDigits = letterDigits = letterDigits;
  return exports.Parser = Parser = (function() {
    function Parser() {
      this.eoi = __bind(this.eoi, this);
      this.ruleIndex = 0;
    }

    Parser.prototype.parse = function(data, root, cur) {
      this.data = data;
      if (root == null) {
        root = this.root;
      }
      this.cur = cur != null ? cur : 0;
      this.ruleStack = {};
      this.cache = {};
      return root();
    };

    Parser.prototype.rec = function(rule) {
      var tag,
        _this = this;
      tag = this.ruleIndex++;
      return function() {
        var cache, callStack, m, result, ruleStack, start, _base;
        ruleStack = _this.ruleStack;
        cache = (_base = _this.cache)[tag] != null ? (_base = _this.cache)[tag] : _base[tag] = {};
        start = _this.cur;
        callStack = ruleStack[start] != null ? ruleStack[start] : ruleStack[start] = [];
        if (__indexOf.call(callStack, tag) < 0) {
          callStack.push(tag);
          m = cache[start] != null ? cache[start] : cache[start] = [void 0, start];
          while (1) {
            _this.cur = start;
            result = rule();
            if (!result) {
              result = m[0];
              _this.cur = m[1];
              break;
            }
            if (m[1] === _this.cur) {
              m[0] = result;
              break;
            }
            m[0] = result;
            m[1] = _this.cur;
          }
          callStack.pop();
          return result;
        } else {
          m = cache[start];
          _this.cur = m[1];
          return m[0];
        }
      };
    };

    Parser.prototype.memo = function(rule) {
      var tag,
        _this = this;
      tag = this.ruleIndex++;
      return function() {
        var cache, m, result, start, _base;
        cache = (_base = _this.cache)[tag] != null ? (_base = _this.cache)[tag] : _base[tag] = {};
        start = _this.cur;
        m = cache[start];
        if (m) {
          _this.cur = m[1];
          return m[0];
        } else {
          result = rule();
          _this.cache[tag][start] = [result, _this.cur];
          return result;
        }
      };
    };

    Parser.prototype.andp = function() {
      var item, items;
      items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      items = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          if (!isMatcher(item)) {
            _results.push(this.literal(item));
          } else {
            _results.push(item);
          }
        }
        return _results;
      }).call(this);
      return function() {
        var result, _i, _len;
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          if (!(result = item())) {
            return;
          }
        }
        return result;
      };
    };

    Parser.prototype.orp = function() {
      var item, items,
        _this = this;
      items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      items = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          if (!isMatcher(item)) {
            _results.push(this.literal(item));
          } else {
            _results.push(item);
          }
        }
        return _results;
      }).call(this);
      return function() {
        var length, result, start, _i, _len;
        start = _this.cur;
        length = items.length;
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          _this.cur = start;
          if (result = item()) {
            return result;
          }
        }
      };
    };

    Parser.prototype.notp = function(item) {
      if (!isMatcher(item)) {
        item = this.literal(item);
      }
      return function() {
        return !item();
      };
    };

    Parser.prototype.may = function(item) {
      var _this = this;
      if (!isMatcher(item)) {
        item = this.literal(item);
      }
      return function() {
        var start, x;
        start = _this.cur;
        if (x = item()) {
          return x;
        } else {
          _this.cur = start;
          return true;
        }
      };
    };

    Parser.prototype.any = function(item) {
      var _this = this;
      if (!isMatcher(item)) {
        item = this.literal(item);
      }
      return function() {
        var result, x;
        result = [];
        while ((x = item())) {
          result.push(x);
        }
        return result;
      };
    };

    Parser.prototype.some = function(item) {
      if (!isMatcher(item)) {
        item = this.literal(item);
      }
      return function() {
        var result, x;
        if (!(x = item())) {
          return;
        }
        result = [x];
        while ((x = item())) {
          result.push(x);
        }
        return result;
      };
    };

    Parser.prototype.times = function(item, n) {
      if (!isMatcher(item)) {
        item = this.literal(item);
      }
      return function() {
        var i, x;
        i = 0;
        while (i++ < n) {
          if (x = item()) {
            result.push(x);
          } else {
            return;
          }
        }
        return result;
      };
    };

    Parser.prototype.list = function(item, separator) {
      if (separator == null) {
        separator = this.spaces;
      }
      if (!isMatcher(item)) {
        item = this.literal(item);
      }
      if (!isMatcher(separator)) {
        separator = this.literal(separator);
      }
      return function() {
        var result, x;
        if (!(x = item())) {
          return;
        }
        result = [x];
        while (separator() && (x = item())) {
          result.push(x);
        }
        return result;
      };
    };

    Parser.prototype.listn = function(item, n, separator) {
      if (separator == null) {
        separator = this.spaces;
      }
      if (!isMatcher(item)) {
        item = this.literal(item);
      }
      if (!isMatcher(separator)) {
        separator = this.literal(separator);
      }
      return function() {
        var i, result, x;
        if (!(x = item())) {
          return;
        }
        result = [x];
        i = 1;
        while (i++ < n) {
          if (separator() && (x = item())) {
            result.push(x);
          } else {
            return;
          }
        }
        return result;
      };
    };

    Parser.prototype.follow = function(item) {
      var _this = this;
      if (!isMatcher(item)) {
        item = this.literal(item);
      }
      return function() {
        var start, x;
        start = _this.cur;
        x = item();
        _this.cur = start;
        return x;
      };
    };

    Parser.prototype.literal = function(string) {
      var _this = this;
      return function() {
        var len, start, stop;
        len = string.length;
        start = _this.cur;
        if (_this.data.slice(start, stop = start + len) === string) {
          _this.cur = stop;
          return true;
        }
      };
    };

    Parser.prototype.char = function(c) {
      var _this = this;
      return function() {
        if (_this.data[_this.cur] === c) {
          _this.cur++;
          return c;
        }
      };
    };

    Parser.prototype.spaces = function() {
      var cur, data, len;
      data = this.data;
      len = 0;
      cur = this.cur;
      while (1) {
        switch (data[cur++]) {
          case ' ':
            len++;
            break;
          case '\t':
            len++;
            break;
          default:
            break;
        }
      }
      this.cur += len;
      return len + 1;
    };

    Parser.prototype.spaces1 = function() {
      var cur, data, len;
      data = this.data;
      cur = this.cur;
      len = 0;
      while (1) {
        switch (data[cur++]) {
          case ' ':
            len++;
            break;
          case '\t':
            len++;
            break;
          default:
            break;
        }
      }
      this.cur += len;
      return len;
    };

    Parser.prototype.eoi = function() {
      return this.cur === this.data.length;
    };

    Parser.prototype.wrap = function(item, left, right) {
      if (left == null) {
        left = this.spaces;
      }
      if (right == null) {
        right = this.spaces;
      }
      if (!isMatcher(item)) {
        item = this.literal(item);
      }
      return function() {
        var result;
        if (left() && (result = item() && right())) {
          return result;
        }
      };
    };

    Parser.prototype.identifierLetter = function() {
      var c;
      c = this.data[this.cur];
      if (c === '$' || c === '_' || ('a' <= c && c < 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9')) {
        this.cur++;
        return true;
      }
    };

    Parser.prototype.followIdentifierLetter_ = function() {
      var c;
      c = this.data[this.cur];
      return (c === '$' || c === '_' || ('a' <= c && c < 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9')) && c;
    };

    Parser.prototype.digit = function() {
      var c;
      c = this.data[this.cur];
      if (('0' <= c && c <= '9')) {
        this.cur++;
        return c;
      }
    };

    Parser.prototype.letter = function() {
      var c;
      c = this.data[this.cur];
      if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z')) {
        this.cur++;
        return c;
      }
    };

    Parser.prototype.lower = function() {
      var c;
      c = this.data[this.cur];
      if (('a' <= c && c <= 'z')) {
        this.cur++;
        return c;
      }
    };

    Parser.prototype.upper = function() {
      var c;
      c = this.data[this.cur];
      if (('A' <= c && c <= 'Z')) {
        this.cur++;
        return c;
      }
    };

    Parser.prototype.identifier = function() {
      var c, cur, data, start;
      data = this.data;
      start = cur = this.cur;
      c = data[cur];
      if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || c === '$' || c === '_') {
        cur++;
      } else {
        return;
      }
      while (1) {
        c = data[cur];
        if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9') || c === '$' || c === '_') {
          cur++;
        } else {
          break;
        }
      }
      this.cur = cur;
      return data.slice(start, cur);
    };

    Parser.prototype.number = function() {
      var c, cur, data;
      data = this.data;
      cur = this.cur;
      c = data[cur];
      if (('0' <= c && c <= '9')) {
        cur++;
      } else {
        return;
      }
      while (1) {
        c = data[cur];
        if (('0' <= c && c <= '9')) {
          cur++;
        } else {
          break;
        }
      }
      this.cur = cur;
      return data.slice(start, cur);
    };

    Parser.prototype.string = function() {
      var c, cur, quote, start, text;
      text = this.data;
      start = cur = this.cur;
      c = text[cur];
      if (c === '"' || c === "'") {
        quote = c;
      } else {
        return;
      }
      cur++;
      while (1) {
        c = text[cur];
        if (c === '\\') {
          cur += 2;
        } else if (c === quote) {
          this.cur = cur + 1;
          return text.slice(start, +cur + 1 || 9e9);
        } else if (!c) {
          return;
        }
      }
    };

    return Parser;

  })();
})(require, exports, module);
