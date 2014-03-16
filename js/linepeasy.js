var exports, module, require; 
(function(require, exports, module) {var ts;if (typeof window === 'object') { ts = twoside('peasy/linepeasy.js'), require = ts.require, exports = ts.exports, module = ts.module;} // wrap line by gulp-twoside for providing twoside module; 


/* an extended parser with lineno and row support */
var NumberFormatError, Parser, exports, parser, peasy,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __slice = [].slice;

peasy = require("./peasy");

exports = module.exports = {};

peasy.extend(exports, peasy);

exports.Parser = exports.LineParser = Parser = (function(_super) {
  __extends(Parser, _super);

  function Parser() {
    var lineparser, self;
    Parser.__super__.constructor.apply(this, arguments);
    self = this;
    lineparser = this.lineparser = {};
    this.parse = function(data, root, cur, lineno, row) {
      if (root == null) {
        root = self.root;
      }
      if (cur == null) {
        cur = 0;
      }
      if (lineno == null) {
        lineno = 0;
      }
      if (row == null) {
        row = 0;
      }
      self.data = data;
      self.cur = cur;
      self.lineno = lineno;
      self.row = row;
      self.ruleStack = {};
      self.cache = {};
      return root();
    };
    lineparser.rec = this.rec = function(rule) {
      var tag;
      tag = self.ruleIndex++;
      return function() {
        var cache, callStack, lineno, m, result, row, ruleStack, start, _base;
        ruleStack = self.ruleStack;
        cache = (_base = self.cache)[tag] != null ? _base[tag] : _base[tag] = {};
        start = self.cur;
        lineno = self.lineno;
        row = self.row;
        callStack = ruleStack[start] != null ? ruleStack[start] : ruleStack[start] = [];
        if (__indexOf.call(callStack, tag) < 0) {
          callStack.push(tag);
          m = cache[start] != null ? cache[start] : cache[start] = {
            result: void 0,
            cur: start,
            lineno: lineno,
            row: row
          };
          while (1) {
            self.cur = start;
            self.lineno = lineno;
            self.row = row;
            result = rule();
            if (!result) {
              result = m.result;
              self.cur = m.cur;
              self.lineno = m.lineno;
              self.row = m.row;
              break;
            } else if (m.cur === self.cur) {
              m.result = result;
              break;
            } else {
              m.result = result;
              m.cur = self.cur;
              m.lineno = self.lineno;
              m.row = self.row;
            }
          }
          callStack.pop();
          return result;
        } else {
          m = cache[start];
          self.cur = m.cur;
          self.lineno = m.lineno;
          self.row = m.row;
          return m.result;
        }
      };
    };
    lineparser.memo = this.memo = function(rule) {
      var tag;
      tag = self.ruleIndex++;
      return (function(_this) {
        return function() {
          var cache, m, result, start, _base;
          cache = (_base = self.cache)[tag] != null ? _base[tag] : _base[tag] = {};
          start = self.cur;
          m = cache[start];
          if (m) {
            self.cur = m.cur;
            self.lineno = lineno;
            self.row = row;
            return m.result;
          } else {
            result = rule();
            self.cache[tag][start] = {
              result: result,
              cur: self.cur,
              lineno: self.lineno,
              row: self.row
            };
            return result;
          }
        };
      })(this);
    };
    lineparser.orp = this.orp = function() {
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
      return (function(_this) {
        return function() {
          var lineno, result, row, start, _i, _len;
          start = self.cur;
          lineno = self.lineno;
          row = self.row;
          for (_i = 0, _len = items.length; _i < _len; _i++) {
            item = items[_i];
            self.cur = start;
            self.lineno = lineno;
            self.row = row;
            if (result = item()) {
              return result;
            }
          }
        };
      })(this);
    };
    lineparser.andp = this.andp = function() {
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
    lineparser.notp = this.notp = function(item) {
      if ((typeof item) === 'string') {
        item = self.literal(item);
      }
      return function() {
        return !item();
      };
    };
    lineparser.may = this.may = function(item) {
      if ((typeof item) === 'string') {
        item = self.literal(item);
      }
      return (function(_this) {
        return function() {
          var lineno, row, start, x;
          start = self.cur;
          lineno = self.lineno;
          row = self.row;
          if (x = item()) {
            return x;
          } else {
            self.cur = start;
            self.lineno = lineno;
            self.row = row;
            return true;
          }
        };
      })(this);
    };
    lineparser.any = this.any;
    lineparser.some = this.some;
    lineparser.times = this.times;
    lineparser.list = this.list;
    lineparser.listn = this.listn;
    lineparser.follow = this.follow = function(item) {
      if ((typeof item) === 'string') {
        item = self.literal(item);
      }
      return (function(_this) {
        return function() {
          var lineno, row, start, x;
          start = self.cur;
          lineno = self.lineno;
          row = self.row;
          x = item();
          self.cur = start;
          self.lineno = lineno;
          self.row = row;
          return x;
        };
      })(this);
    };
    lineparser.literal = this.literal = function(string) {
      var len;
      len = string.length;
      return function() {
        var c, cur, data, i, lineno, row;
        cur = self.cur;
        lineno = self.lineno;
        row = self.row;
        data = self.data;
        i = 0;
        while (i < len) {
          c = string[i];
          if (data[i] === c) {
            i++;
            cur++;
            if (c === '\n') {
              lineno++;
              row = 0;
            } else {
              row++;
            }
          } else {
            return;
          }
        }
        self.cur = cur;
        self.lineno = lineno;
        self.row = row;
        return true;
      };
    };
    lineparser.step = this.step = function() {
      var c;
      if ((c = self.data[self.cur]) === '\n') {
        self.lineno++;
      } else {
        self.row++;
      }
      return c;
    };
    lineparser['char'] = this['char'] = function(c) {
      return function() {
        if (self.data[self.cur] === c) {
          self.cur++;
          if (c === '\n') {
            self.lineno++;
            self.row = 0;
          } else {
            self.row++;
          }
          return c;
        }
      };
    };
    lineparser.wrap = this.wrap = function(item, left, right) {
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
    lineparser.spaces = this.spaces = function() {
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
      self.row += len;
      return len + 1;
    };
    lineparser.spaces1 = this.spaces1 = function() {
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
      self.row += len;
      return len;
    };
    lineparser.eoi = this.eoi = function() {
      return self.cur >= self.data.length;
    };
    lineparser.identifierLetter = this.identifierLetter = function() {
      var c;
      c = self.data[self.cur];
      if (c === '$' || c === '_' || ('a' <= c && c < 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9')) {
        self.cur++;
        self.row++;
        return true;
      }
    };
    lineparser.followIdentifierLetter = this.followIdentifierLetter = function() {
      var c;
      c = self.data[self.cur];
      return (c === '$' || c === '_' || ('a' <= c && c < 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9')) && c;
    };
    lineparser.digit = this.digit = function() {
      var c;
      c = self.data[self.cur];
      if (('0' <= c && c <= '9')) {
        self.cur++;
        self.row++;
        return c;
      }
    };
    lineparser.letter = this.letter = function() {
      var c;
      c = self.data[self.cur];
      if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z')) {
        self.cur++;
        self.row++;
        return c;
      }
    };
    lineparser.lower = this.lower = function() {
      var c;
      c = self.data[self.cur];
      if (('a' <= c && c <= 'z')) {
        self.cur++;
        self.row++;
        return c;
      }
    };
    lineparser.upper = this.upper = function() {
      var c;
      c = self.data[self.cur];
      if (('A' <= c && c <= 'Z')) {
        self.cur++;
        self.row++;
        return c;
      }
    };
    lineparser.identifier = this.identifier = function() {
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
      self.row += cur - self.cur;
      self.cur = cur;
      return data.slice(start, cur);
    };
    lineparser.decimal = this.decimal = function() {
      var c, cur, data, nonZeroStart, start;
      data = self.data;
      nonZeroStart = start = cur = self.cur;
      while (1) {
        c = data[cur];
        if ('0' === c) {
          cur++;
          nonZeroStart++;
        } else if (('1' <= c && c <= '9')) {
          cur++;
          break;
        } else {
          break;
        }
      }
      if (cur === start) {
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
      self.row += cur - self.cur;
      self.cur = cur;
      return [parseInt(data.slice(nonZeroStart, cur), 10)];
    };
    lineparser.number = this.number = function() {
      var base, baseStart, c, c2, cur, data, meetDigit, neg, nonZeroStart, signNext, start, v;
      data = self.data;
      base = 10;
      start = cur = self.cur;
      signNext = 0;
      c = data[cur];
      if (c === '-') {
        neg = true;
        c = data[++cur];
        signNext = 1;
      } else if (c === '+') {
        c = data[++cur];
        signNext = 1;
      }
      if (c === '0' && (c2 = data[cur + 1])) {
        if (c2 === 'b' || c2 === 'B') {
          base = 2;
          baseStart = cur += 2;
          c = data[cur];
        } else if (c2 === 'x' || c2 === 'X') {
          base = 16;
          baseStart = cur += 2;
          c = data[cur];
        } else {
          c = data[++cur];
          meetDigit = true;
        }
      }
      if (base === 2) {
        while (c) {
          if (c === '0' || c === '1') {
            c = data[++cur];
          } else if (('2' <= c && c <= '9')) {
            throw new NumberFormatError(self, 'number format errer: binary integer followed by digit 2-9');
          } else {
            break;
          }
        }
      } else if (base === 16) {
        while (c) {
          if (!(('0' <= c && c <= '9') || ('a' <= c && c <= 'f') || ('A' <= c && c <= 'F'))) {
            break;
          } else {
            c = data[++cur];
          }
        }
      }
      if (base === 2) {
        if (c === '.' || c === 'e' || c === 'E') {
          throw new NumberFormatError(self, 'number format errer: binary integer followed by . or e or E');
        } else if (('2' <= c && c <= '9')) {
          throw new NumberFormatError(self, 'number format errer: binary integer followed by digit 2-9');
        }
      }
      if (base === 16 && c === '.') {
        throw new NumberFormatError(self, 'number format errer: hexadecimal followed by .');
      }
      if (base !== 10) {
        if (cur === baseStart) {
          return;
        }
        self.row = self.row + cur - start;
        self.cur = cur;
        v = parseInt(data.slice(baseStart, cur), base);
        if (neg) {
          v = -v;
        }
        return [v];
      }
      while (c) {
        if (c === '0') {
          meetDigit = true;
          c = data[++cur];
        } else if (('1' <= c && c <= '9')) {
          if (nonZeroStart === void 0) {
            nonZeroStart = cur;
          }
          meetDigit = true;
          c = data[++cur];
        } else if (c === '.') {
          if (nonZeroStart === void 0) {
            nonZeroStart = cur;
          }
          break;
        } else {
          break;
        }
      }
      if (c === '.') {
        c = data[++cur];
        while (c) {
          if (c < '0' || '9' < c) {
            break;
          } else {
            meetDigit = true;
            c = data[++cur];
          }
        }
      }
      if (c === 'e' || c === 'E') {
        if (!meetDigit) {
          return;
        }
        c = data[++cur];
        if (c === '+' || c === '-') {
          c = data[++cur];
          if (c && (c < '0' || '9' < c)) {
            cur -= 2;
          } else {
            while (c) {
              c = data[++cur];
              if (c < '0' || '9' < c) {
                break;
              }
            }
          }
        } else if (c && (c < '0' || '9' < c)) {
          cur--;
        } else {
          while (c) {
            c = data[++cur];
            if (c < '0' || '9' < c) {
              break;
            }
          }
        }
      }
      if (!meetDigit) {
        return;
      }
      self.row += cur - start;
      self.cur = cur;
      v = parseFloat(data.slice(nonZeroStart, cur));
      if (neg) {
        v = -v;
      }
      return [v];
    };
    lineparser.string = this.string = function() {
      var c, c1, cur, quote, row, start, text, wrap;
      text = self.data;
      start = cur = self.cur;
      row = self.row;
      c = text[cur];
      if (c === '"') {
        quote = c;
        wrap = "'";
        row++;
      } else if (c === "'") {
        quote = c;
        wrap = '"';
        row++;
      } else {
        return;
      }
      cur++;
      while (1) {
        c = text[cur];
        if (c === '\n' || c === '\r') {
          self.error('new line is forbidden in single line string.');
        } else if (c === '\\') {
          c1 = text[cur + 1];
          if (c1 === '\n' || c1 === '\r') {
            self.error('new line is forbidden in single line string.');
          } else if (!c1) {
            self.error('unexpect end of input, string is not closed');
          } else {
            cur += 2;
            row += 2;
          }
        } else if (c === quote) {
          self.cur = cur + 1;
          self.row = row + 1;
          return eval(wrap + text.slice(start, +cur + 1 || 9e9) + wrap);
        } else if (!c) {
          self.error('new line is forbidden in string.');
        } else {
          cur++;
          row++;
        }
      }
    };
    lineparser.select = this.select;
    lineparser.selectp = this.selectp;
  }

  return Parser;

})(peasy.BaseParser);

parser = exports.parser = new Parser();

exports.parse = function(text, root, cursor, lineno, row) {
  if (root == null) {
    root = parser.root;
  }
  if (cursor == null) {
    cursor = 0;
  }
  if (lineno == null) {
    lineno = 0;
  }
  if (row == null) {
    row = 0;
  }
  return parser.parse(text, root, cursor, lineno, row);
};

exports.NumberFormatError = NumberFormatError = (function() {
  function NumberFormatError(parser, message) {
    this.cur = parser.cur;
    this.lineno = parser.lineno;
    this.row = parser.row;
    this.message = message;
  }

  return NumberFormatError;

})();


})(require, exports, module);// wrap line by gulp-twoside