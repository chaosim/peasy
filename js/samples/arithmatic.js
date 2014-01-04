var exports, module, require, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (typeof window === 'object') {
  _ref = twoside('/samples/arithmatic'), require = _ref.require, exports = _ref.exports, module = _ref.module;
}

(function(require, exports, module) {
  var Parser, parser, peasy;
  peasy = require("../peasy");
  exports.Parser = Parser = (function(_super) {
    __extends(Parser, _super);

    function Parser() {
      var and_, andp, assign, assign_, atom, bitand, bitnot, bitor, bitxor, char, charset, comma, conditional, conditional_, dec, delete_, div, eq, eq2, error, expr, funcall, ge, getExpr, gt, headAtom, headExpr, identifierCharSet, identifierChars, idiv, inCharset, in_, inc, instanceof_, lbracket, le, letterDigits, literal, logicOrExpr, lpar, lshift, lt, memo, minus, mul, myop, ne, ne2, new_, not_, operations, or_, orp, parenExpr, plus, property, rbracket, rec, rpar, rshift, space, spaces, spaces1, typeof_, void_, wrap,
        _this = this;
      Parser.__super__.constructor.apply(this, arguments);
      inCharset = peasy.inCharset, charset = peasy.charset, letterDigits = peasy.letterDigits;
      identifierChars = '$_' + letterDigits;
      identifierCharSet = charset(identifierChars);
      char = this.char, literal = this.literal, orp = this.orp, andp = this.andp, wrap = this.wrap, spaces = this.spaces, spaces1 = this.spaces1, rec = this.rec, memo = this.memo;
      space = orp(char(' '), char('t'));
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
        if (inCharset(op[0], identifierCharSet)) {
          return function() {
            return spaces() && opFn() && spaces() && !inCharset(_this.data[_this.cur], identifierCharSet);
          };
        } else {
          return function() {
            return spaces() && opFn() && spaces();
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
      mul = myop('*');
      div = myop('/');
      idiv = myop('//');
      lshift = myop('<<');
      rshift = myop('>>');
      zrshift('>>>');
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
      error = function(msg) {
        throw _this.data.slice(_this.cur - 20, +(_this.cur + 20) + 1 || 9e9) + ' ' + _this.cur + ': ' + msg;
      };
      getExpr = function(n) {
        var left, lower, operation, operator;
        operation = operations[n];
        lower = getExpr(n - 1);
        if (typeof operation === 'function') {
          return function() {
            return operation() || lower();
          };
        } else {
          operator = operation.length === 1 ? operation[0] : orp.apply(null, operation);
          return left = _this.rec(function() {
            var op, x, y;
            return ((x = left()) && (op = operator()) && (y = lower()) && x + op + y) || lower();
          });
        }
      };
      atom = memo(function() {
        var x;
        return (lpar() && spaces() && (x = expr()) && spaces() && ((rpar() && x) || error('expect )'))) || number() || string() || identifier();
      });
      parenExpr = memo(function() {
        return lpar() && expr() && rpar();
      });
      headAtom = memo(function() {
        return parenExpr() || identifier();
      });
      funcall = rec(function() {
        var e, head;
        return (head = headExpr()) && ((e = parenExpr() && head + e) || head);
      });
      property = rec(function() {
        var e, head;
        return (head = headExpr()) && ((e = parenExpr() && head + e) || head) || oneProperty();
      });
      headExpr = orp(headAtom, funcall, property);
      logicOrExpr = getExpr(14);
      conditional_ = function() {
        return logicOrExpr() && spaces() && question() && spaces() && assign() && comma() && assign();
      };
      conditional = getExpr(15);
      assign_ = function() {
        return assignLeft() && assignOperator() && conditional();
      };
      assign = getExpr(16);
      expr = getExpr(17);
      this.root = function() {
        var x;
        return x = expr() && _this.eof() && x;
      };
      'Precedence	Operator type	Associativity	Individual operators\n1	new	right-to-left	new\n2	function call	left-to-right	()\nproperty access	left-to-right	.\nleft-to-right	[]\n3	 	++  n/a	--\n4	right-to-left	! ~ +	- typeof void delete\n5	* / % //\n6	+ -\n7	<<  >> >>>\n8	<  <=  >  >=  in  instanceof\n9	==  !=  ===  !==\n10	bitwise-and	left-to-right	&\n11	bitwise-xor	left-to-right	^\n12	bitwise-or	left-to-right	|\n13	logical-and	left-to-right	&&\n14	logical-or	left-to-right	||\n15	conditional	right-to-left	?:\n16	yield	right-to-left	yield\n17	assignment right-to-left	=  +  -=  *=  /=  %=  <<=  >>=  >>>=  &=  ^=  |=\n18	comma	left-to-right	,';
      operations = {
        0: atom,
        1: function() {
          return new_() && expr();
        },
        2: orp(funcall, property),
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
        16: assign_,
        17: [comma]
      };
    }

    Parser.prototype.number = function() {
      var base, c, cur, dotStart, dotStop, intStart, intStop, powStart, powStop, start, symbol, text, _i, _j, _k, _len, _len1, _len2;
      text = this.data;
      start = cur = this.cur;
      symbol = '';
      c = text[cur++];
      if (c === '+' || c === '-') {
        symbol = c;
      }
      if (text[cur++] === '0') {
        c = text[cur++];
        if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z')) {
          base = c;
          cur++;
        }
      }
      intStart = cur;
      if (base === 'x') {
        while (c = text[cur++]) {
          if (!(('0' <= c && c <= '9') || ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z'))) {
            break;
          }
        }
      } else {
        while (c = text[cur++]) {
          if ((!'0' <= c && c <= '9')) {
            break;
          }
        }
      }
      intStop = cur;
      dotStart = cur;
      if (text[cur++] === '.') {
        while (c = text[cur++]) {
          if ((!'0' <= c && c <= '9')) {
            break;
          }
        }
      }
      dotStop = cur;
      powStart = cur;
      c = text[cur++];
      if (c === 'E' || c === 'e') {
        while (c = text[cur++]) {
          if ((!'0' <= c && c <= '9')) {
            break;
          }
        }
      }
      powStop = cur;
      if (base) {
        if (base !== 'b' && base !== 'o' && base !== 'x') {
          error(start, "wrong radix letter:" + base + ", \"BbOoXx\" is permitted.");
        }
        if (powStop >= powStart + 1 || dotStop > dotStart + 1) {
          error(start, "binary, octal or hexidecimal is not permitted to have decimal fraction or exponent.");
        }
        if (base === 'b') {
          for (_i = 0, _len = intPart.length; _i < _len; _i++) {
            c = intPart[_i];
            if (c > '1') {
              error(start, "binary number should have only digit 0 or 1.");
            }
          }
        }
        if (base === 'o') {
          for (_j = 0, _len1 = intPart.length; _j < _len1; _j++) {
            c = intPart[_j];
            if (c > '7') {
              error(start, "octal number should have only digit 0, 1, 2, 3, 4, 5, 6, 7.");
            }
          }
        }
        if (base === 'x') {
          for (_k = 0, _len2 = intPart.length; _k < _len2; _k++) {
            c = intPart[_k];
            if (('g' <= c && c <= 'z') || ('G' <= c && c <= 'Z')) {
              error(start, "hexidecimal number have illgegal letter.");
            }
          }
        }
      }
      return {
        string: function() {
          var quote;
          text = this.data;
          start = cur = this.cur;
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
              this.cur = cur + 1;
              return text.slice(start, +cur + 1 || 9e9);
            } else if (!c) {
              error('expect ' + quote);
            }
          }
        }
      };
    };

    return Parser;

  })(peasy.Parser);
  exports.parser = parser = new Parser;
  return exports.parse = function(text) {
    return parser.parse(text);
  };
})(require, exports, module);
