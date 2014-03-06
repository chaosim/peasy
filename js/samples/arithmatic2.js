// wrap lines by gulp-twoside for providing twoside module
var exports, module, require, ts;
if (typeof window === 'object') { ts = twoside('peasy/samples/arithmatic2.js'), require = ts.require, exports = ts.exports, module = ts.module;} 
(function(require, exports, module) {

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

peasy = require("../index");

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
})(require, exports, module); // wrap line by gulp-twoside