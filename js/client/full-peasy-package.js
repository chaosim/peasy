(function() {var ts = twoside('peasy/peasy.js'), require = ts.require, exports = ts.exports, module = ts.module; // wrap line by gulp-twoside for providing twoside module

var Parser,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __slice = [].slice;

exports.Parser = exports.BaseParser = Parser = (function() {
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
        cache = (_base = self.cache)[tag] != null ? _base[tag] : _base[tag] = {};
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
            } else if (m[1] === self.cur) {
              m[0] = result;
              break;
            } else {
              m[0] = result;
              m[1] = self.cur;
            }
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
      var tag;
      tag = self.ruleIndex++;
      return (function(_this) {
        return function() {
          var cache, m, result, start, _base;
          cache = (_base = self.cache)[tag] != null ? _base[tag] : _base[tag] = {};
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
      })(this);
    };
    base.orp = this.orp = function() {
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
          var result, start, _i, _len;
          start = self.cur;
          for (_i = 0, _len = items.length; _i < _len; _i++) {
            item = items[_i];
            self.cur = start;
            if (result = item()) {
              return result;
            }
          }
        };
      })(this);
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
      if ((typeof item) === 'string') {
        item = self.literal(item);
      }
      return (function(_this) {
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
      })(this);
    };
    base.any = this.any = function(item) {
      if ((typeof item) === 'string') {
        item = self.literal(item);
      }
      return (function(_this) {
        return function() {
          var result, x;
          result = [];
          while ((x = item())) {
            result.push(x);
          }
          return result;
        };
      })(this);
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
      if ((typeof item) === 'string') {
        item = self.literal(item);
      }
      return (function(_this) {
        return function() {
          var start, x;
          start = self.cur;
          x = item();
          self.cur = start;
          return x;
        };
      })(this);
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
    base['char'] = this['char'] = function(c) {
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
      var c, c1, cur, quote, start, text, wrap;
      text = self.data;
      start = cur = self.cur;
      c = text[cur];
      if (c === '"') {
        quote = c;
        wrap = '"';
      } else if (c === "'") {
        quote = c;
        wrap = "'";
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
          }
        } else if (c === quote) {
          self.cur = cur + 1;
          return eval(wrap + text.slice(start, +cur + 1 || 9e9) + wrap);
        } else if (!c) {
          self.error('new line is forbidden in string.');
        } else {
          cur++;
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
    base.selectp = this.selectp = function(item, actions) {
      return function() {
        var test;
        test = item();
        if (test) {
          return self.select(actions);
        }
      };
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


/* some utilities for parsing */

exports.Charset = function(string) {
  var x, _i, _len;
  for (_i = 0, _len = string.length; _i < _len; _i++) {
    x = string[_i];
    this[x] = true;
  }
  return this;
};

exports.Charset.prototype.contain = function(ch) {
  return this.hasOwnProperty(ch);
};

exports.charset = function(string) {
  return new exports.Charset(string);
};

exports.inCharset = function(ch, chars) {
  exports.warn('peasy.inCharset(char, set) is deprecated, use set.contain(char) instead.');
  return chars.hasOwnProperty(ch);
};

exports.in_ = exports.inCharset;

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

exports.digits = '0123456789';

exports.lowers = 'abcdefghijklmnopqrstuvwxyz';

exports.uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

exports.letters = exports.lowers + exports.uppers;

exports.letterDigits = exports.letterDigits;


// code from lodash.undscore.js
exports.extend =  function (object) {
    if (!object) {
      return object;
    }
    for (var argsIndex = 1, argsLength = arguments.length; argsIndex < argsLength; argsIndex++) {
      var iterable = arguments[argsIndex];
      if (iterable) {
        for (var key in iterable) {
          object[key] = iterable[key];
        }
      }
    }
    return object;
  }

exports.isArray = function(value) {
return value && typeof value == 'object' && typeof value.length == 'number' &&
toString.call(value) == arrayClass || false;
};

exports.isObject = function (value) {
  // check if the value is the ECMAScript language type of Object
  // http://es5.github.io/#x8
  // and avoid a V8 bug
  // http://code.google.com/p/v8/issues/detail?id=2291
  return !!(value && objectTypes[typeof value]);
}

;


})();// wrap line by gulp-twoside
(function() {var ts = twoside('peasy/logicpeasy.js'), require = ts.require, exports = ts.exports, module = ts.module; // wrap line by gulp-twoside for providing twoside module


/* an extended parser with logic features */
var BindingError, Cons, DummyVar, Error, Parser, Trail, UArray, UObject, Var, dummy, exports, nameToIndexMap, peasy, reElements, uarray,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

peasy = require("./peasy");

exports = module.exports = {};

if (typeof window === 'object') {
  peasy.extend(exports, peasy);
}

exports.Parser = Parser = (function(_super) {
  __extends(Parser, _super);

  function Parser() {
    var self;
    Parser.__super__.constructor.apply(this, arguments);
    self = this;
    this.parse = function(data, root, cur) {
      if (root == null) {
        root = self.root;
      }
      if (cur == null) {
        cur = 0;
      }
      self.data = data;
      self.cur = cur;
      self.trail = new Trail;
      self.ruleStack = {};
      self.cache = {};
      return root();
    };
    this.bind = function(vari, term) {
      vari.bind(self.trail.deref(term));
      return true;
    };
    this.unify = function(x, y, equal) {
      if (equal == null) {
        equal = (function(x, y) {
          return x === y;
        });
      }
      return self.trail.unify(x, y, equal);
    };
    this.unifyList = function(xs, ys, equal) {
      var i, xlen, _i, _unify;
      if (equal == null) {
        equal = (function(x, y) {
          return x === y;
        });
      }
      xlen = xs.length;
      if (ys.length !== xlen) {
        return false;
      } else {
        _unify = self.trail.unify;
        for (i = _i = 0; 0 <= xlen ? _i < xlen : _i > xlen; i = 0 <= xlen ? ++_i : --_i) {
          if (!_unify(xs[i], ys[i], equal)) {
            return false;
          }
        }
      }
      return true;
    };
    this.orp = function() {
      var item, items;
      items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      items = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          _results.push((typeof item) === 'string' ? self.literal(item) : item);
        }
        return _results;
      })();
      return function() {
        var i, length, result, start, _i;
        start = self.cur;
        length = items.length;
        for (i = _i = 0; 0 <= length ? _i < length : _i > length; i = 0 <= length ? ++_i : --_i) {
          self.cur = start;
          self.trail = new Trail;
          if (result = items[i]()) {
            return result;
          }
          if (i !== length - 1) {
            self.trail.undo();
          }
        }
        return result;
      };
    };
    this.unifyChar = function(x) {
      return function() {
        var c;
        x = self.trail.deref(x);
        if (x instanceof Var) {
          c = self.data[self.cur++];
          x.bind(c);
          return c;
        } else if (self.data[self.cur] === x) {
          self.cur++;
          return x;
        }
      };
    };
    this.unifyDigit = function(x) {
      return function() {
        var c;
        c = self.data[self.cur];
        if (('0' <= c && c <= '9')) {
          x = self.trail.deref(x);
          if (x instanceof Var) {
            self.cur++;
            x.bind(c);
            return c;
          } else if (x === c) {
            self.cur++;
            return c;
          }
        }
      };
    };
    this.unifyLetter = function(x) {
      return function() {
        var c;
        c = self.data[self.cur];
        if (('a' <= x && x <= 'z') || ('A' <= x && x <= 'Z')) {
          x = self.trail.deref(x);
          if (x instanceof Va) {
            x.bind(c);
            self.cur++;
            return c;
          } else if (x === c) {
            self.cur++;
            return c;
          }
        }
      };
    };
    this.unifyLower = function(x) {
      return function() {
        var c;
        c = self.data[self.cur];
        if (('a' <= x && x <= 'z')) {
          x = self.trail.deref(x);
          if (x instanceof Var) {
            x.bind(c);
            self.cur++;
            return c;
          } else if (x === c) {
            self.cur++;
            return c;
          }
        }
      };
    };
    this.unifyUpper = function(x) {
      return function() {
        var c;
        c = self.data[self.cur];
        if (('A' <= x && x <= 'Z')) {
          x = self.trail.deref(x);
          if (x instanceof Var) {
            x.bind(c);
            self.cur++;
            return c;
          } else if (x === c) {
            self.cur++;
            return c;
          }
        }
      };
    };
    this.unifyIdentifier = function(x) {
      return function() {
        var n;
        if (n = self.identifier() && self.unify(x, n)) {
          return n;
        }
      };
    };
  }

  return Parser;

})(peasy.BaseParser);

exports.Error = Error = (function() {
  function Error(exp, message, stack) {
    this.exp = exp;
    this.message = message != null ? message : '';
    this.stack = stack != null ? stack : this;
  }

  Error.prototype.toString = function() {
    return "" + this.constructor.name + ": " + this.exp + " >>> " + this.message;
  };

  return Error;

})();

exports.BindingError = BindingError = (function(_super) {
  __extends(BindingError, _super);

  function BindingError() {
    return BindingError.__super__.constructor.apply(this, arguments);
  }

  return BindingError;

})(Error);

exports.Trail = Trail = (function() {
  function Trail(data) {
    this.data = data != null ? data : {};
  }

  Trail.prototype.copy = function() {
    return new Trail(peasy.extend({}, this.data));
  };

  Trail.prototype.set = function(vari, value) {
    var data;
    data = this.data;
    if (!data.hasOwnProperty(vari.name)) {
      return data[vari.name] = [vari, value];
    }
  };

  Trail.prototype.undo = function() {
    var nam, pair, _ref, _results;
    _ref = this.data;
    _results = [];
    for (nam in _ref) {
      pair = _ref[nam];
      _results.push(pair[0].binding = pair[1]);
    }
    return _results;
  };

  Trail.prototype.deref = function(x) {
    return (x != null ? typeof x.deref === "function" ? x.deref(this) : void 0 : void 0) || x;
  };

  Trail.prototype.getvalue = function(x, memo) {
    var getvalue;
    if (memo == null) {
      memo = {};
    }
    getvalue = x != null ? x.getvalue : void 0;
    if (getvalue) {
      return getvalue.call(x, this, memo);
    } else {
      return x;
    }
  };

  Trail.prototype.unify = function(x, y, equal) {
    x = this.deref(x);
    y = this.deref(y);
    if (x instanceof Var) {
      this.set(x, x.binding);
      x.binding = y;
      return true;
    } else if (y instanceof Var) {
      this.set(y, y.binding);
      y.binding = x;
      return true;
    } else {
      return (x != null ? typeof x.unify === "function" ? x.unify(y, this) : void 0 : void 0) || (y != null ? typeof y.unify === "function" ? y.unify(x, this) : void 0 : void 0) || equal(x, y);
    }
  };

  return Trail;

})();

exports.Var = Var = (function() {
  function Var(name, binding) {
    this.name = name != null ? name : '';
    this.binding = binding != null ? binding : this;
  }

  Var.prototype.deref = function(trail) {
    var chains, i, length, next, v, x, _i, _j, _ref, _ref1;
    v = this;
    next = this.binding;
    if (next === this || !(next instanceof Var)) {
      return next;
    } else {
      chains = [v];
      length = 1;
      while (1) {
        chains.push(next);
        v = next;
        next = v.binding;
        length++;
        if (next === v) {
          for (i = _i = 0, _ref = chains.length - 2; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
            x = chains[i];
            x.binding = next;
            trail.set(x, chains[i + 1]);
          }
          return next;
        } else if (!(next instanceof Var)) {
          for (i = _j = 0, _ref1 = chains.length - 1; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
            x = chains[i];
            x.binding = next;
            trail.set(x, chains[i + 1]);
          }
          return next;
        }
      }
    }
  };

  Var.prototype.bind = function(value, trail) {
    trail.set(this, this.binding);
    return this.binding = trail.deref(value);
  };

  Var.prototype.getvalue = function(trail, memo) {
    var name, result;
    if (memo == null) {
      memo = {};
    }
    name = this.name;
    if (memo.hasOwnProperty(name)) {
      return memo[name];
    }
    result = this.deref(trail);
    if (result instanceof Var) {
      memo[name] = result;
      return result;
    } else {
      result = trail.getvalue(result, memo);
      memo[name] = result;
      return result;
    }
  };

  Var.prototype.toString = function() {
    return "vari(" + this.name + ")";
  };

  return Var;

})();

reElements = /\s*,\s*|\s+/;

nameToIndexMap = {};

exports.vari = function(name) {
  var index;
  if (name == null) {
    name = '';
  }
  index = nameToIndexMap[name] || 1;
  nameToIndexMap[name] = index + 1;
  return new Var(name + index);
};

exports.vars = function(names) {
  var name, _i, _len, _ref, _results;
  _ref = split(names, reElements);
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    name = _ref[_i];
    _results.push(vari(name));
  }
  return _results;
};

exports.DummyVar = DummyVar = (function(_super) {
  __extends(DummyVar, _super);

  function DummyVar(name) {
    this.name = '_$' + name;
  }

  DummyVar.prototype.deref = function(trail) {
    return this;
  };

  DummyVar.prototype.getvalue = function(trail, memo) {
    var name, result;
    if (memo == null) {
      memo = {};
    }
    name = this.name;
    if (memo.hasOwnProperty(name)) {
      return memo[name];
    }
    result = this.binding;
    if (result === this) {
      memo[name] = result;
      return result;
    } else {
      result = trail.getvalue(result, memo);
      memo[name] = result;
      return result;
    }
  };

  return DummyVar;

})(Var);

exports.dummy = dummy = function(name) {
  var index;
  index = nameToIndexMap[name] || 1;
  nameToIndexMap[name] = index + 1;
  return new exports.DummyVar(name + index);
};

exports.dummies = function(names) {
  var name, _i, _len, _ref, _results;
  _ref = split(names, reElements);
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    name = _ref[_i];
    _results.push(new dummy(name));
  }
  return _results;
};

exports.UObject = UObject = (function() {
  function UObject(data) {
    this.data = data;
  }

  UObject.prototype.getvalue = function(trail, memo) {
    var changed, key, result, v, value, _ref;
    result = {};
    changed = false;
    _ref = this.data;
    for (key in _ref) {
      value = _ref[key];
      v = trail.getvalue(value, memo);
      if (v !== value) {
        changed = true;
      }
      result[key] = v;
    }
    if (changed) {
      return new UObject(result);
    } else {
      return this;
    }
  };

  UObject.prototype.unify = function(y, trail, equal) {
    var index, key, xdata, ydata, ykeys;
    if (equal == null) {
      equal = function(x, y) {
        return x === y;
      };
    }
    xdata = this.data;
    ydata = y instanceof UObject ? y.data : y;
    ykeys = Object.keys(y);
    for (key in xdata) {
      index = ykeys.indexOf(key);
      if (index === -1) {
        return false;
      }
      if (!trail.unify(xdata[key], ydata[key], equal)) {
        return false;
      }
      ykeys.splice(index, 1);
    }
    if (ykeys.length !== 0) {
      return false;
    }
    return true;
  };

  return UObject;

})();

exports.uobject = function(x) {
  return new UObject(x);
};

exports.UArray = UArray = (function() {
  function UArray(data) {
    this.data = data;
  }

  UArray.prototype.getvalue = function(trail, memo) {
    var changed, result, v, x, _i, _len, _ref;
    if (memo == null) {
      memo = {};
    }
    result = [];
    changed = false;
    _ref = this.data;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      x = _ref[_i];
      v = trail.getvalue(x, memo);
      if (v !== x) {
        changed = true;
      }
      result.push(v);
    }
    if (changed) {
      return new UArray(result);
    } else {
      return this;
    }
  };

  UArray.prototype.unify = function(y, trail, equal) {
    var i, length, xdata, ydata, _i;
    if (equal == null) {
      equal = function(x, y) {
        return x === y;
      };
    }
    xdata = this.data;
    ydata = y.data || y;
    length = this.data.length;
    if (length !== y.length) {
      return false;
    }
    for (i = _i = 0; 0 <= length ? _i < length : _i > length; i = 0 <= length ? ++_i : --_i) {
      if (!trail.unify(xdata[i], ydata[i], equal)) {
        return false;
      }
    }
    return true;
  };

  UArray.prototype.toString = function() {
    return this.data.toString();
  };

  return UArray;

})();

exports.uarray = uarray = function(x) {
  return new UArray(x);
};

exports.Cons = Cons = (function() {
  function Cons(head, tail) {
    this.head = head;
    this.tail = tail;
  }

  Cons.prototype.getvalue = function(trail, memo) {
    var head, head1, tail, tail1;
    if (memo == null) {
      memo = {};
    }
    head = this.head;
    tail = this.tail;
    head1 = trail.getvalue(head, memo);
    tail1 = trail.getvalue(tail, memo);
    if (head1 === head && tail1 === tail) {
      return this;
    } else {
      return new Cons(head1, tail1);
    }
  };

  Cons.prototype.unify = function(y, trail, equal) {
    if (equal == null) {
      equal = function(x, y) {
        return x === y;
      };
    }
    if (!(y instanceof Cons)) {
      return false;
    } else if (!trail.unify(this.head, y.head, equal)) {
      return false;
    } else {
      return trail.unify(this.tail, y.tail, equal);
    }
  };

  Cons.prototype.flatString = function() {
    var result, tail;
    result = "" + this.head;
    tail = this.tail;
    if (tail === null) {
      result += '';
    } else if (tail instanceof Cons) {
      result += ',';
      result += tail.flatString();
    } else {
      result += tail.toString();
    }
    return result;
  };

  Cons.prototype.toString = function() {
    return "cons(" + this.head + ", " + this.tail + ")";
  };

  return Cons;

})();

exports.cons = function(x, y) {
  return new Cons(x, y);
};

exports.conslist = function() {
  var args, i, result, _i, _ref;
  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  result = null;
  for (i = _i = _ref = args.length - 1; _i >= 0; i = _i += -1) {
    result = new Cons([args[i], result]);
  }
  return result;
};

exports.unifiable = function(x) {
  if (peasy.isArray(x)) {
    return new UArray(x);
  } else if (peasy.isObject(x)) {
    return new UObject(x);
  } else {
    return x;
  }
};


})();// wrap line by gulp-twoside
(function() {var ts = twoside('peasy/linepeasy.js'), require = ts.require, exports = ts.exports, module = ts.module; // wrap line by gulp-twoside for providing twoside module


/* an extended parser with lineno and row support */
var Parser, exports, peasy,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __slice = [].slice;

peasy = require("./peasy");

exports = module.exports = {};

if (typeof window === 'object') {
  peasy.extend(exports, peasy);
}

exports.Parser = Parser = (function(_super) {
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
    lineparser.number = this.number = function() {
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
      self.row += cur - self.cur;
      self.cur = cur;
      return data.slice(start, cur);
    };
    lineparser.string = this.string = function() {
      var c, c1, cur, quote, row, start, text, wrap;
      text = self.data;
      start = cur = self.cur;
      row = self.row;
      c = text[cur];
      if (c === '"') {
        quote = c;
        wrap = '"';
        row++;
      } else if (c === "'") {
        quote = c;
        wrap = "'";
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


})();// wrap line by gulp-twoside
(function() {var ts = twoside('peasy/index.js'), require = ts.require, exports = ts.exports, module = ts.module; // wrap line by gulp-twoside for providing twoside module

var exports, extend, linepeasy;

exports = module.exports = {};

exports.peasy = require('./peasy');

extend = exports.peasy.extend;

extend(exports, exports.peasy);

exports.logicpeasy = require('./logicpeasy');

extend(exports, exports.logicpeasy);

linepeasy = require('./linepeasy');

extend(exports, exports.linepeasy);


})();// wrap line by gulp-twoside