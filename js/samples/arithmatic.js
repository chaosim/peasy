var exports, module, require, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (typeof window === 'object') {
  _ref = twoside('/samples/arithmatic'), require = _ref.require, exports = _ref.exports, module = _ref.module;
}

(function(require, exports, module) {
  var Parser, Parser1, charset, identifierCharSet, identifierChars, in_, letterDigits, parser, peasy, _in_;
  peasy = require("../peasy");
  in_ = peasy.in_, charset = peasy.charset, letterDigits = peasy.letterDigits;
  _in_ = in_;
  identifierChars = '$_' + letterDigits;
  identifierCharSet = charset(identifierChars);
  exports.Parser = Parser = (function(_super) {
    __extends(Parser, _super);

    function Parser() {
      var addassign, and_, assign, assignExpr, assignExpr_, assignLeft, assignOperator, atom, attr, bitand, bitandassign, bitnot, bitor, bitorassign, bitxor, bitxorassign, char, colon, comma, conditional, conditional_, dec, delete_, div, divassign, dot, dotIdentifier, eoi, eq, eq2, error, expect, expr, funcall, ge, getExpr, gt, headAtom, headExpr, i, identifier, idiv, idivassign, inc, incDec, instanceof_, lbracket, lbracketExpr, le, literal, literalExpr, logicOrExpr, lpar, lshift, lshiftassign, lt, memo, minus, mod, modassign, mul, mulassign, myop, ne, ne2, new_, not_, number, operationFnList, operations, or_, orp, parenExpr, plus, prefixOperation, prefixSuffixExpr, property, question, rbracket, rec, rpar, rshift, rshiftassign, self, spaces, string, subassign, suffixOperation, typeof_, unaryOp, unary_, void_, wrap, wrapDot, wrapLbracket, wrapQuestion, wrapRbracket, zrshift, zrshiftassign, _i, _ref1;
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
          if (c === 'x' && c === 'X') {
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
            error('expect ' + quote);
          }
        }
      };
      _ref1 = self = this, orp = _ref1.orp, rec = _ref1.rec, memo = _ref1.memo, wrap = _ref1.wrap, char = _ref1.char, literal = _ref1.literal, spaces = _ref1.spaces, eoi = _ref1.eoi, identifier = _ref1.identifier;
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
      new_ = myop('new');
      inc = myop('++');
      dec = myop('--');
      not_ = orp(myop('!'), myop('not'));
      bitnot = myop('~');
      typeof_ = myop('typeof');
      void_ = myop('void');
      delete_ = myop('delete');
      plus = myop('+');
      minus = myop('-');
      unaryOp = orp(not_, bitnot, plus, minus, typeof_, void_);
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
      and_ = orp(myop('&&'), myop('and'));
      or_ = orp(myop('||'), myop('or'));
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
      parenExpr = memo(function() {
        var x;
        return lpar() && spaces() && (x = expr()) && spaces() && expect(rpar, 'expect )') && '(' + x + ')';
      });
      literalExpr = orp((function() {
        return number();
      }), (function() {
        return string();
      }), (function() {
        return identifier();
      }));
      atom = memo(orp(parenExpr, literalExpr));
      unary_ = function() {
        var op, x;
        return (op = unaryOp()) && (x = prefixSuffixExpr()) && op + x;
      };
      headAtom = memo(orp(parenExpr, identifier));
      funcall = rec(function() {
        var e, h;
        return (h = headExpr()) && ((e = parenExpr() && h + e) || h);
      });
      wrapLbracket = wrap(lbracket);
      wrapRbracket = wrap(rbracket);
      wrapDot = wrap(dot);
      lbracketExpr = function() {
        return wrapLbracket() && commaExpr() && wrapRbracket();
      };
      dotIdentifier = function() {
        return wrapDot() && identifier();
      };
      attr = orp(lbracketExpr, dotIdentifier);
      property = rec(function() {
        var e, h;
        return (h = headExpr()) && ((e = attr() && h + e) || h);
      });
      headExpr = rec(orp(funcall, property, headAtom));
      wrapQuestion = wrap(question);
      conditional_ = function() {
        var x, y, z;
        return (x = logicOrExpr()) && wrapQuestion() && (y = assignExpr()) && expect(colon, 'expect :') && (z = assignExpr()) && x + '? ' + y + 'z';
      };
      assignLeft = orp(property, identifier);
      assignOperator = orp(assign, addassign, subassign, mulassign, divassign, modassign, idivassign, rshiftassign, lshiftassign, zrshiftassign, bitandassign, bitxorassign, bitorassign);
      assignExpr_ = function() {
        var e, op, v;
        return (v = assignLeft()) && (op = assignOperator()) && (e = assignExpr()) && v + op + e;
      };
      'Precedence	Operator type	Associativity	Individual operators\n1	new	right-to-left	new\n2	function call	left-to-right	()\nproperty access	left-to-right	.\nleft-to-right	[]\n3	 	++  n/a	--\n4	right-to-left	! ~ +	- typeof void delete\n5	* / % //\n6	+ -\n7	<<  >> >>>\n8	<  <=  >  >=  in  instanceof\n9	==  !=  ===  !==\n10	bitwise-and	left-to-right	&\n11	bitwise-xor	left-to-right	^\n12	bitwise-or	left-to-right	|\n13	logical-and	left-to-right	&&\n14	logical-or	left-to-right	||\n15	conditional	right-to-left	?:\n16	yield	right-to-left	yield\n17	assignment right-to-left	=  +=  -=  *=  /=  %=  <<=  >>=  >>>=  &=  ^=  |=\n18	comma	left-to-right	,';
      operations = {
        0: atom,
        1: function() {
          return new_() && expr();
        },
        2: function() {
          return funcall() || property();
        },
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
        15: conditional_,
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
      conditional = operationFnList[15];
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
  Parser1 = (function(_super) {
    __extends(Parser1, _super);

    function Parser1() {
      var char, one, orp, self, spaces, spaces1, three;
      Parser1.__super__.constructor.apply(this, arguments);
      self = this;
      orp = this.orp, char = this.char, spaces = this.spaces, spaces1 = this.spaces1;
      one = char('1');
      three = char('3');
      this.root = orp(one, three, spaces1);
    }

    return Parser1;

  })(peasy.Parser);
  return exports.parse1 = function(text) {
    return (new Parser1).parse(text);
  };
})(require, exports, module);
