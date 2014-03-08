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