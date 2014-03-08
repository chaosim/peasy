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
