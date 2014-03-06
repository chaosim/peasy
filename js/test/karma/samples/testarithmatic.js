// wrap lines by gulp-twoside for providing twoside module
var exports, module, require, ts;
if (typeof window === 'object') { ts = twoside('peasy/test/karma/samples/testarithmatic.js'), require = ts.require, exports = ts.exports, module = ts.module;} 
(function(require, exports, module) {
var arithmatic, parse;

parse = (arithmatic = require('../../../samples/arithmatic')).parse;

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
})(require, exports, module); // wrap line by gulp-twoside