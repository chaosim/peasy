// Generated by CoffeeScript 1.6.2
(function() {
  var ObjecttoString, computeLeftRecursives, cursor, followIdentifierLetter_, grammar, hasOwnProperty, identifierLetter, identifierLetter_, isIdentifierLetter, isString, literal, literal_, memo, memoCache, memorize, notp, originalRules, orp, prepareGrammar, recursive, setMemoTag, setMemorizeRules, symbolDescedentsMap, symbolToTagMap, tags, text, textLength, _memo,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  grammar = void 0;

  originalRules = {};

  text = '';

  textLength = 0;

  cursor = 0;

  symbolDescedentsMap = {};

  memoCache = {};

  symbolToTagMap = {};

  tags = {};

  _memo = {};

  hasOwnProperty = Object.hasOwnProperty;

  exports.parse = function(data, aGrammar, start) {
    start = start || aGrammar.rootSymbol;
    text = data;
    textLength = text.length;
    cursor = 0;
    memoCache = {};
    grammar = aGrammar;
    return grammar[start](0);
  };

  exports.addParentChildrens = function() {
    var children, grammar, list, map, name, parent, parentChildren, parentChildrens, _i, _j, _len, _len1, _ref, _ref1;

    grammar = arguments[0], parentChildrens = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    map = (_ref = grammar.parentToChildren) != null ? _ref : grammar.parentToChildren = {};
    for (_i = 0, _len = parentChildrens.length; _i < _len; _i++) {
      parentChildren = parentChildrens[_i];
      for (parent in parentChildren) {
        children = parentChildren[parent];
        list = (_ref1 = map[parent]) != null ? _ref1 : map[parent] = [];
        for (_j = 0, _len1 = children.length; _j < _len1; _j++) {
          name = children[_j];
          if (__indexOf.call(list, name) < 0) {
            list.push(name);
          }
        }
      }
    }
    return null;
  };

  exports.addRecursiveCircles = function() {
    var circle, grammar, i, j, length, list, map, name, parent, recursiveCircles, _i, _len, _ref, _ref1;

    grammar = arguments[0], recursiveCircles = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    map = (_ref = grammar.parentToChildren) != null ? _ref : grammar.parentToChildren = {};
    for (_i = 0, _len = recursiveCircles.length; _i < _len; _i++) {
      circle = recursiveCircles[_i];
      i = 0;
      length = circle.length;
      while (i < length) {
        if (i === length - 1) {
          j = 0;
        } else {
          j = i + 1;
        }
        name = circle[i];
        parent = circle[j];
        list = (_ref1 = map[parent]) != null ? _ref1 : map[parent] = [];
        if (__indexOf.call(list, name) < 0) {
          list.push(name);
        }
        i++;
      }
    }
    return null;
  };

  exports.computeLeftRecursives = function(grammar) {
    var addDescendents, descendents, meetTable, parentToChildren, symbol;

    parentToChildren = grammar.parentToChildren;
    addDescendents = function(symbol, meetTable, descedents) {
      var child, children, _i, _len, _results;

      children = parentToChildren[symbol];
      _results = [];
      for (_i = 0, _len = children.length; _i < _len; _i++) {
        child = children[_i];
        if (__indexOf.call(descedents, child) < 0) {
          descedents.push(child);
        }
        if (!meetTable[child]) {
          _results.push(addDescendents(child, meetTable, descedents));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    symbolDescedentsMap = {};
    for (symbol in parentToChildren) {
      meetTable = {};
      meetTable[symbol] = true;
      descendents = symbolDescedentsMap[symbol] = [];
      addDescendents(symbol, meetTable, descendents);
      if (__indexOf.call(descendents, symbol) >= 0) {
        originalRules[symbol] = grammar[symbol];
        grammar[symbol] = recursive(symbol);
      }
    }
    return symbolDescedentsMap;
  };

  exports.prepareGrammar = prepareGrammar = function(grammar) {
    originalRules = {};
    return autoComputeLeftRecursives(grammar);
  };

  exports.autoComputeLeftRecursives = computeLeftRecursives = function(grammar) {
    var addDescendents, currentLeftHand, descendents, meetTable, symbol;

    currentLeftHand = null;
    for (symbol in grammar) {
      if (hasOwnProperty.call(grammar, symbol)) {
        (function(symbol) {
          return grammar[symbol] = function(start) {
            var children, _ref;

            if (start !== 0) {

            } else {
              cursor++;
              children = (_ref = parentToChildren[currentLeftHand]) != null ? _ref : parentToChildren[currentLeftHand] = [];
              if (__indexOf.call(children, symbol) < 0) {
                return children.push(symbol);
              }
            }
          };
        })(symbol);
      }
    }
    for (symbol in grammar) {
      currentLeftHand = symbol;
      originalRules[symbol](0);
    }
    addDescendents = function(symbol, meetTable, descedents) {
      var chidlren, child, _i, _len, _results;

      if (!(chidlren = parentToChildren[symbol])) {
        return;
      }
      _results = [];
      for (_i = 0, _len = chidlren.length; _i < _len; _i++) {
        child = chidlren[_i];
        if (__indexOf.call(descedents, child) < 0) {
          descedents.push(child);
        }
        if (!meetTable[child]) {
          _results.push(addDescendents(child, meetTable, descedents));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    symbolDescedentsMap = {};
    for (symbol in grammar) {
      meetTable = {};
      meetTable[symbol] = true;
      descendents = symbolDescedentsMap[symbol] = [];
      addDescendents(symbol, meetTable, descendents);
      if (__indexOf.call(descendents, symbol) >= 0) {
        grammar[symbol] = recursiveRules[symbol] = recursive(symbol);
        memoRules[symbol] = memo(symbol);
        recRules[symbol] = rec(symbol);
      } else {
        grammar[symbol] = originalRules[symbol];
      }
    }
    for (symbol in grammar) {
      if (!hasOwnProperty.call(recursiveRules, symbol)) {
        delete symbolDescedentsMap[symbol];
      } else {
        descendents = symbolDescedentsMap[symbol];
        symbolDescedentsMap[symbol] = ((function() {
          var _i, _len, _results;

          if (hasOwnProperty.call(recursiveRules, symbol)) {
            _results = [];
            for (_i = 0, _len = descendents.length; _i < _len; _i++) {
              symbol = descendents[_i];
              _results.push(symbol);
            }
            return _results;
          }
        })());
      }
    }
    return symbolDescedentsMap;
  };

  exports.recursive = recursive = function(symbol) {
    var originalRule;

    originalRule = originalRules[symbol];
    return function(start) {
      var child, hash, m, result, _i, _j, _len, _len1, _ref, _ref1, _ref2;

      _ref = symbolDescedentsMap[symbol];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (child !== symbol) {
          grammar[child] = originalRules[child];
        }
      }
      hash = symbol + start;
      m = (_ref1 = memoCache[hash]) != null ? _ref1 : memoCache[hash] = [void 0, -1];
      if (m[1] >= 0) {
        cursor = m[1];
        return m[0];
      }
      while (1) {
        result = originalRule(start);
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
        if (child !== symbol) {
          grammar[child] = recursive(child);
        }
      }
      return result;
    };
  };

  setMemoTag = function(symbol) {
    var i, tag, _ref;

    i = 1;
    while (1) {
      if (_ref = hasOwnProperty.call(tags, symbol.slice(0, i)), __indexOf.call(tags, _ref) >= 0) {
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
      m = _memo[hash];
      if (m) {
        cursor = m[1];
        return m[0];
      } else {
        result = rule(start);
        _memo[hash] = [result, cursor];
        return result;
      }
    };
  };

  exports.memo = memo = function(symbol) {
    return function(start) {
      var hash, m;

      hash = symbol + start;
      m = memoCache[hash];
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

  orp = function() {
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

  notp = function(exp) {
    if (isString(exp)) {
      exp = literal(exp);
    }
    return function(start) {
      return !exp(start);
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

  exports.identifier = function(start) {
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

}).call(this);

/*
//@ sourceMappingURL=peasy.map
*/