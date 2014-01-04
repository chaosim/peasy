var exports, module, require, _ref,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __slice = [].slice;

if (typeof window === 'object') {
  _ref = twoside('/deprecated/autopeasy'), require = _ref.require, exports = _ref.exports, module = _ref.module;
}

(function(require, exports, module) {
  var ObjecttoString, autoRecursive, computeLeftRecursives, cursor, followIdentifierLetter_, functionCache, grammar, hasOwnProperty, identifierLetter, identifierLetter_, isIdentifierLetter, isRule, isString, literal, literal_, memo, memoAutoRecursive, memoRules, memorize, memorizedRecursivs, originalRules, parseCache, recursiveRules, setMemoTag, setMemorizeRules, symbolDescedentsMap, symbolToTagMap, tags, text, textLength;
  text = '';
  textLength = 0;
  cursor = 0;
  grammar = void 0;
  originalRules = {};
  recursiveRules = {};
  memorizedRecursivs = {};
  memoRules = {};
  symbolDescedentsMap = {};
  symbolToTagMap = {};
  tags = {};
  parseCache = {};
  functionCache = {};
  hasOwnProperty = Object.hasOwnProperty;
  exports.initialize = function() {
    parseCache = {};
    functionCache = {};
    originalRules = {};
    recursiveRules = {};
    memorizedRecursivs = {};
    memoRules = {};
    symbolDescedentsMap = {};
    symbolToTagMap = {};
    tags = {};
    return parseCache = {};
  };
  exports.parse = function(data, aGrammar, root) {
    text = data;
    textLength = text.length;
    cursor = 0;
    root = root || aGrammar.rootSymbol;
    grammar = aGrammar;
    return grammar[root](0);
  };
  isRule = function(grammar, name) {
    var e, property, result;
    if (hasOwnProperty.call(functionCache, name)) {
      return functionCache[name];
    }
    if (!hasOwnProperty.call(grammar, name)) {
      result = false;
    } else {
      property = grammar[name];
      if (typeof property !== "function") {
        result = false;
      } else {
        try {
          if (typeof (property(spaces)) === "function") {
            result = false;
          }
        } catch (_error) {
          e = _error;
          result = true;
        }
      }
    }
    functionCache[name] = result;
    return result;
  };
  exports.autoComputeLeftRecursives = computeLeftRecursives = function(grammar) {
    var appendToPaths, circle, circles, currentLeftHand, descendents, i, length, meetTable, memorized, parentToChildren, path, paths, pathsCount, sym, symbol, symbolPathsMap, _fn, _i, _j, _len;
    originalRules = {};
    for (symbol in grammar) {
      if (!isRule(grammar, symbol)) {
        break;
      }
      originalRules[symbol] = grammar[symbol];
    }
    parentToChildren = {};
    currentLeftHand = null;
    _fn = function(symbol) {
      return grammar[symbol] = function(start) {
        var children;
        if (start !== 0) {

        } else {
          cursor++;
          children = parentToChildren[currentLeftHand] != null ? parentToChildren[currentLeftHand] : parentToChildren[currentLeftHand] = [];
          if (__indexOf.call(children, symbol) < 0) {
            return children.push(symbol);
          }
        }
      };
    };
    for (symbol in grammar) {
      if (!isRule(grammar, symbol)) {
        break;
      }
      _fn(symbol);
    }
    for (symbol in grammar) {
      if (!isRule(grammar, symbol)) {
        break;
      }
      currentLeftHand = symbol;
      originalRules[symbol](0);
    }
    appendToPaths = function(symbol, meetTable, paths) {
      var chidlren, child, length, path, _i, _j, _len, _len1, _results;
      if (!(chidlren = parentToChildren[symbol])) {
        return;
      }
      _results = [];
      for (_i = 0, _len = chidlren.length; _i < _len; _i++) {
        child = chidlren[_i];
        for (_j = 0, _len1 = paths.length; _j < _len1; _j++) {
          path = paths[_j];
          length = path.length;
          if (length > 1 && path[length - 1] === path[0]) {
            continue;
          } else if (__indexOf.call(path, child) >= 0) {
            if (child === path[0]) {
              path.push(child);
            } else {
              continue;
            }
          } else {
            path.push(child);
          }
        }
        if (!meetTable[child]) {
          _results.push(appendToPaths(child, meetTable, paths));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    symbolPathsMap = {};
    for (symbol in grammar) {
      if (!isRule(grammar, symbol)) {
        break;
      }
      meetTable = {};
      meetTable[symbol] = true;
      paths = symbolPathsMap[symbol] != null ? symbolPathsMap[symbol] : symbolPathsMap[symbol] = [[symbol]];
      appendToPaths(symbol, meetTable, paths);
      i = 0;
      pathsCount = paths.length;
      circles = [];
      while (i < pathsCount) {
        path = paths[i++];
        length = path.length;
        if (path[length - 1] === symbol) {
          path.pop();
          circles.push(path);
        }
      }
      if (circles.length) {
        symbolPathsMap[symbol] = circles;
      } else {
        delete symbolPathsMap[symbol];
      }
    }
    for (symbol in grammar) {
      if (!isRule(grammar, symbol)) {
        continue;
      }
      if (!hasOwnProperty.call(symbolPathsMap, symbol)) {
        grammar[symbol] = originalRules[symbol];
        delete originalRules[symbol];
        continue;
      }
      descendents = symbolDescedentsMap[symbol] = [];
      grammar[symbol] = recursiveRules[symbol] = autoRecursive(symbol);
      memoRules[symbol] = memo(symbol);
      circles = symbolPathsMap[symbol];
      for (_i = 0, _len = circles.length; _i < _len; _i++) {
        circle = circles[_i];
        length = circle.length;
        memorized = false;
        for (i = _j = 0; 0 <= length ? _j < length : _j > length; i = 0 <= length ? ++_j : --_j) {
          sym = circle[i];
          if (__indexOf.call(descendents, sym) < 0) {
            descendents.push(sym);
          }
          if (memorizedRecursivs[sym]) {
            memorized = true;
          }
          if (i === length - 1 && !memorized) {
            memorizedRecursivs[sym] = memoAutoRecursive(sym);
          }
        }
      }
    }
    symbolPathsMap = void 0;
    return functionCache = void 0;
  };
  autoRecursive = function(symbol) {
    return function(start) {
      var child, hash, m, memoRule, result, rule, _i, _j, _len, _len1, _ref1, _ref2;
      _ref1 = symbolDescedentsMap[symbol];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        child = _ref1[_i];
        memoRule = memorizedRecursivs[child];
        if (memoRule) {
          grammar[child] = memoRule;
        } else {
          grammar[child] = originalRules[child];
        }
      }
      hash = symbol + start;
      m = parseCache[hash] != null ? parseCache[hash] : parseCache[hash] = [void 0, -1];
      if (m[1] >= 0) {
        cursor = m[1];
        return m[0];
      }
      rule = grammar[symbol];
      while (1) {
        result = rule(start);
        if (m[1] < 0) {
          m[0] = result;
          if (result) {
            m[1] = cursor;
          } else {
            m[1] = start;
          }
          continue;
        } else {
          if (m[1] === cursor) {
            m[0] = result;
            return result;
          } else if (cursor < m[1]) {
            m[0] = result;
            cursor = m[1];
            return result;
          } else {
            m[0] = result;
            m[1] = cursor;
          }
        }
      }
      _ref2 = symbolDescedentsMap[symbol];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        child = _ref2[_j];
        grammar[child] = recursiveRules[child];
      }
      return result;
    };
  };
  memoAutoRecursive = function(symbol) {
    var rule;
    rule = originalRules[symbol];
    return function(start) {
      var child, descendents, memoRecursive, result, _i, _j, _len, _len1;
      descendents = symbolDescedentsMap[symbol];
      for (_i = 0, _len = descendents.length; _i < _len; _i++) {
        child = descendents[_i];
        grammar[child] = memoRules[child];
      }
      result = rule(start);
      for (_j = 0, _len1 = descendents.length; _j < _len1; _j++) {
        child = descendents[_j];
        memoRecursive = memorizedRecursivs[child];
        if (memoRecursive) {
          grammar[child] = memoRecursive;
        } else {
          grammar[child] = originalRules[child];
        }
      }
      return result;
    };
  };
  setMemoTag = function(symbol) {
    var i, tag, _ref1;
    i = 1;
    while (1) {
      if (_ref1 = hasOwnProperty.call(tags, symbol.slice(0, i)), __indexOf.call(tags, _ref1) >= 0) {
        i++;
      } else {
        break;
      }
    }
    tag = symbol.slice(0, i);
    symbolToTagMap[symbol] = tag;
    return tags[tag] = true;
  };
  setMemorizeRules = function(grammar, symbols) {
    var symbol, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = symbols.length; _i < _len; _i++) {
      symbol = symbols[_i];
      originalRules[symbol] = grammar[symbol];
      _results.push(grammar[symbol] = memorize(symbol));
    }
    return _results;
  };
  memorize = function(symbol) {
    var rule, tag;
    tag = symbolToTagMap[symbol];
    rule = originalRules[symbol];
    return function(start) {
      var hash, m, result;
      hash = tag + start;
      m = parseCache[hash];
      if (m) {
        cursor = m[1];
        return m[0];
      } else {
        result = rule(start);
        parseCache[hash] = [result, cursor];
        return result;
      }
    };
  };
  exports.memo = memo = function(symbol) {
    return function(start) {
      var hash, m;
      hash = symbol + start;
      m = parseCache[hash];
      if (m) {
        return m[0];
      }
    };
  };
  exports.andp = function(exps) {
    var exp;
    exps = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = exps.length; _i < _len; _i++) {
        exp = exps[_i];
        if (isString(exp)) {
          _results.push(literal(exp));
        } else {
          _results.push(exp);
        }
      }
      return _results;
    })();
    return function(start) {
      var result, _i, _len;
      cursor = start;
      for (_i = 0, _len = exps.length; _i < _len; _i++) {
        exp = exps[_i];
        if (!(result = exp(cursor))) {
          return;
        }
      }
      return result;
    };
  };
  exports.orp = function() {
    var exp, exps;
    exps = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    exps = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = exps.length; _i < _len; _i++) {
        exp = exps[_i];
        if (isString(exp)) {
          _results.push(literal(exp));
        } else {
          _results.push(exp);
        }
      }
      return _results;
    })();
    return function(start) {
      var result, _i, _len;
      for (_i = 0, _len = exps.length; _i < _len; _i++) {
        exp = exps[_i];
        if (result = exp(start)) {
          return result;
        }
        return result;
      }
    };
  };
  exports.notp = function(exp) {
    if (isString(exp)) {
      exp = literal(exp);
    }
    return function(start) {
      return !exp(start);
    };
  };
  exports.any = function(exp) {
    if (isString(exp)) {
      exp = literal(exp);
    }
    return function(start) {
      var result, x;
      result = [];
      cursor = start;
      while ((x = exp(cursor))) {
        result.push(x);
      }
      return result;
    };
  };
  exports.some = function(exp) {
    if (isString(exp)) {
      exp = literal(exp);
    }
    return function(start) {
      var result, x;
      result = [];
      cursor = start;
      if (!(x = exp(cursor))) {
        return x;
      }
      while (1) {
        result.push(x);
        x = exp(cursor);
        if (!x) {
          break;
        }
      }
      return result;
    };
  };
  exports.may = exports.optional = function(exp) {
    if (isString(exp)) {
      exp = literal(exp);
    }
    return function(start) {
      var x;
      cursor = start;
      if (x = exp(cursor)) {
        return x;
      } else {
        cursor = start;
        return true;
      }
    };
  };
  exports.follow = function(exp) {
    if (isString(exp)) {
      exp = literal(exp);
    }
    return function(start) {
      var x;
      cursor = start;
      if (x = exp(cursor)) {
        cursor = start;
        return x;
      }
    };
  };
  exports.times = function(exp, n) {
    if (isString(exp)) {
      exp = literal(exp);
    }
    return function(start) {
      var i, x;
      cursor = start;
      i = 0;
      while (i++ < n) {
        if (x = exp(cursor)) {
          result.push(x);
        } else {
          return;
        }
      }
      return result;
    };
  };
  exports.seperatedList = function(exp, separator) {
    if (separator == null) {
      separator = spaces;
    }
    if (isString(exp)) {
      exp = literal(exp);
    }
    if (isString(separator)) {
      separator = literal(separator);
    }
    return function(start) {
      var result, x;
      cursor = start;
      result = [];
      x = exp(cursor);
      if (!x) {
        return;
      }
      while (1) {
        result.push(x);
        if (!(x = exp(cursor))) {
          break;
        }
      }
      return result;
    };
  };
  exports.timesSeperatedList = function(exp, n, separator) {
    if (separator == null) {
      separator = spaces;
    }
    if (isString(exp)) {
      exp = literal(exp);
    }
    if (isString(separator)) {
      separator = literal(separator);
    }
    return function(start) {
      var i, result, x;
      cursor = start;
      result = [];
      x = exp(cursor);
      if (!x) {
        return;
      }
      i = 1;
      while (i++ < n) {
        result.push(x);
        if (!(x = exp(cursor))) {
          break;
        }
      }
      return result;
    };
  };
  exports.char = function(c) {
    return function(start) {
      if (text[start] === c) {
        cursor = start + 1;
        return c;
      }
    };
  };
  exports.char_ = function(c) {
    return function() {
      if (text[cursor] === c) {
        cursor++;
        return c;
      }
    };
  };
  exports.literal = literal = function(string) {
    return function(start) {
      var len, stop;
      len = string.length;
      if (text.slice(start, stop = start + len) === string) {
        cursor = stop;
        return true;
      }
    };
  };
  exports.literal_ = literal_ = function(string) {
    return function(start) {
      var len, stop;
      len = string.length;
      if (text.slice(cursor, stop = cursor + len) === string) {
        cursor = stop;
        return true;
      }
    };
  };
  exports.spaces = function(start) {
    var len;
    len = 0;
    cursor = start;
    text = text;
    while (1) {
      switch (text[cursor++]) {
        case ' ':
          len++;
          break;
        case '\t':
          len += tabWidth;
          break;
        default:
          break;
      }
    }
    return len;
  };
  exports.spaces_ = function() {
    var len;
    len = 0;
    text = text;
    while (1) {
      switch (text[cursor++]) {
        case ' ':
          len++;
          break;
        case '\t':
          len += tabWidth;
          break;
        default:
          break;
      }
    }
    return len;
  };
  exports.spaces1 = function(start) {
    var len;
    len = 0;
    cursor = start;
    text = text;
    while (1) {
      switch (text[cursor++]) {
        case ' ':
          len++;
          break;
        case '\t':
          len += tabWidth;
          break;
        default:
          break;
      }
    }
    if (len) {
      return cursor = cursor;
      return len;
    }
  };
  exports.spaces1_ = function() {
    var len;
    len = 0;
    cursor = start;
    while (1) {
      switch (text[cursor++]) {
        case ' ':
          len++;
          break;
        case '\t':
          len += tabWidth;
          break;
        default:
          break;
      }
    }
    if (len) {
      return cursor = cursor;
      return len;
    }
  };
  exports.wrap = function(item, left, right) {
    if (left == null) {
      left = spaces;
    }
    if (right == null) {
      right = spaces;
    }
    if (isString(item)) {
      item = literal(item);
    }
    return function(start) {
      var result;
      if (left(start) && (result = item(cursor) && right(cursor))) {
        return result;
      }
    };
  };
  exports.getcursor = exports.cur = function() {
    return cursor;
  };
  exports.setcursor = exports.setcur = function(pos) {
    return cursor = pos;
  };
  identifierLetter = function(start) {
    var c;
    start = cursor;
    c = text[cursor];
    if (c === '$' || c === '_' || ('a' <= c && c < 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9')) {
      cursor++;
      return true;
    }
  };
  identifierLetter_ = function() {
    var c;
    c = text[cursor];
    if (c === '$' || c === '_' || ('a' <= c && c < 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9')) {
      cursor++;
      return true;
    }
  };
  followIdentifierLetter_ = function() {
    var c;
    c = text[cursor];
    return c === '$' || c === '_' || ('a' <= c && c < 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9');
  };
  isIdentifierLetter = function(c) {
    return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9') || 'c' === '$' || 'c' === '_';
  };
  ObjecttoString = Object.prototype.toString;
  exports.isString = isString = function(x) {
    return ObjecttoString.call(x) === '[object String]';
  };
  exports.isdigit = function(c) {
    return ('0' <= c && c <= '9');
  };
  exports.digit = function(start) {
    var c;
    c = text[start];
    if (('0' <= c && c <= '9')) {
      return cursor = start + 1;
    }
  };
  exports.digit_ = function() {
    var c;
    c = text[cursor];
    if (('0' <= c && c <= '9')) {
      return cursor++;
    }
  };
  exports.isletter = exports.isalpha = function(c) {
    return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z');
  };
  exports.letter = exports.alpha = function(start) {
    var c;
    c = text[start];
    if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z')) {
      return cursor = start + 1;
    }
  };
  exports.letter_ = exports.alpha_ = function() {
    var c;
    c = text[cursor];
    if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z')) {
      return cursor++;
    }
  };
  exports.islower = function(c) {
    return ('a' <= c && c <= 'z');
  };
  exports.lower = function(start) {
    var c;
    c = text[start];
    if (('a' <= c && c <= 'z')) {
      return cursor = start + 1;
    }
  };
  exports.lower_ = function() {
    var c;
    c = text[cursor];
    if (('a' <= c && c <= 'z')) {
      return cursor++;
    }
  };
  exports.isupper = function(c) {
    return ('A' <= c && c <= 'Z');
  };
  exports.upper = function(start) {
    var c;
    c = text[start];
    if (('A' <= c && c <= 'Z')) {
      return cursor = start + 1;
    }
  };
  exports.upper_ = function(start) {
    var c;
    c = text[cursor];
    if (('A' <= c && c <= 'Z')) {
      return cursor++;
    }
  };
  exports.identifier = function(start) {
    var c;
    cursor = start;
    c = text[cursor];
    if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || 'c' === '$' || 'c' === '_') {
      cursor++;
    } else {
      return;
    }
    while (1) {
      c = text[cursor];
      if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9') || 'c' === '$' || 'c' === '_') {
        cursor++;
      } else {
        break;
      }
    }
    return true;
  };
  return exports.identifier = function(start) {
    var c;
    c = text[cursor];
    if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || 'c' === '$' || 'c' === '_') {
      cursor++;
    } else {
      return;
    }
    while (1) {
      c = text[cursor];
      if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9') || 'c' === '$' || 'c' === '_') {
        cursor++;
      } else {
        break;
      }
    }
    return true;
  };
})(require, exports, module);
