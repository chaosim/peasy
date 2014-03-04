var exports, module, require, _ref,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __slice = [].slice;

if (typeof window === 'object') {
  _ref = twoside('/peasy'), require = _ref.require, exports = _ref.exports, module = _ref.module;
}

(function(require, exports, module) {
  var Charset, Parser, charset, digits, letterDigits, letters, lowers, uppers;
  exports.Parser = Parser = (function() {
    function Parser() {
      var base, self;
      self = this;
      base = this.base = {};
      this.ruleIndex = 0;
      base.parse = this.parse = function(data, root, cur) {
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
      base.rec = this.rec = function(rule) {
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
      base.memo = this.memo = function(rule) {
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
      base.orp = this.orp = function() {
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
      base.andp = this.andp = function() {
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
      base.notp = this.notp = function(item) {
        if ((typeof item) === 'string') {
          item = self.literal(item);
        }
        return function() {
          return !item();
        };
      };
      base.may = this.may = function(item) {
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
      base.any = this.any = function(item) {
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
      base.some = this.some = function(item) {
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
      base.times = this.times = function(item, n) {
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
      base.list = this.list = function(item, separator) {
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
      base.listn = this.listn = function(item, n, separator) {
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
      base.follow = this.follow = function(item) {
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
      base.literal = this.literal = function(string) {
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
      base.char = this.char = function(c) {
        return function() {
          if (self.data[self.cur] === c) {
            self.cur++;
            return c;
          }
        };
      };
      base.wrap = this.wrap = function(item, left, right) {
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
      base.spaces = this.spaces = function() {
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
      base.spaces1 = this.spaces1 = function() {
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
      base.eoi = this.eoi = function() {
        return self.cur === self.data.length;
      };
      base.identifierLetter = this.identifierLetter = function() {
        var c;
        c = self.data[self.cur];
        if (c === '$' || c === '_' || ('a' <= c && c < 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9')) {
          self.cur++;
          return true;
        }
      };
      base.followIdentifierLetter = this.followIdentifierLetter = function() {
        var c;
        c = self.data[self.cur];
        return (c === '$' || c === '_' || ('a' <= c && c < 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9')) && c;
      };
      base.digit = this.digit = function() {
        var c;
        c = self.data[self.cur];
        if (('0' <= c && c <= '9')) {
          self.cur++;
          return c;
        }
      };
      base.letter = this.letter = function() {
        var c;
        c = self.data[self.cur];
        if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z')) {
          self.cur++;
          return c;
        }
      };
      base.lower = this.lower = function() {
        var c;
        c = self.data[self.cur];
        if (('a' <= c && c <= 'z')) {
          self.cur++;
          return c;
        }
      };
      base.upper = this.upper = function() {
        var c;
        c = self.data[self.cur];
        if (('A' <= c && c <= 'Z')) {
          self.cur++;
          return c;
        }
      };
      base.identifier = this.identifier = function() {
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
      base.number = this.number = function() {
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
      base.string = this.string = function() {
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
      base.select = this.select = function(item, actions) {
        var action, defaultAction;
        console.log('select');
        action = actions[item];
        if (action) {
          return action();
        }
        defaultAction = actions['default'] || actions[''];
        if (defaultAction) {
          return defaultAction();
        }
      };
    }

    return Parser;

  })();
  exports.debugging = false;
  exports.testing = false;
  exports.debug = function(message) {
    if (exports.debugging) {
      return console.log(message);
    }
  };
  exports.warn = function(message) {
    if (exports.debugging || exports.testing) {
      return console.log(message);
    }
  };
  /* some utilities for parsing*/

  Charset = function(string) {
    var x, _i, _len;
    for (_i = 0, _len = string.length; _i < _len; _i++) {
      x = string[_i];
      this[x] = true;
    }
    return this;
  };
  Charset.prototype.contain = function(char) {
    return this.hasOwnProperty(char);
  };
  exports.charset = charset = function(string) {
    return new Charset(string);
  };
  exports.inCharset = exports.in_ = function(char, set) {
    exports.warn('peasy.inCharset(char, set) is deprecated, use set.contain(char) instead.');
    exports.warn(char + ':' + set.hasOwnProperty(char));
    return set.hasOwnProperty(char);
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
