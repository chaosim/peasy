var exports, module, require, _ref,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __slice = [].slice;

if (typeof window === 'object') {
  _ref = twoside('/peasy'), require = _ref.require, exports = _ref.exports, module = _ref.module;
}

(function(require, exports, module) {
  var Parser, charset, digits, letterDigits, letters, lowers, uppers;
  exports.Parser = Parser = (function() {
    function Parser() {
      var self, some;
      self = this;
      this.ruleIndex = 0;
      this.parse = function(data, root, cur) {
        if (root == null) {
          root = self.root;
        }
        if (cur == null) {
          cur = 0;
        }
        self.data = data;
        self.cur = cur;
        self.ruleStack = {};
        self.cache = {};
        return root();
      };
      this.rec = function(rule) {
        var tag;
        tag = self.ruleIndex++;
        return function() {
          var cache, callStack, m, result, ruleStack, start, _base;
          ruleStack = self.ruleStack;
          cache = (_base = self.cache)[tag] != null ? (_base = self.cache)[tag] : _base[tag] = {};
          start = self.cur;
          callStack = ruleStack[start] != null ? ruleStack[start] : ruleStack[start] = [];
          if (__indexOf.call(callStack, tag) < 0) {
            callStack.push(tag);
            m = cache[start] != null ? cache[start] : cache[start] = [void 0, start];
            while (1) {
              self.cur = start;
              result = rule();
              if (!result) {
                result = m[0];
                self.cur = m[1];
                break;
              }
              if (m[1] === self.cur) {
                m[0] = result;
                break;
              }
              m[0] = result;
              m[1] = self.cur;
            }
            callStack.pop();
            return result;
          } else {
            m = cache[start];
            self.cur = m[1];
            return m[0];
          }
        };
      };
      this.memo = function(rule) {
        var tag,
          _this = this;
        tag = self.ruleIndex++;
        return function() {
          var cache, m, result, start, _base;
          cache = (_base = self.cache)[tag] != null ? (_base = self.cache)[tag] : _base[tag] = {};
          start = self.cur;
          m = cache[start];
          if (m) {
            self.cur = m[1];
            return m[0];
          } else {
            result = rule();
            self.cache[tag][start] = [result, self.cur];
            return result;
          }
        };
      };
      this.orp = function() {
        var item, items,
          _this = this;
        items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        items = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = items.length; _i < _len; _i++) {
            item = items[_i];
            if ((typeof item) === 'string') {
              _results.push(self.literal(item));
            } else {
              _results.push(item);
            }
          }
          return _results;
        })();
        return function() {
          var length, result, start, _i, _len;
          start = self.cur;
          length = items.length;
          for (_i = 0, _len = items.length; _i < _len; _i++) {
            item = items[_i];
            self.cur = start;
            if (result = item()) {
              return result;
            }
          }
        };
      };
      this.andp = function() {
        var item, items;
        items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        items = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = items.length; _i < _len; _i++) {
            item = items[_i];
            if ((typeof item) === 'string') {
              _results.push(self.literal(item));
            } else {
              _results.push(item);
            }
          }
          return _results;
        })();
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
      this.notp = function(item) {
        if ((typeof item) === 'string') {
          item = self.literal(item);
        }
        return function() {
          return !item();
        };
      };
      this.may = function(item) {
        var _this = this;
        if ((typeof item) === 'string') {
          item = self.literal(item);
        }
        return function() {
          var start, x;
          start = self.cur;
          if (x = item()) {
            return x;
          } else {
            self.cur = start;
            return true;
          }
        };
      };
      this.any = function(item) {
        var _this = this;
        if ((typeof item) === 'string') {
          item = self.literal(item);
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
      some = function(item) {
        if ((typeof item) === 'string') {
          item = self.literal(item);
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
      this.times = function(item, n) {
        if ((typeof item) === 'string') {
          item = self.literal(item);
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
      this.list = function(item, separator) {
        if (separator == null) {
          separator = self.spaces;
        }
        if ((typeof item) === 'string') {
          item = self.literal(item);
        }
        if ((typeof separator) === 'string') {
          separator = self.literal(separator);
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
      this.listn = function(item, n, separator) {
        if (separator == null) {
          separator = self.spaces;
        }
        if ((typeof item) === 'string') {
          item = self.literal(item);
        }
        if ((typeof separator) === 'string') {
          separator = self.literal(separator);
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
      this.follow = function(item) {
        var _this = this;
        if ((typeof item) === 'string') {
          item = self.literal(item);
        }
        return function() {
          var start, x;
          start = self.cur;
          x = item();
          self.cur = start;
          return x;
        };
      };
      this.literal = function(string) {
        return function() {
          var len, start, stop;
          len = string.length;
          start = self.cur;
          if (self.data.slice(start, stop = start + len) === string) {
            self.cur = stop;
            return true;
          }
        };
      };
      this.char = function(c) {
        return function() {
          if (self.data[self.cur] === c) {
            self.cur++;
            return c;
          }
        };
      };
      this.spaces = function() {
        var c, cur, data, len;
        data = self.data;
        len = 0;
        cur = self.cur;
        while (1) {
          if ((c = data[cur++]) && (c === ' ' || c === '\t')) {
            len++;
          } else {
            break;
          }
        }
        self.cur += len;
        return len + 1;
      };
      this.spaces1 = function() {
        var c, cur, data, len;
        data = self.data;
        cur = self.cur;
        len = 0;
        while (1) {
          if ((c = data[cur++]) && (c === ' ' || c === '\t')) {
            lent++;
          } else {
            break;
          }
        }
        self.cur += len;
        return len;
      };
      this.eoi = function() {
        return self.cur === self.data.length;
      };
      this.wrap = function(item, left, right) {
        if (left == null) {
          left = self.spaces;
        }
        if (right == null) {
          right = self.spaces;
        }
        if ((typeof item) === 'string') {
          item = self.literal(item);
        }
        return function() {
          var result;
          if (left() && (result = item() && right())) {
            return result;
          }
        };
      };
      this.identifierLetter = function() {
        var c;
        c = self.data[self.cur];
        if (c === '$' || c === '_' || ('a' <= c && c < 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9')) {
          self.cur++;
          return true;
        }
      };
      this.followIdentifierLetter_ = function() {
        var c;
        c = self.data[self.cur];
        return (c === '$' || c === '_' || ('a' <= c && c < 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9')) && c;
      };
      this.digit = function() {
        var c;
        c = self.data[self.cur];
        if (('0' <= c && c <= '9')) {
          self.cur++;
          return c;
        }
      };
      this.letter = function() {
        var c;
        c = self.data[self.cur];
        if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z')) {
          self.cur++;
          return c;
        }
      };
      this.lower = function() {
        var c;
        c = self.data[self.cur];
        if (('a' <= c && c <= 'z')) {
          self.cur++;
          return c;
        }
      };
      this.upper = function() {
        var c;
        c = self.data[self.cur];
        if (('A' <= c && c <= 'Z')) {
          self.cur++;
          return c;
        }
      };
      this.identifier = function() {
        var c, cur, data, start;
        data = self.data;
        start = cur = self.cur;
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
        self.cur = cur;
        return data.slice(start, cur);
      };
      this.number = function() {
        var c, cur, data;
        data = self.data;
        cur = self.cur;
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
        self.cur = cur;
        return data.slice(start, cur);
      };
      this.string = function() {
        var c, cur, quote, start, text;
        text = self.data;
        start = cur = self.cur;
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
            self.cur = cur + 1;
            return text.slice(start, +cur + 1 || 9e9);
          } else if (!c) {
            return;
          }
        }
      };
    }

    return Parser;

  })();
  /* some utilities for parsing*/

  exports.charset = charset = function(string) {
    var dict, x, _i, _len;
    dict = {};
    for (_i = 0, _len = string.length; _i < _len; _i++) {
      x = string[_i];
      dict[x] = true;
    }
    return dict;
  };
  exports.inCharset = exports.in_ = function(c, set) {
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
  return exports.letterDigits = letterDigits = letterDigits;
})(require, exports, module);
