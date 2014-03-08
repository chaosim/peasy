chai = require 'chai'
expect = chai.expect

{Parser} = require '../../samples/arithmatic2'

parser = new Parser

parse = (text) -> parser.parse(text)

describe "run samples/testarithmatic2:", ->
  it '', ->

describe "testarithmatic2", ->
  it "testaritmatic2: parse number", ->
    expect(parse('1')).to.equal '1'
    expect(parse('01')).to.equal '01'
    expect(parse('0x01')).to.equal '0x01'
    expect(parse('.1')).to.equal '.1'
    expect(parse('1.')).to.equal '1.'
    expect(parse('+1.')).to.equal '+1.'
    expect(parse('+1.e0')).to.equal '+1.e0'
    expect(parse('+1.e023')).to.equal '+1.e023'
    expect(parse('+1.e')).to.equal undefined
    expect(parse('+.e')).to.equal undefined
    expect(parse('+.')).to.equal undefined
    expect(parse('-.')).to.equal undefined
    expect(parse('-.1')).to.equal '-.1'
  it "testaritmatic2: parse identifier", ->
    expect(parse('a')).to.equal 'a'
    expect(parse('$a')).to.equal '$a'
    expect(parse('$a_')).to.equal '$a_'
    expect(parse('$a_1')).to.equal '$a_1'
    expect(parse('_1')).to.equal '_1'
  it "testaritmatic2: parse string", ->
    expect(parse('"a\\"b"')).to.equal '"a\"b"'
    expect(parse('"a"')).to.equal '"a"'
    expect(parse("'a'")).to.equal "'a'"
  it "testaritmatic2: parse a.b", ->
    expect(parse('a.b')).to.equal 'a.b'
  it "testaritmatic2: parse 1+1", ->
    expect(parse('1+1')).to.equal '1+1'
  it "testaritmatic2: parse 1+1*1", ->
    expect(parse('1+1*1')).to.equal '1+1*1'
  it "testaritmatic2: parse 1*1+1", ->
    expect(parse('1*1+1')).to.equal '1*1+1'
  it "testaritmatic2: parse 1*1", ->
    expect(parse('1*1')).to.equal '1*1'
  it "testaritmatic2: parse 1*1*1  ", ->
    expect(parse('1*1*1')).to.equal '1*1*1'
  it "testaritmatic2: parse (1*1)  ", ->
    expect(parse('(1*1)')).to.equal '(1*1)'
  it "testaritmatic2: parse (1*1)", ->
    expect(parse('(1*1)')).to.equal '(1*1)'
  it "testaritmatic2: parse (1*1)+(2*3)", ->
    expect(parse('(1*1)+(2*3)')).to.equal '(1*1)+(2*3)'
  it "testaritmatic2: parse a=1", ->
    expect(parse('a=1')).to.equal 'a=1'
  it "testaritmatic2: parse a  = 1", ->
    expect(parse('a  = 1')).to.equal 'a=1'
  it "testaritmatic2: parse a  = b = 1", ->
    expect(parse('a  = b = 1')).to.equal 'a=b=1'
  it "testaritmatic2: parse 1?  a = 3:  b = 4", ->
    expect(parse('1?  a = 3:  b = 4')).to.equal '1? a=3: b=4'
  it "testaritmatic2: parse 1?a=3:b=4", ->
    expect(parse('1?a=3:b=4')).to.equal '1? a=3: b=4'