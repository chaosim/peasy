var exports, module, require; 
(function(require, exports, module) {var ts;if (typeof window === 'object') { ts = twoside('peasy/samples/statemachine.js'), require = ts.require, exports = ts.exports, module = ts.module;} // wrap line by gulp-twoside for providing twoside module; 

var StateMachine, hasOwnProperty;

hasOwnProperty = Object.hasOwnProperty;

exports.StateMachine = StateMachine = (function() {
  function StateMachine(items) {
    var item, _i, _len;
    if (items == null) {
      items = [];
    }
    this.index = 1;
    this.stateMap = {};
    this.stateMap[0] = {};
    this.tagMap = {};
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      this.add(item[0], item[1] || item[0]);
    }
  }

  StateMachine.prototype.add = function(word, tag) {
    var c, i, length, newState, s, state, stateMap;
    if (tag == null) {
      tag = word;
    }
    length = word.length;
    state = 0;
    i = 0;
    stateMap = this.stateMap;
    while (i < length - 1) {
      c = word[i++];
      if (hasOwnProperty.call(stateMap[state], c)) {
        state = stateMap[state][c];
        if (state < 0) {
          state = -state;
        }
      } else {
        newState = this.index++;
        stateMap[state][c] = newState;
        stateMap[newState] = {};
        state = newState;
      }
    }
    c = word[i];
    if (hasOwnProperty.call(stateMap[state], c)) {
      s = stateMap[state][c];
      if (s > 0) {
        stateMap[state][c] = -s;
        return this.tagMap[s] = tag;
      }
    } else {
      newState = this.index++;
      stateMap[state][c] = -newState;
      stateMap[newState] = {};
      return this.tagMap[newState] = tag;
    }
  };

  StateMachine.prototype.match = function(text, i) {
    var cursor, length, state, stateMap, succeedState;
    if (i == null) {
      i = 0;
    }
    state = 0;
    length = text.length;
    stateMap = this.stateMap;
    while (i < length) {
      state = stateMap[state][text[i++]];
      if (state === void 0) {
        i--;
        break;
      } else if (state < 0) {
        state = -state;
        succeedState = state;
        cursor = i;
      }
    }
    if (succeedState) {
      return [this.tagMap[succeedState], cursor];
    } else {
      return [null, i];
    }
  };

  return StateMachine;

})();


})(require, exports, module);// wrap line by gulp-twoside
var exports, module, require; 
(function(require, exports, module) {var ts;if (typeof window === 'object') { ts = twoside('peasy/samples/dsl.js'), require = ts.require, exports = ts.exports, module = ts.module;} // wrap line by gulp-twoside for providing twoside module; 

var BaseParser, TemplateParser, charset, endTextCharset, identifierHeadChars, identifierHeadCharset, inCharset, letters, parseTemplate, peasy, templateParser, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ref = peasy = require('../peasy'), inCharset = _ref.inCharset, letters = _ref.letters, charset = _ref.charset, BaseParser = _ref.BaseParser;

identifierHeadChars = '$_' + letters;

endTextCharset = charset(')@' + identifierHeadChars);

identifierHeadCharset = charset(identifierHeadChars);

exports.TemplateParser = TemplateParser = (function(_super) {
  __extends(TemplateParser, _super);

  function TemplateParser() {
    var anySegment, at, c, error, exclam, field, lpar, mayExclam, rpar, tcall, template, text, tfield, _ref1;
    TemplateParser.__super__.constructor.apply(this, arguments);
    _ref1 = (function() {
      var _i, _len, _ref1, _results;
      _ref1 = '@()!';
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        c = _ref1[_i];
        _results.push((function(_this) {
          return function(c) {
            return _this.char(c);
          };
        })(this)(c));
      }
      return _results;
    }).call(this), at = _ref1[0], lpar = _ref1[1], rpar = _ref1[2], exclam = _ref1[3];
    mayExclam = this.may(exclam);
    error = (function(_this) {
      return function(msg) {
        throw _this.data.slice(_this.cur - 20, +(_this.cur + 20) + 1 || 9e9) + ' ' + _this.cur + ': ' + msg;
      };
    })(this);
    tcall = (function(_this) {
      return function() {
        var args, f;
        return (f = tfield()) && lpar() && (args = template()) && ((rpar() && f + '(' + args + ')') || error('expect )'));
      };
    })(this);
    tfield = this.memo((function(_this) {
      return function() {
        var id;
        return at() && (((id = _this.identifier()) && mayExclam() && 't.' + id) || error('expect @identifier'));
      };
    })(this));
    field = (function(_this) {
      return function() {
        var id;
        return (id = _this.identifier()) && mayExclam() && ("t.transform(e." + id + ")");
      };
    })(this);
    text = (function(_this) {
      return function() {
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
    })(this);
    anySegment = this.any(this.orp(tcall, tfield, field, text));
    template = (function(_this) {
      return function() {
        var x;
        return (x = anySegment()) && x.join(',');
      };
    })(this);
    this.root = (function(_this) {
      return function() {
        var t;
        return (t = template()) && ((_this.eoi() && t) || error('unexpected )'));
      };
    })(this);
  }

  return TemplateParser;

})(BaseParser);

templateParser = new TemplateParser;

exports.parseTemplate = parseTemplate = function(text) {
  return templateParser.parse(text);
};


})(require, exports, module);// wrap line by gulp-twoside
var exports, module, require; 
(function(require, exports, module) {var ts;if (typeof window === 'object') { ts = twoside('peasy/samples/arithmatic.js'), require = ts.require, exports = ts.exports, module = ts.module;} // wrap line by gulp-twoside for providing twoside module; 

var Parser, charset, identifierCharSet, identifierChars, in_, letterDigits, parser, peasy, _in_,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

peasy = require("../peasy");

in_ = peasy.in_, charset = peasy.charset, letterDigits = peasy.letterDigits;

_in_ = in_;

identifierChars = '$_' + letterDigits;

identifierCharSet = charset(identifierChars);

exports.Parser = Parser = (function(_super) {
  __extends(Parser, _super);

  function Parser() {
    var addassign, and1, and_, assign, assignExpr, assignExpr_, assignLeft, assignOperator, atom, attr, bitand, bitandassign, bitnot, bitor, bitorassign, bitxor, bitxorassign, bracketExpr, bracketExpr1, callProp, callPropTail, char, colon, comma, condition_, dec, delete_, div, divassign, dot, dotIdentifier, eoi, eq, eq2, error, expect, expr, ge, getExpr, gt, headAtom, headExpr, i, identifier, idiv, idivassign, inc, incDec, instanceof_, lbracket, le, literal, literalExpr, logicOrExpr, lpar, lshift, lshiftassign, lt, memo, minus, mod, modassign, mul, mulassign, myop, ne, ne2, negative, new_, not1, not_, number, operationFnList, operations, or1, or_, orp, param, paramExpr, paren, paren1, parenExpr, plus, posNeg, positive, prefixOperation, prefixSuffixExpr, property, question, rbracket, rec, rpar, rshift, rshiftassign, self, spaces, string, subassign, suffixOperation, typeof_, unaryOp, unaryTail, unary_, void_, wrap, wrapColon, wrapDot, wrapQuestion, zrshift, zrshiftassign, _i, _ref;
    Parser.__super__.constructor.apply(this, arguments);
    self = this;
    number = function() {
      var base, c, cur, start, text;
      text = self.data;
      start = cur = self.cur;
      base = 10;
      c = text[cur];
      if (c === '+' || c === '-') {
        cur++;
      }
      if (text[cur] === '0') {
        c = text[++cur];
        if (c === 'x' || c === 'X') {
          base = 16;
          cur++;
        }
      }
      if (base === 16) {
        while (c = text[cur]) {
          if (!(('0' <= c && c <= '9') || ('a' <= c && c <= 'f') || ('A' <= c && c <= 'F'))) {
            self.cur = cur;
            return text.slice(start, cur);
          }
          cur++;
        }
      }
      while (c = text[cur]) {
        if (!(('0' <= c && c <= '9'))) {
          break;
        }
        cur++;
      }
      if (text[cur] === '.') {
        cur++;
        while (c = text[cur]) {
          if (!(('0' <= c && c <= '9'))) {
            break;
          }
          cur++;
        }
        if (text[cur - 1] === '.' && (c = text[cur - 2]) && !(('0' <= c && c <= '9'))) {
          return;
        }
      }
      c = text[cur];
      if (c === 'E' || c === 'e') {
        cur++;
        while (c = text[cur]) {
          if (!(('0' <= c && c <= '9'))) {
            break;
          }
          cur++;
        }
        if ((c = text[cur - 1]) && (c === 'E' || c === 'e')) {
          return;
        }
      }
      self.cur = cur;
      return text.slice(start, cur);
    };
    string = function() {
      var c, cur, quote, result, text;
      text = self.data;
      cur = self.cur;
      c = text[cur];
      if (c === '"' || c === "'") {
        quote = c;
      } else {
        return;
      }
      result = '';
      cur++;
      while (1) {
        c = text[cur];
        if (c === '\\') {
          result += text[cur + 1];
          cur += 2;
        } else if (c === quote) {
          self.cur = cur + 1;
          return quote + result + quote;
        } else if (!c) {
          error('expect ' + quote);
        } else {
          result += c;
          cur++;
        }
      }
    };
    _ref = self = this, orp = _ref.orp, rec = _ref.rec, memo = _ref.memo, wrap = _ref.wrap, char = _ref.char, literal = _ref.literal, spaces = _ref.spaces, eoi = _ref.eoi, identifier = _ref.identifier;
    question = char('?');
    colon = char(':');
    comma = char(',');
    dot = char('.');
    lpar = char('(');
    rpar = char(')');
    lbracket = char('[');
    rbracket = char(']');
    myop = function(op) {
      var opFn;
      if (op.length === 1) {
        opFn = char(op);
      } else {
        opFn = literal(op);
      }
      if (_in_(op[0], identifierCharSet)) {
        return function() {
          return spaces() && (op = opFn()) && spaces() && !_in_(data[self.cur], identifierCharSet) && ' ' + op + ' ';
        };
      } else {
        return function() {
          return spaces() && (op = opFn()) && spaces() && op;
        };
      }
    };
    posNeg = function(op) {
      var opFn;
      opFn = char(op);
      return function() {
        var c;
        return spaces() && (op = opFn()) && (c = self.data[self.cur]) && c !== '.' && !(('0' <= c && c <= '9')) && spaces() && op;
      };
    };
    positive = posNeg('+');
    negative = posNeg('-');
    new_ = myop('new');
    inc = myop('++');
    dec = myop('--');
    not1 = orp(myop('!'), myop('not'));
    not_ = function() {
      return not1() && '!';
    };
    bitnot = myop('~');
    typeof_ = myop('typeof');
    void_ = myop('void');
    delete_ = myop('delete');
    unaryOp = orp(not_, bitnot, positive, negative, typeof_, void_);
    plus = myop('+');
    minus = myop('-');
    mul = myop('*');
    div = myop('/');
    idiv = myop('//');
    mod = myop('%');
    lshift = myop('<<');
    rshift = myop('>>');
    zrshift = myop('>>>');
    lt = myop('<');
    le = myop('<=');
    gt = myop('>');
    ge = myop('>=');
    in_ = myop('in');
    instanceof_ = myop('instanceof');
    eq = myop('==');
    ne = myop('!=');
    eq2 = myop('===');
    ne2 = myop('!==');
    bitand = myop('&');
    bitxor = myop('^');
    bitor = myop('|');
    and1 = orp(myop('&&'), myop('and'));
    and_ = function() {
      return and1() && '&&';
    };
    or1 = orp(myop('||'), myop('or'));
    or_ = function() {
      return or1() && '||';
    };
    comma = myop(',');
    assign = myop('=');
    addassign = myop('+=');
    subassign = myop('-=');
    mulassign = myop('*=');
    divassign = myop('/=');
    modassign = myop('%=');
    idivassign = myop('//=');
    rshiftassign = myop('>>=');
    lshiftassign = myop('<<=');
    zrshiftassign = myop('>>>=');
    bitandassign = myop('&=');
    bitxorassign = myop('^=');
    bitorassign = myop('|=');
    error = function(msg) {
      throw self.data.slice(self.cur - 20, +(self.cur + 20) + 1 || 9e9) + ' ' + self.cur + ': ' + msg;
    };
    expect = function(fn, msg) {
      return fn() || error(msg);
    };
    incDec = orp(inc, dec);
    prefixOperation = function() {
      var op, x;
      return (op = incDec()) && (x = headExpr()) && op + x;
    };
    suffixOperation = function() {
      var op, x;
      return (x = headExpr()) && (op = incDec()) && x + op;
    };
    paren = function(item, left, right, msg) {
      if (left == null) {
        left = lpar;
      }
      if (right == null) {
        right = rpar;
      }
      if (msg == null) {
        msg = 'expect ) to match (';
      }
      if ((typeof item) === 'string') {
        left = self.literal(item);
      }
      if ((typeof left) === 'string') {
        left = self.literal(left);
      }
      if ((typeof right) === 'string') {
        right = self.literal(right);
      }
      return function() {
        var start, x;
        start = self.cur;
        return left() && (x = item()) && expect(right, msg + ' at: ' + start) && x;
      };
    };
    paren1 = paren(function() {
      var x;
      return spaces() && (x = expr()) && spaces() && x;
    });
    parenExpr = memo(function() {
      var x;
      return (x = paren1()) && '(' + x + ')';
    });
    literalExpr = orp(number, string, identifier);
    atom = memo(orp(parenExpr, literalExpr));
    unaryTail = orp(prefixSuffixExpr, atom);
    unary_ = function() {
      var op, x;
      return (op = unaryOp()) && (x = unaryTail()) && op + x;
    };
    bracketExpr1 = wrap(paren(wrap(function() {
      return commaExpr();
    }), lbracket, rbracket, 'expect ) to match ('));
    bracketExpr = function() {
      var x;
      return (x = bracketExpr1()) && '[' + x + ']';
    };
    wrapDot = wrap(dot);
    dotIdentifier = function() {
      var id;
      return wrapDot() && (id = expect(identifier, 'expect identifier')) && '.' + id;
    };
    attr = orp(bracketExpr, dotIdentifier);
    param = paren(function() {
      var x;
      return (spaces() && (x = expr()) && spaces() && expect(rpar, 'expect )')) || ' ';
    });
    paramExpr = memo(function() {
      var x;
      return (x = param()) && '(' + x + ')';
    });
    callPropTail = orp(paramExpr, attr);
    callProp = rec(function() {
      var e, h;
      return (h = headExpr()) && (((e = callPropTail()) && h + e) || h);
    });
    property = rec(function() {
      var e, h;
      return (h = headExpr()) && (((e = attr()) && h + e) || h);
    });
    headAtom = memo(orp(parenExpr, identifier));
    headExpr = memo(orp(callProp, headAtom));
    wrapQuestion = wrap(question);
    wrapColon = wrap(colon);
    condition_ = function() {
      var x, y, z;
      return (x = logicOrExpr()) && wrapQuestion() && (y = assignExpr()) && expect(wrapColon, 'expect :') && (z = assignExpr()) && x + '? ' + y + ': ' + z;
    };
    assignLeft = property;
    assignOperator = orp(assign, addassign, subassign, mulassign, divassign, modassign, idivassign, rshiftassign, lshiftassign, zrshiftassign, bitandassign, bitxorassign, bitorassign);
    assignExpr_ = function() {
      var e, op, v;
      return (v = assignLeft()) && (op = assignOperator()) && (e = assignExpr()) && v + op + e;
    };
    'Precedence	Operator type	Associativity	Individual operators\n1	new	right-to-left	new\n2	function call	left-to-right	()\nproperty access	left-to-right	.\nleft-to-right	[]\n3	 	++  n/a	--\n4	right-to-left	! ~ +	- typeof void delete\n5	* / % //\n6	+ -\n7	<<  >> >>>\n8	<  <=  >  >=  in  instanceof\n9	==  !=  ===  !==\n10	bitwise-and	left-to-right	&\n11	bitwise-xor	left-to-right	^\n12	bitwise-or	left-to-right	|\n13	logical-and	left-to-right	&&\n14	logical-or	left-to-right	||\n15	condition	right-to-left	?:\n16	yield	right-to-left	yield\n17	assignment right-to-left	=  +=  -=  *=  /=  %=  <<=  >>=  >>>=  &=  ^=  |=\n18	comma	left-to-right	,';
    operations = {
      0: atom,
      1: function() {
        var x;
        return new_() && (x = expr()) && 'new ' + x;
      },
      2: callProp,
      3: orp(prefixOperation, suffixOperation),
      4: unary_,
      5: [mul, div, idiv],
      6: [plus, minus],
      7: [lshift, rshift, zrshift],
      8: [lt, le, gt, ge, in_, instanceof_],
      9: [eq, ne, eq2, ne2],
      10: [bitand],
      11: [bitxor],
      12: [bitor],
      13: [and_],
      14: [or_],
      15: condition_,
      16: assignExpr_,
      17: [comma]
    };
    operationFnList = [atom];
    getExpr = function(n) {
      var binary, lower, operation, operator;
      operation = operations[n];
      lower = operationFnList[n - 1];
      if (typeof operation === 'function') {
        return orp(operation, lower);
      } else {
        operator = operation.length === 1 ? operation[0] : orp.apply(null, operation);
        return binary = rec(function() {
          n;
          var op, start, x, y;
          start = self.cur;
          if ((x = binary())) {
            if ((op = operator()) && (y = lower())) {
              return x + op + y;
            } else {
              return x;
            }
          } else {
            self.cur = start;
            return lower();
          }
        });
      }
    };
    for (i = _i = 1; _i <= 17; i = ++_i) {
      operationFnList[i] = getExpr(i);
    }
    prefixSuffixExpr = operationFnList[3];
    logicOrExpr = operationFnList[14];
    assignExpr = operationFnList[16];
    expr = operationFnList[16];
    this.root = function() {
      var x;
      return (x = expr()) && expect(eoi, 'expect end of input') && x;
    };
  }

  return Parser;

})(peasy.Parser);

exports.parser = parser = new Parser;

exports.parse = function(text) {
  return parser.parse(text);
};


})(require, exports, module);// wrap line by gulp-twoside
var exports, module, require; 
(function(require, exports, module) {var ts;if (typeof window === 'object') { ts = twoside('peasy/samples/arithmatic2.js'), require = ts.require, exports = ts.exports, module = ts.module;} // wrap line by gulp-twoside for providing twoside module; 


/*https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
Precedence	Operator type	Associativity	Individual operators
1	new	right-to-left	new
2	function call	left-to-right	()
property access	left-to-right	.
left-to-right	[]
3	 	++  n/a	--
4	right-to-left	! ~ +	- typeof void delete
5	* / % //
6	+ -
7	<<  >> >>>
8	<  <=  >  >=  in  instanceof
9	==  !=  ===  !==
10	bitwise-and	left-to-right	&
11	bitwise-xor	left-to-right	^
12	bitwise-or	left-to-right	|
13	logical-and	left-to-right	&&
14	logical-or	left-to-right	||
15	condition	right-to-left	?:
16	yield	right-to-left	yield
17	assignment right-to-left	=  +=  -=  *=  /=  %=  <<=  >>=  >>>=  &=  ^=  |=
18	comma	left-to-right	,
 */
var Parser, StateMachine, charset, identifierCharSet, identifierChars, in_, letterDigits, peasy, _in_,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

peasy = require("../peasy");

StateMachine = require("./statemachine").StateMachine;

in_ = peasy.in_, charset = peasy.charset, letterDigits = peasy.letterDigits;

_in_ = in_;

identifierChars = '$_' + letterDigits;

identifierCharSet = charset(identifierChars);

exports.Parser = Parser = (function(_super) {
  __extends(Parser, _super);

  function Parser() {
    var addassign, assign, assignExpr, assignExpr_, assignOperator, atom, attr, binaryOpItems, binaryOpPriorityMap, binaryOperator, binarysm, bitandassign, bitnot, bitorassign, bitxorassign, bracketExpr, bracketExpr1, callPropExpr, callPropTail, char, colon, comma, condition, dec, delete_, divassign, dot, dotIdentifier, eoi, error, expect, expr, expression, expression_, headAtom, headExpr, identifier, idivassign, inc, incDec, lbracket, list, literal, logicOrExpr, lpar, lshiftassign, memo, modassign, mulassign, myop, negative, newExpr, new_, not1, not_, number, orBinary, orp, param, paramExpr, paren, paren1, parenExpr, posNeg, positive, prefixExpr, property, question, rbracket, rec, rpar, rshiftassign, self, simpleExpr, spaces, string, subassign, suffixExpr, typeof_, unaryExpr, unaryOp, unaryTail, void_, wrap, wrapColon, wrapDot, wrapQuestion, zrshiftassign, _ref;
    Parser.__super__.constructor.apply(this, arguments);
    _ref = self = this, orp = _ref.orp, list = _ref.list, rec = _ref.rec, memo = _ref.memo, wrap = _ref.wrap, char = _ref.char, literal = _ref.literal, spaces = _ref.spaces, eoi = _ref.eoi, identifier = _ref.identifier;
    number = function() {
      var base, c, cur, start, text;
      text = self.data;
      start = cur = self.cur;
      base = 10;
      c = text[cur];
      if (c === '+' || c === '-') {
        cur++;
      }
      if (text[cur] === '0') {
        c = text[++cur];
        if (c === 'x' || c === 'X') {
          base = 16;
          cur++;
        }
      }
      if (base === 16) {
        while (c = text[cur]) {
          if (!(('0' <= c && c <= '9') || ('a' <= c && c <= 'f') || ('A' <= c && c <= 'F'))) {
            self.cur = cur;
            return text.slice(start, cur);
          }
          cur++;
        }
      }
      while (c = text[cur]) {
        if (!(('0' <= c && c <= '9'))) {
          break;
        }
        cur++;
      }
      if (text[cur] === '.') {
        cur++;
        while (c = text[cur]) {
          if (!(('0' <= c && c <= '9'))) {
            break;
          }
          cur++;
        }
        if (text[cur - 1] === '.' && (c = text[cur - 2]) && !(('0' <= c && c <= '9'))) {
          return;
        }
      }
      c = text[cur];
      if (c === 'E' || c === 'e') {
        cur++;
        while (c = text[cur]) {
          if (!(('0' <= c && c <= '9'))) {
            break;
          }
          cur++;
        }
        if ((c = text[cur - 1]) && (c === 'E' || c === 'e')) {
          return;
        }
      }
      self.cur = cur;
      return text.slice(start, cur);
    };
    string = function() {
      var c, cur, quote, result, text;
      text = self.data;
      cur = self.cur;
      c = text[cur];
      if (c === '"' || c === "'") {
        quote = c;
      } else {
        return;
      }
      result = '';
      cur++;
      while (1) {
        c = text[cur];
        if (c === '\\') {
          result += text[cur + 1];
          cur += 2;
        } else if (c === quote) {
          self.cur = cur + 1;
          return quote + result + quote;
        } else if (!c) {
          error('expect ' + quote);
        } else {
          result += c;
          cur++;
        }
      }
    };
    question = char('?');
    colon = char(':');
    comma = char(',');
    dot = char('.');
    lpar = char('(');
    rpar = char(')');
    lbracket = char('[');
    rbracket = char(']');
    myop = function(op) {
      var opFn;
      if (op.length === 1) {
        opFn = char(op);
      } else {
        opFn = literal(op);
      }
      if (_in_(op[0], identifierCharSet)) {
        return function() {
          return spaces() && (op = opFn()) && spaces() && !_in_(data[self.cur], identifierCharSet) && ' ' + op + ' ';
        };
      } else {
        return function() {
          return spaces() && (op = opFn()) && spaces() && op;
        };
      }
    };
    posNeg = function(op) {
      var opFn;
      opFn = char(op);
      return function() {
        var c;
        return spaces() && (op = opFn()) && (c = self.data[self.cur]) && c !== '.' && !(('0' <= c && c <= '9')) && spaces() && op;
      };
    };
    positive = posNeg('+');
    negative = posNeg('-');
    new_ = myop('new');
    inc = myop('++');
    dec = myop('--');
    not1 = orp(myop('!'), myop('not'));
    not_ = function() {
      return not1();
    };
    bitnot = myop('~');
    typeof_ = myop('typeof');
    void_ = myop('void');
    delete_ = myop('delete');
    unaryOp = orp(not_, bitnot, positive, negative, typeof_, void_);
    comma = myop(',');
    assign = myop('=');
    addassign = myop('+=');
    subassign = myop('-=');
    mulassign = myop('*=');
    divassign = myop('/=');
    modassign = myop('%=');
    idivassign = myop('//=');
    rshiftassign = myop('>>=');
    lshiftassign = myop('<<=');
    zrshiftassign = myop('>>>=');
    bitandassign = myop('&=');
    bitxorassign = myop('^=');
    bitorassign = myop('|=');
    error = function(msg) {
      throw self.data.slice(self.cur - 20, +(self.cur + 20) + 1 || 9e9) + ' ' + self.cur + ': ' + msg;
    };
    expect = function(fn, msg) {
      return fn() || error(msg);
    };
    incDec = orp(inc, dec);
    prefixExpr = function() {
      var op, x;
      return (op = incDec()) && (x = headExpr()) && op + x;
    };
    suffixExpr = function() {
      var op, x;
      return (x = headExpr()) && (op = incDec()) && x + op;
    };
    paren = function(item, left, right, msg) {
      if (left == null) {
        left = lpar;
      }
      if (right == null) {
        right = rpar;
      }
      if (msg == null) {
        msg = 'expect ) to match (';
      }
      if ((typeof item) === 'string') {
        left = self.literal(item);
      }
      if ((typeof left) === 'string') {
        left = self.literal(left);
      }
      if ((typeof right) === 'string') {
        right = self.literal(right);
      }
      return function() {
        var start, x;
        start = self.cur;
        return left() && (x = item()) && expect(right, msg + ' at: ' + start) && x;
      };
    };
    paren1 = paren(function() {
      var x;
      return spaces() && (x = expression()) && spaces() && x;
    });
    parenExpr = memo(function() {
      var x;
      return (x = paren1()) && '(' + x + ')';
    });
    atom = memo(orp(parenExpr, number, string, identifier));
    newExpr = function() {
      var x;
      return new_() && (x = callProp()) && 'new ' + x;
    };
    unaryTail = orp(prefixExpr, suffixExpr, atom);
    unaryExpr = function() {
      var op, x;
      return (op = unaryOp()) && (x = unaryTail()) && op + x;
    };
    bracketExpr1 = wrap(paren(wrap(function() {
      return commaExpr();
    }), lbracket, rbracket, 'expect ] to match ['));
    bracketExpr = function() {
      var x;
      return (x = bracketExpr1()) && '[' + x + ']';
    };
    wrapDot = wrap(dot);
    dotIdentifier = function() {
      var id;
      return wrapDot() && (id = expect(identifier, 'expect identifier')) && '.' + id;
    };
    attr = orp(bracketExpr, dotIdentifier);
    param = paren(function() {
      var x;
      return (spaces() && (x = expression()) && spaces() && expect(rpar, 'expect )')) || ' ';
    });
    paramExpr = memo(function() {
      var x;
      return (x = param()) && '(' + x + ')';
    });
    callPropTail = orp(paramExpr, attr);
    callPropExpr = rec(function() {
      var e, h;
      return (h = headExpr()) && (((e = callPropTail()) && h + e) || h);
    });
    property = rec(function() {
      var e, h;
      return (h = headExpr()) && (((e = attr()) && h + e) || h);
    });
    headAtom = memo(orp(parenExpr, identifier));
    headExpr = memo(orp(callPropExpr, headAtom));
    simpleExpr = memo(orp(unaryExpr, prefixExpr, suffixExpr, callPropExpr, newExpr, atom));
    binaryOpPriorityMap = {
      5: ['*', '/', '//', '%'],
      6: ['+', '-'],
      7: ['<<', '>>', '>>>'],
      8: ['<', '<=', '>', '>=', 'in ', 'in\t', 'instanceof ', 'instanceof\t'],
      9: ['==', '!=', '==', '==='],
      10: ['&'],
      11: ['|'],
      12: ['^'],
      13: ['&&'],
      14: ['||'],
      17: [',']
    };
    binaryOpItems = [];
    (function() {
      var k, op, ops, _results;
      _results = [];
      for (k in binaryOpPriorityMap) {
        ops = binaryOpPriorityMap[k];
        _results.push((function() {
          var _i, _len, _results1;
          _results1 = [];
          for (_i = 0, _len = ops.length; _i < _len; _i++) {
            op = ops[_i];
            _results1.push(binaryOpItems.push([
              op, {
                text: op,
                pri: parseInt(k)
              }
            ]));
          }
          return _results1;
        })());
      }
      return _results;
    })();
    binarysm = new StateMachine(binaryOpItems);
    binaryOperator = memo(function() {
      var m;
      m = binarysm.match(self.data, self.cur);
      if (m[0]) {
        self.cur = m[1];
        return m[0];
      }
    });
    expr = function(n) {
      var binary;
      return binary = rec(function() {
        var beforeOp, fn, op, x, y, _ref1;
        if (x = binary()) {
          beforeOp = self.cur;
          if ((op = binaryOperator()) && ((n >= (_ref1 = op.pri) && _ref1 >= x.pri)) && (fn = expr(op.pri)) && (y = fn())) {
            return {
              text: x.text + op.text + y.text,
              pri: op.pri
            };
          } else {
            self.cur = beforeOp;
            return x;
          }
        } else if (x = simpleExpr()) {
          return {
            text: x,
            pri: 4
          };
        }
      });
    };
    orBinary = expr(15);
    logicOrExpr = function() {
      var x;
      return (x = orBinary()) && x.text;
    };
    wrapQuestion = wrap(question);
    wrapColon = wrap(colon);
    condition = function() {
      var x, y, z;
      return (x = logicOrExpr()) && ((wrapQuestion() && (y = assignExpr()) && expect(wrapColon, 'expect :') && (z = assignExpr()) && x + '? ' + y + ': ' + z) || x);
    };
    assignOperator = orp(assign, addassign, subassign, mulassign, divassign, modassign, idivassign, rshiftassign, lshiftassign, zrshiftassign, bitandassign, bitxorassign, bitorassign);
    assignExpr_ = function() {
      var e, op, v;
      if ((v = property()) && (op = assignOperator())) {
        return (e = expect(assignExpr, 'expect the right hand side of assign.')) && v + op + e;
      }
    };
    assignExpr = orp(assignExpr_, condition);
    expression_ = list(assignExpr, wrap(comma));
    expression = function() {
      var x;
      x = expression_();
      if (x) {
        return x.join(',');
      }
    };
    this.root = function() {
      var x;
      return (x = expression()) && expect(eoi, 'expect end of input') && x;
    };
  }

  return Parser;

})(peasy.Parser);


})(require, exports, module);// wrap line by gulp-twoside