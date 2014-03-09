(function() {var ts = twoside('peasy/karma/logicpeasy.js'), require = ts.require, exports = ts.exports, module = ts.module; // wrap line by gulp-twoside for providing twoside module

var Parser, Trail, cons, uarray, uobject, vari, _ref,
  __slice = [].slice;

_ref = require('../logicpeasy'), vari = _ref.vari, cons = _ref.cons, uobject = _ref.uobject, uarray = _ref.uarray, Trail = _ref.Trail, Parser = _ref.Parser;

describe('logicparser', function() {
  var orp, unify;
  orp = unify = null;
  beforeEach(function() {
    var parser;
    parser = new Parser;
    parser.trail = new Trail;
    unify = function(x, y) {
      return parser.unify(x, y);
    };
    return orp = function() {
      var items;
      items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return parser.orp.apply(parser, items)();
    };
  });
  it("should unify 1 1", function() {
    return expect(unify(1, 1)).toBe(true);
  });
  it("should unify 1 2", function() {
    return expect(unify(1, 2)).toBe(false);
  });
  it("should unify logicvar", function() {
    return expect(unify(vari(), 1)).toBe(true);
  });
  it("should sequential unify logicvar", function() {
    var $a;
    return expect(($a = vari()) && unify($a, 1) && unify($a, 2)).toBe(false);
  });
  it("should unify logicvar with backtracking", function() {
    var $a;
    return expect(($a = vari()) && orp((function() {
      return unify($a, 1) && unify($a, 2);
    }), function() {
      return unify($a, 2);
    })).toBe(true);
  });
  it("should unify cons 1", function() {
    return expect(unify(cons(1, null), cons(1, null))).toBe(true);
  });
  it("should unify cons 2", function() {
    return expect(unify(cons(vari(), null), cons(1, null))).toBe(true);
  });
  it("should unify cons 3", function() {
    var $a;
    return expect(($a = vari()) && unify(cons($a, null), cons(1, null)) && unify($a, 2)).toBe(false);
  });
  it("should unify cons 4", function() {
    var $a;
    return expect(($a = vari()) && orp((function() {
      return unify(cons($a, null), cons(1, null)) && unify($a, 2);
    }), function() {
      return unify($a, 2);
    })).toBe(true);
  });
  it("should unify uobject 1", function() {
    return expect(unify(uobject({
      a: 1
    }), {
      a: 1
    })).toBe(true);
  });
  it("should unify uobject 2", function() {
    return expect(unify(uobject({
      a: 1
    }), {
      a: 2
    })).toBe(false);
  });
  it("should unify uobject 3", function() {
    return expect(unify(uobject({
      a: vari()
    }), {
      a: 1
    })).toBe(true);
  });
  it("should unify uobject 4", function() {
    var $a;
    return expect(($a = vari()) && unify(uobject({
      a: $a
    }), {
      a: 1
    }) && unify($a, 2)).toBe(false);
  });
  it("should unify uobject 5", function() {
    var $a;
    return expect(($a = vari()) && orp((function() {
      return unify(uobject({
        a: $a
      }), {
        a: 1
      }) && unify($a, 2);
    }), function() {
      return unify($a, 2);
    })).toBe(true);
  });
  it("should unify array, uarray 1", function() {
    return expect(unify([], [])).toBe(false);
  });
  it("should unify array, uarray 2", function() {
    return expect(unify(uarray([]), [])).toBe(true);
  });
  it("should unify array, uarray 3", function() {
    return expect(unify(uarray([vari()]), [])).toBe(false);
  });
  it("should unify array, uarray 4", function() {
    return expect(unify(uarray([vari()]), [1])).toBe(true);
  });
  it("should unify array, uarray 5", function() {
    var $a;
    return expect(($a = vari()) && unify(uarray([$a]), [1]) && unify($a, 2)).toBe(false);
  });
  return it("should unify array, uarray 6", function() {
    var $a;
    return expect(($a = vari()) && orp((function() {
      return unify(uarray([$a]), [1]) && unify($a, 2);
    }), function() {
      return unify($a, 2);
    })).toBe(true);
  });
});


})();// wrap line by gulp-twoside
(function() {var ts = twoside('peasy/karma/peasy.js'), require = ts.require, exports = ts.exports, module = ts.module; // wrap line by gulp-twoside for providing twoside module

var peasy,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

peasy = require('../peasy');

describe("run testparser:", function() {
  return it('', function() {});
});

describe("peasy", function() {
  it("should parse with A: Ax|a", function() {
    var Parser, parse, parser;
    Parser = (function(_super) {
      __extends(Parser, _super);

      function Parser() {
        var a, x;
        Parser.__super__.constructor.apply(this, arguments);
        a = this.char('a');
        x = this.char('x');
        this.A = this.rec(this.orp(((function(_this) {
          return function() {
            var m;
            return (m = _this.A()) && x() && m + 'x' || m;
          };
        })(this)), a));
      }

      return Parser;

    })(peasy.Parser);
    parser = new Parser();
    parse = function(text) {
      return parser.parse(text, parser.A);
    };
    expect(parse('a')).toBe('a');
    expect(parse('ax')).toBe('ax');
    expect(parse('axx')).toBe('axx');
    return expect(parse('axxx')).toBe('axxx');
  });
  it("should parse with A: Bx|a; B:A|b", function() {
    var Parser, parse, parser;
    Parser = (function(_super) {
      __extends(Parser, _super);

      function Parser() {
        var B, a, b, x;
        Parser.__super__.constructor.apply(this, arguments);
        a = this.char('a');
        b = this.char('b');
        x = this.char('x');
        this.A = this.rec(this.orp(((function(_this) {
          return function() {
            var m;
            return (m = B()) && x() && m + 'x' || m;
          };
        })(this)), a));
        B = this.rec(this.orp(this.A, b));
      }

      return Parser;

    })(peasy.Parser);
    parser = new Parser();
    parse = function(text) {
      return parser.parse(text, parser.A);
    };
    expect(parse('a')).toBe('a');
    expect(parse('ax')).toBe('ax');
    expect(parse('axx')).toBe('axx');
    expect(parse('axxx')).toBe('axxx');
    expect(parse('b')).toBe('b');
    expect(parse('bx')).toBe('bx');
    expect(parse('bxxx')).toBe('bxxx');
    expect(parse('bxg')).toBe('bx');
    expect(parse('bxxg')).toBe('bxx');
    expect(parse('bxxxg')).toBe('bxxx');
    expect(parse('fg')).toBe(void 0);
    return expect(parse('')).toBe(void 0);
  });
  it("should parse with A: Bx|a; B:C; C:A|b", function() {
    var Parser, parse, parser;
    Parser = (function(_super) {
      __extends(Parser, _super);

      function Parser() {
        var B, C, a, b, x;
        Parser.__super__.constructor.apply(this, arguments);
        a = this.char('a');
        b = this.char('b');
        x = this.char('x');
        this.A = this.rec(this.orp(((function(_this) {
          return function() {
            var m;
            return (m = B()) && x() && m + 'x' || m;
          };
        })(this)), a));
        B = this.rec(function() {
          return C();
        });
        C = this.rec(this.orp(this.A, b));
      }

      return Parser;

    })(peasy.Parser);
    parser = new Parser();
    parse = function(text) {
      return parser.parse(text, parser.A);
    };
    expect(parse('a')).toBe('a');
    expect(parse('ax')).toBe('ax');
    expect(parse('axx')).toBe('axx');
    expect(parse('axxx')).toBe('axxx');
    expect(parse('b')).toBe('b');
    expect(parse('bx')).toBe('bx');
    expect(parse('bxxx')).toBe('bxxx');
    expect(parse('bxg')).toBe('bx');
    expect(parse('bxxg')).toBe('bxx');
    expect(parse('bxxxg')).toBe('bxxx');
    expect(parse('fg')).toBe(void 0);
    return expect(parse('')).toBe(void 0);
  });
  it("should parse with A: Bx|a; B:C|Ay; C:A|b", function() {
    var Parser, parse, parser;
    Parser = (function(_super) {
      __extends(Parser, _super);

      function Parser() {
        var B, C, a, b, x, y;
        Parser.__super__.constructor.apply(this, arguments);
        a = this.char('a');
        b = this.char('b');
        x = this.char('x');
        y = this.char('y');
        this.A = this.rec(this.orp(((function(_this) {
          return function() {
            var m;
            return (m = B()) && x() && m + 'x' || m;
          };
        })(this)), a));
        B = this.rec(this.orp(((function(_this) {
          return function() {
            var m;
            return (m = _this.A()) && y() && m + 'y';
          };
        })(this)), function() {
          return C();
        }));
        C = this.rec(this.orp(this.A, b));
      }

      return Parser;

    })(peasy.Parser);
    parser = new Parser();
    parse = function(text) {
      return parser.parse(text, parser.A);
    };
    expect(parse('a')).toBe('a');
    expect(parse('ax')).toBe('ax');
    expect(parse('axx')).toBe('axx');
    expect(parse('axxx')).toBe('axxx');
    expect(parse('ay')).toBe('ay');
    expect(parse('ayx')).toBe('ayx');
    expect(parse('ayxyx')).toBe('ayxyx');
    expect(parse('bxx')).toBe('bxx');
    expect(parse('ayxxx')).toBe('ayxxx');
    expect(parse('ayxmxx')).toBe('ayx');
    expect(parse('b')).toBe('b');
    expect(parse('bx')).toBe('bx');
    expect(parse('bxxx')).toBe('bxxx');
    expect(parse('bxg')).toBe('bx');
    expect(parse('bxxg')).toBe('bxx');
    expect(parse('bxxxg')).toBe('bxxx');
    expect(parse('fg')).toBe(void 0);
    return expect(parse('')).toBe(void 0);
  });
  return it("should parse with Root: Az; A: Bx|a; B:C|Ay; C:A|b", function() {
    var Parser, parse, parser;
    Parser = (function(_super) {
      __extends(Parser, _super);

      function Parser() {
        var B, C, a, b, x, y, z;
        Parser.__super__.constructor.apply(this, arguments);
        a = this.char('a');
        b = this.char('b');
        x = this.char('x');
        y = this.char('y');
        z = this.char('z');
        this.root = (function(_this) {
          return function() {
            var m;
            return (m = _this.A()) && z() && m + 'z';
          };
        })(this);
        this.A = this.rec(this.orp(((function(_this) {
          return function() {
            var m;
            return (m = B()) && x() && m + 'x' || m;
          };
        })(this)), a));
        B = this.rec(this.orp(((function(_this) {
          return function() {
            var m;
            return (m = _this.A()) && y() && m + 'y';
          };
        })(this)), function() {
          return C();
        }));
        C = this.rec(this.orp(this.A, b));
      }

      return Parser;

    })(peasy.Parser);
    parser = new Parser();
    parse = function(text) {
      return parser.parse(text);
    };
    expect(parse('az')).toBe('az');
    expect(parse('axz')).toBe('axz');
    expect(parse('axxz')).toBe('axxz');
    expect(parse('axxxz')).toBe('axxxz');
    expect(parse('ayz')).toBe('ayz');
    expect(parse('ayxz')).toBe('ayxz');
    expect(parse('ayxyxz')).toBe('ayxyxz');
    expect(parse('bxxz')).toBe('bxxz');
    expect(parse('ayxxxz')).toBe('ayxxxz');
    expect(parse('ayxmxxz')).toBe(void 0);
    expect(parse('bz')).toBe('bz');
    expect(parse('bxz')).toBe('bxz');
    expect(parse('bxxxz')).toBe('bxxxz');
    expect(parse('bxgz')).toBe(void 0);
    expect(parse('bxxgz')).toBe(void 0);
    expect(parse('bxxxgz')).toBe(void 0);
    expect(parse('fg')).toBe(void 0);
    return expect(parse('')).toBe(void 0);
  });
});


})();// wrap line by gulp-twoside
(function() {var ts = twoside('peasy/karma/samples-arithmatic.js'), require = ts.require, exports = ts.exports, module = ts.module; // wrap line by gulp-twoside for providing twoside module

var arithmatic, parse;

parse = (arithmatic = require('../samples/arithmatic')).parse;

describe("run samples/testarithmatic:", function() {
  return it('', function() {});
});

describe("arithmatic", function() {
  it("parse number", function() {
    expect(parse('1')).toBe('1');
    expect(parse('01')).toBe('01');
    expect(parse('0x01')).toBe('0x01');
    expect(parse('.1')).toBe('.1');
    expect(parse('1.')).toBe('1.');
    expect(parse('+1.')).toBe('+1.');
    expect(parse('+1.e0')).toBe('+1.e0');
    expect(parse('+1.e023')).toBe('+1.e023');
    expect(parse('+1.e')).toBe(void 0);
    expect(parse('+.e')).toBe(void 0);
    expect(parse('+.')).toBe(void 0);
    expect(parse('-.')).toBe(void 0);
    return expect(parse('-.1')).toBe('-.1');
  });
  it("parse identifier", function() {
    expect(parse('a')).toBe('a');
    expect(parse('$a')).toBe('$a');
    expect(parse('$a_')).toBe('$a_');
    expect(parse('$a_1')).toBe('$a_1');
    return expect(parse('_1')).toBe('_1');
  });
  it("parse string", function() {
    expect(parse('"a\\"b"')).toBe('"a\"b"');
    expect(parse('"a"')).toBe('"a"');
    return expect(parse("'a'")).toBe("'a'");
  });
  it("parse a.b", function() {
    return expect(parse('a.b')).toBe('a.b');
  });
  it("parse 1+1", function() {
    return expect(parse('1+1')).toBe('1+1');
  });
  it("parse 1+1*1", function() {
    return expect(parse('1+1*1')).toBe('1+1*1');
  });
  it("parse 1*1+1", function() {
    return expect(parse('1*1+1')).toBe('1*1+1');
  });
  it("parse 1*1", function() {
    return expect(parse('1*1')).toBe('1*1');
  });
  it("parse 1*1*1", function() {
    return expect(parse('1*1*1')).toBe('1*1*1');
  });
  it("parse (1*1)", function() {
    return expect(parse('(1*1)')).toBe('(1*1)');
  });
  it("parse (1*1)", function() {
    return expect(parse('(1*1)')).toBe('(1*1)');
  });
  it("parse (1*1)+(2*3)", function() {
    return expect(parse('(1*1)+(2*3)')).toBe('(1*1)+(2*3)');
  });
  it("parse a=1", function() {
    return expect(parse('a=1')).toBe('a=1');
  });
  it("parse a  = 1", function() {
    return expect(parse('a  = 1')).toBe('a=1');
  });
  it("parse a  = b = 1", function() {
    return expect(parse('a  = b = 1')).toBe('a=b=1');
  });
  it("parse 1?  a = 3:  b = 4", function() {
    return expect(parse('1?  a = 3:  b = 4')).toBe('1? a=3: b=4');
  });
  return it("parse 1?a=3:b=4", function() {
    return expect(parse('1?a=3:b=4')).toBe('1? a=3: b=4');
  });
});


})();// wrap line by gulp-twoside
(function() {var ts = twoside('peasy/karma/samples-arithmatic2.js'), require = ts.require, exports = ts.exports, module = ts.module; // wrap line by gulp-twoside for providing twoside module

var Parser, parse, parser;

Parser = require('../samples/arithmatic2').Parser;

parser = new Parser;

parse = function(text) {
  return parser.parse(text);
};

describe("run samples/testarithmatic2:", function() {
  return it('', function() {});
});

describe("testarithmatic2", function() {
  it("testaritmatic2: parse number", function() {
    expect(parse('1')).toBe('1');
    expect(parse('01')).toBe('01');
    expect(parse('0x01')).toBe('0x01');
    expect(parse('.1')).toBe('.1');
    expect(parse('1.')).toBe('1.');
    expect(parse('+1.')).toBe('+1.');
    expect(parse('+1.e0')).toBe('+1.e0');
    expect(parse('+1.e023')).toBe('+1.e023');
    expect(parse('+1.e')).toBe(void 0);
    expect(parse('+.e')).toBe(void 0);
    expect(parse('+.')).toBe(void 0);
    expect(parse('-.')).toBe(void 0);
    return expect(parse('-.1')).toBe('-.1');
  });
  it("testaritmatic2: parse identifier", function() {
    expect(parse('a')).toBe('a');
    expect(parse('$a')).toBe('$a');
    expect(parse('$a_')).toBe('$a_');
    expect(parse('$a_1')).toBe('$a_1');
    return expect(parse('_1')).toBe('_1');
  });
  it("testaritmatic2: parse string", function() {
    expect(parse('"a\\"b"')).toBe('"a\"b"');
    expect(parse('"a"')).toBe('"a"');
    return expect(parse("'a'")).toBe("'a'");
  });
  it("testaritmatic2: parse a.b", function() {
    return expect(parse('a.b')).toBe('a.b');
  });
  it("testaritmatic2: parse 1+1", function() {
    return expect(parse('1+1')).toBe('1+1');
  });
  it("testaritmatic2: parse 1+1*1", function() {
    return expect(parse('1+1*1')).toBe('1+1*1');
  });
  it("testaritmatic2: parse 1*1+1", function() {
    return expect(parse('1*1+1')).toBe('1*1+1');
  });
  it("testaritmatic2: parse 1*1", function() {
    return expect(parse('1*1')).toBe('1*1');
  });
  it("testaritmatic2: parse 1*1*1  ", function() {
    return expect(parse('1*1*1')).toBe('1*1*1');
  });
  it("testaritmatic2: parse (1*1)  ", function() {
    return expect(parse('(1*1)')).toBe('(1*1)');
  });
  it("testaritmatic2: parse (1*1)", function() {
    return expect(parse('(1*1)')).toBe('(1*1)');
  });
  it("testaritmatic2: parse (1*1)+(2*3)", function() {
    return expect(parse('(1*1)+(2*3)')).toBe('(1*1)+(2*3)');
  });
  it("testaritmatic2: parse a=1", function() {
    return expect(parse('a=1')).toBe('a=1');
  });
  it("testaritmatic2: parse a  = 1", function() {
    return expect(parse('a  = 1')).toBe('a=1');
  });
  it("testaritmatic2: parse a  = b = 1", function() {
    return expect(parse('a  = b = 1')).toBe('a=b=1');
  });
  it("testaritmatic2: parse 1?  a = 3:  b = 4", function() {
    return expect(parse('1?  a = 3:  b = 4')).toBe('1? a=3: b=4');
  });
  return it("testaritmatic2: parse 1?a=3:b=4", function() {
    return expect(parse('1?a=3:b=4')).toBe('1? a=3: b=4');
  });
});


})();// wrap line by gulp-twoside
(function() {var ts = twoside('peasy/karma/samples-dsl.js'), require = ts.require, exports = ts.exports, module = ts.module; // wrap line by gulp-twoside for providing twoside module

var parseTemplate, peasy;

peasy = require('../peasy');

parseTemplate = require('../samples/dsl').parseTemplate;

describe("run samples/testdsl:", function() {
  return it('', function() {});
});

describe("parse template", function() {
  it("parse @) shold throw error", function() {
    return expect(function() {
      return parseTemplate('@)');
    }).toThrow();
  });
  it("parse @x()) shold throw error", function() {
    return expect(function() {
      return parseTemplate('@x())');
    }).toThrow();
  });
  it("should parse 'x'", function() {
    return expect(parseTemplate('x')).toBe('t.transform(e.x)');
  });
  it("should parse 'x!y'", function() {
    return expect(parseTemplate('x!y')).toBe('t.transform(e.x),t.transform(e.y)');
  });
  it("should parse '@if_(x!y)'", function() {
    return expect(parseTemplate('@if_(x!y)')).toBe('t.if_(t.transform(e.x),t.transform(e.y))');
  });
  it("should parse '@if_(x!!!y)'", function() {
    return expect(parseTemplate('@if_(x!!!y)')).toBe('t.if_(t.transform(e.x),"!",t.transform(e.y))');
  });
  it("should parse '@x", function() {
    return expect(parseTemplate('@x')).toBe('t.x');
  });
  it("should parse '@x@y", function() {
    return expect(parseTemplate('@x@y')).toBe('t.x,t.y');
  });
  it("should parsen !)", function() {
    return expect(parseTemplate('!)')).toBe('")"');
  });
  it("should parsen ;23445", function() {
    return expect(parseTemplate(';23445')).toBe('";23445"');
  });
  it("should parsen ;23445qwe", function() {
    return expect(parseTemplate(';23445qwe')).toBe('";23445",t.transform(e.qwe)');
  });
  it("should parsen ;23445!qwe", function() {
    return expect(parseTemplate(';23445!qwe')).toBe('";23445qwe"');
  });
  it("should parsen ;23445!!qwe", function() {
    return expect(parseTemplate(';23445!!qwe')).toBe('";23445!",t.transform(e.qwe)');
  });
  it("should parsen @whileLoop(!while @paren(item)\n@block(body))", function() {
    return expect(parseTemplate('@whileLoop(!while @paren(item)\n@block(body))')).toBe("t.whileLoop(\"while \",t.paren(t.transform(e.item)),\"\\n\",t.block(t.transform(e.body)))");
  });
  it('should parse "value"', function() {
    return expect(parseTemplate('"value"')).toBe('\'"\',t.transform(e.value),\'"\'');
  });
  it("should parse @array(items)", function() {
    return expect(parseTemplate('@array(items)')).toBe('t.array(t.transform(e.items))');
  });
  it("should parse @if_(!if @paren(test)\n@block(then_)@may(\n!else @block(else_)))", function() {
    return expect(parseTemplate('@if_(!if @paren(test)\n@block(then_)@may(\n!else @block(else_)))')).toBe('t.if_("if ",t.paren(t.transform(e.test)),"\\n",t.block(t.transform(e.then_)),t.may("\\nelse ",t.block(t.transform(e.else_))))');
  });
  it("should parse '@forInLoop(!for @paren(item !in range)\n@block(body))'", function() {
    return expect(parseTemplate('@forInLoop(!for @paren(item !in range)\n@block(body))')).toBe('t.forInLoop("for ",t.paren(t.transform(e.item)," in ",t.transform(e.range)),"\\n",t.block(t.transform(e.body)))');
  });
  it("should parse @whileLoop(!while @paren(item)\n@block(body))", function() {
    return expect(parseTemplate('@whileLoop(!while @paren(item)\n@block(body))')).toBe('t.whileLoop("while ",t.paren(t.transform(e.item)),"\\n",t.block(t.transform(e.body)))');
  });
  it("should parse @tryCatch(!try @block(test)\ncatcher@may(\n!finally @block(final)))", function() {
    return expect(parseTemplate('@tryCatch(!try @block(test)\ncatcher@may(\n!finally @block(final)))')).toBe('t.tryCatch("try ",t.block(t.transform(e.test)),"\\n",t.transform(e.catcher),t.may("\\nfinally ",t.block(t.transform(e.final))))');
  });
  it("should parsen !catch @paren(variable@may(!if test))@block(\nbody)", function() {
    return expect(parseTemplate('!catch @paren(variable@may(!if test))@block(\nbody)')).toBe('"catch ",t.paren(t.transform(e.variable),t.may("if ",t.transform(e.test))),t.block("\\n",t.transform(e.body))');
  });
  it("should parsen !throw value", function() {
    return expect(parseTemplate('!throw value')).toBe('"throw ",t.transform(e.value)');
  });
  it("should parsen caller@paren(@list(args))", function() {
    return expect(parseTemplate('caller@paren(@list(args))')).toBe('t.transform(e.caller),t.paren(t.list(t.transform(e.args)))');
  });
  it("should parsen !var @list(vars)", function() {
    return expect(parseTemplate('left = right')).toBe('t.transform(e.left)," = ",t.transform(e.right)');
  });
  it("left @op(operator) = right", function() {
    return expect(parseTemplate('left @op(operator) = right')).toBe('t.transform(e.left)," ",t.op(t.transform(e.operator))," = ",t.transform(e.right)');
  });
  it("should parsen @switch_(!switch @paren(expression) \n@block(@list(cases @empty)) @may(\n!default: @block(else)))", function() {
    return expect(parseTemplate('@switch_(!switch @paren(expression) \n@block(@list(cases @empty)) @may(\n!default: @block(else)))')).toBe('t.switch_("switch ",t.paren(t.transform(e.expression))," \\n",t.block(t.list(t.transform(e.cases)," ",t.empty))," ",t.may("\\ndefault: ",t.block(t.transform(e.else))))');
  });
  return it("!case test: \n@block(body)", function() {
    return expect(parseTemplate('!case test: \n@block(body)')).toBe('"case ",t.transform(e.test),": \\n",t.block(t.transform(e.body))');
  });
});


})();// wrap line by gulp-twoside