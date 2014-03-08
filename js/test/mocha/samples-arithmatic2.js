var Parser, chai, expect, parse, parser;

chai = require('chai');

expect = chai.expect;

Parser = require('../../samples/arithmatic2').Parser;

parser = new Parser;

parse = function(text) {
  return parser.parse(text);
};

describe("run samples/testarithmatic2:", function() {
  return it('', function() {});
});

describe("testarithmatic2", function() {
  it("testaritmatic2: parse number", function() {
    expect(parse('1')).to.equal('1');
    expect(parse('01')).to.equal('01');
    expect(parse('0x01')).to.equal('0x01');
    expect(parse('.1')).to.equal('.1');
    expect(parse('1.')).to.equal('1.');
    expect(parse('+1.')).to.equal('+1.');
    expect(parse('+1.e0')).to.equal('+1.e0');
    expect(parse('+1.e023')).to.equal('+1.e023');
    expect(parse('+1.e')).to.equal(void 0);
    expect(parse('+.e')).to.equal(void 0);
    expect(parse('+.')).to.equal(void 0);
    expect(parse('-.')).to.equal(void 0);
    return expect(parse('-.1')).to.equal('-.1');
  });
  it("testaritmatic2: parse identifier", function() {
    expect(parse('a')).to.equal('a');
    expect(parse('$a')).to.equal('$a');
    expect(parse('$a_')).to.equal('$a_');
    expect(parse('$a_1')).to.equal('$a_1');
    return expect(parse('_1')).to.equal('_1');
  });
  it("testaritmatic2: parse string", function() {
    expect(parse('"a\\"b"')).to.equal('"a\"b"');
    expect(parse('"a"')).to.equal('"a"');
    return expect(parse("'a'")).to.equal("'a'");
  });
  it("testaritmatic2: parse a.b", function() {
    return expect(parse('a.b')).to.equal('a.b');
  });
  it("testaritmatic2: parse 1+1", function() {
    return expect(parse('1+1')).to.equal('1+1');
  });
  it("testaritmatic2: parse 1+1*1", function() {
    return expect(parse('1+1*1')).to.equal('1+1*1');
  });
  it("testaritmatic2: parse 1*1+1", function() {
    return expect(parse('1*1+1')).to.equal('1*1+1');
  });
  it("testaritmatic2: parse 1*1", function() {
    return expect(parse('1*1')).to.equal('1*1');
  });
  it("testaritmatic2: parse 1*1*1  ", function() {
    return expect(parse('1*1*1')).to.equal('1*1*1');
  });
  it("testaritmatic2: parse (1*1)  ", function() {
    return expect(parse('(1*1)')).to.equal('(1*1)');
  });
  it("testaritmatic2: parse (1*1)", function() {
    return expect(parse('(1*1)')).to.equal('(1*1)');
  });
  it("testaritmatic2: parse (1*1)+(2*3)", function() {
    return expect(parse('(1*1)+(2*3)')).to.equal('(1*1)+(2*3)');
  });
  it("testaritmatic2: parse a=1", function() {
    return expect(parse('a=1')).to.equal('a=1');
  });
  it("testaritmatic2: parse a  = 1", function() {
    return expect(parse('a  = 1')).to.equal('a=1');
  });
  it("testaritmatic2: parse a  = b = 1", function() {
    return expect(parse('a  = b = 1')).to.equal('a=b=1');
  });
  it("testaritmatic2: parse 1?  a = 3:  b = 4", function() {
    return expect(parse('1?  a = 3:  b = 4')).to.equal('1? a=3: b=4');
  });
  return it("testaritmatic2: parse 1?a=3:b=4", function() {
    return expect(parse('1?a=3:b=4')).to.equal('1? a=3: b=4');
  });
});
