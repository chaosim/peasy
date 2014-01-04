/* an extended parser with logic features*/

var exports, module, require, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

if (typeof window === 'object') {
  _ref = twoside('/logicpeasy'), require = _ref.require, exports = _ref.exports, module = _ref.module;
}

(function(require, exports, module) {
  var BindingError, Cons, DummyVar, Error, Parser, Trail, UArray, UObject, Var, dummy, isMatcher, nameToIndexMap, peasy, reElements, uarray, _ref1;
  isMatcher = (peasy = require("./peasy")).isMatcher;
  exports.Parser = Parser = (function(_super) {
    __extends(Parser, _super);

    function Parser() {
      Parser.__super__.constructor.apply(this, arguments);
    }

    Parser.prototype.parse = function(data, root, cur) {
      this.data = data;
      if (root == null) {
        root = this.root;
      }
      this.cur = cur != null ? cur : 0;
      this.trail = new Trail;
      this.ruleStack = {};
      this.cache = {};
      return root();
    };

    Parser.prototype.bind = function(vari, term) {
      vari.bind(this.trail.deref(term));
      return true;
    };

    Parser.prototype.unify = function(x, y, compare) {
      if (compare == null) {
        compare = (function(x, y) {
          return x === y;
        });
      }
      return this.trail.unify(x, y, compare);
    };

    Parser.prototype.unifyList = function(xs, ys, compare) {
      var i, xlen, _i, _unify;
      if (compare == null) {
        compare = (function(x, y) {
          return x === y;
        });
      }
      xlen = xs.length;
      if (ys.length !== xlen) {
        return false;
      } else {
        _unify = this.trail.unify;
        for (i = _i = 0; 0 <= xlen ? _i < xlen : _i > xlen; i = 0 <= xlen ? ++_i : --_i) {
          if (!_unify(xs[i], ys[i], compare)) {
            return false;
          }
        }
      }
      return true;
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
          _results.push(!isMatcher(item) ? this.literal(item) : item);
        }
        return _results;
      }).call(this);
      return function() {
        var i, length, result, start, _i;
        start = _this.cur;
        length = items.length;
        for (i = _i = 0; 0 <= length ? _i < length : _i > length; i = 0 <= length ? ++_i : --_i) {
          _this.cur = start;
          _this.trail = new Trail;
          if (result = items[i]()) {
            return result;
          }
          if (i !== length - 1) {
            _this.trail.undo();
          }
        }
        return result;
      };
    };

    Parser.prototype.unifyChar = function(x) {
      var _this = this;
      return function() {
        var c;
        x = _this.trail.deref(x);
        if (x instanceof Var) {
          c = _this.data[_this.cur++];
          x.bind(c);
          return c;
        } else if (_this.data[_this.cur] === x) {
          _this.cur++;
          return x;
        }
      };
    };

    Parser.prototype.unifyDigit = function(x) {
      var _this = this;
      return function() {
        var c;
        c = _this.data[_this.cur];
        if (('0' <= c && c <= '9')) {
          x = _this.trail.deref(x);
          if (x instanceof Var) {
            _this.cur++;
            x.bind(c);
            return c;
          } else if (x === c) {
            _this.cur++;
            return c;
          }
        }
      };
    };

    Parser.prototype.unifyLetter = function(x) {
      return function() {
        var c;
        c = this.data[this.cur];
        if (('a' <= x && x <= 'z') || ('A' <= x && x <= 'Z')) {
          x = this.trail.deref(x);
          if (x instanceof Va) {
            x.bind(c);
            this.cur++;
            return c;
          } else if (x === c) {
            this.cur++;
            return c;
          }
        }
      };
    };

    Parser.prototype.unifyLower = function(x) {
      var _this = this;
      return function() {
        var c;
        c = _this.data[_this.cur];
        if (('a' <= x && x <= 'z')) {
          x = _this.trail.deref(x);
          if (x instanceof Var) {
            x.bind(c);
            _this.cur++;
            return c;
          } else if (x === c) {
            _this.cur++;
            return c;
          }
        }
      };
    };

    Parser.prototype.unifyUpper = function(x) {
      var _this = this;
      return function() {
        var c;
        c = _this.data[_this.cur];
        if (('A' <= x && x <= 'Z')) {
          x = _this.trail.deref(x);
          if (x instanceof Var) {
            x.bind(c);
            _this.cur++;
            return c;
          } else if (x === c) {
            _this.cur++;
            return c;
          }
        }
      };
    };

    Parser.prototype.unifyIdentifier = function(x) {
      var _this = this;
      return function() {
        var n;
        if (n = _this.identifier() && _this.unify(x, n)) {
          return n;
        }
      };
    };

    return Parser;

  })(peasy.Parser);
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
      _ref1 = BindingError.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    return BindingError;

  })(Error);
  exports.Trail = Trail = (function() {
    function Trail(data) {
      this.data = data != null ? data : {};
    }

    Trail.prototype.copy = function() {
      return new Trail(_.extend({}, this.data));
    };

    Trail.prototype.set = function(vari, value) {
      var data;
      data = this.data;
      if (!data.hasOwnProperty(vari.name)) {
        return data[vari.name] = [vari, value];
      }
    };

    Trail.prototype.undo = function() {
      var nam, pair, _ref2, _results;
      _ref2 = this.data;
      _results = [];
      for (nam in _ref2) {
        pair = _ref2[nam];
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

    Trail.prototype.unify = function(x, y, compare) {
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
        return (x != null ? typeof x.unify === "function" ? x.unify(y, this) : void 0 : void 0) || (y != null ? typeof y.unify === "function" ? y.unify(x, this) : void 0 : void 0) || compare(x, y);
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
      var chains, i, length, next, v, x, _i, _j, _ref2, _ref3;
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
            for (i = _i = 0, _ref2 = chains.length - 2; 0 <= _ref2 ? _i < _ref2 : _i > _ref2; i = 0 <= _ref2 ? ++_i : --_i) {
              x = chains[i];
              x.binding = next;
              trail.set(x, chains[i + 1]);
            }
            return next;
          } else if (!(next instanceof Var)) {
            for (i = _j = 0, _ref3 = chains.length - 1; 0 <= _ref3 ? _j < _ref3 : _j > _ref3; i = 0 <= _ref3 ? ++_j : --_j) {
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
    var name, _i, _len, _ref2, _results;
    _ref2 = split(names, reElements);
    _results = [];
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      name = _ref2[_i];
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
    var name, _i, _len, _ref2, _results;
    _ref2 = split(names, reElements);
    _results = [];
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      name = _ref2[_i];
      _results.push(new dummy(name));
    }
    return _results;
  };
  exports.UObject = UObject = (function() {
    function UObject(data) {
      this.data = data;
    }

    UObject.prototype.getvalue = function(trail, memo) {
      var changed, key, result, v, value, _ref2;
      result = {};
      changed = false;
      _ref2 = this.data;
      for (key in _ref2) {
        value = _ref2[key];
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

    UObject.prototype.unify = function(y, trail, compare) {
      var index, key, xdata, ydata, ykeys;
      if (compare == null) {
        compare = function(x, y) {
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
        if (!trail.unify(xdata[key], ydata[key], compare)) {
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
      var changed, result, v, x, _i, _len, _ref2;
      if (memo == null) {
        memo = {};
      }
      result = [];
      changed = false;
      _ref2 = this.data;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        x = _ref2[_i];
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

    UArray.prototype.unify = function(y, trail, compare) {
      var i, length, xdata, ydata, _i;
      if (compare == null) {
        compare = function(x, y) {
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
        if (!trail.unify(xdata[i], ydata[i], compare)) {
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

    Cons.prototype.unify = function(y, trail, compare) {
      if (compare == null) {
        compare = function(x, y) {
          return x === y;
        };
      }
      if (!(y instanceof Cons)) {
        return false;
      } else if (!trail.unify(this.head, y.head, compare)) {
        return false;
      } else {
        return trail.unify(this.tail, y.tail, compare);
      }
    };

    Cons.prototype.flatString = function() {
      var result, tail;
      result = "" + this.head;
      tail = this.tail;
      if (tail === null) {
        null;
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
    var args, i, result, _i, _ref2;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    result = null;
    for (i = _i = _ref2 = args.length - 1; _i >= 0; i = _i += -1) {
      result = new Cons([args[i], result]);
    }
    return result;
  };
  return exports.unifiable = function(x) {
    if (_.isArray(x)) {
      return new UArray(x);
    } else if (_.isObject(x)) {
      return new UObject(x);
    } else {
      return x;
    }
  };
})(require, exports, module);
