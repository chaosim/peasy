chai = require 'chai'
expect = chai.expect

{charset, inCharset} = peasy = require '../../linepeasy'

describe "run testlinepeasy:", ->
  it '', ->

describe "peasy", ->
  it "charset('ab') should contain 'a'",  ->
    set = charset('ab')
    expect(inCharset('a', set)).to.equal true
    expect(inCharset('0', set)).to.equal false

describe "linepeasy parse number", ->
  parse = (text) -> peasy.parse(text, peasy.parser.number)
  it "parse(1)",  ->
    expect(parse('0')[0]).to.equal 0
    expect(parse('1')[0]).to.equal 1
  it "parse(1.2)",  ->
    expect(parse('1.2')[0]).to.equal 1.2
  it "parse 1. .1",  ->
    expect(parse('1.')[0]).to.equal 1
    expect(parse('.1')[0]).to.equal .1
  it "parse 0x1",  ->
    expect(parse('0x1')[0]).to.equal 0x1
  it "parse 0x1efFA",  ->
    expect(parse('0x1efFA')[0]).to.equal 0x1efFA
  it "parse 0b1101",  ->
    expect(parse('0b1101')[0]).to.equal parseInt('1101', 2)
  it "parse 0b0",  ->
    expect(parse('0b0')[0]).to.equal 0
  it "parse 0b2",  ->
    try expect( -> parse('0b2')).to.throw peasy.NumberFormatError
    catch e then return
    throw 'NumberFormatError'
  it "parse +1.2",  ->
    expect(parse('+1.2')[0]).to.equal 1.2
  it "parse +1.2e2",  ->
    expect(parse('+1.2e2')[0]).to.equal 1.2e2
  it "parse +1.2 1.2e2",  ->
    expect(parse('+1.2e-2')[0]).to.equal 1.2e-2
    expect(parse('+.2e-2')[0]).to.equal .2e-2
    expect(parse('+0.2e-2')[0]).to.equal .2e-2
  it "parse +000.2e-2",  ->
    expect(parse('+000.2e-2')[0]).to.equal .2e-2
  it "parse .2e1",  ->
    expect(parse('.2e1')[0]).to.equal 2
  it "parse .2e1",  ->
    expect(parse('.2e2')[0]).to.equal 20

describe "peasy.parser left recursive", ->
  it "should parse with A: Ax|a",  ->
    class Parser extends peasy.Parser
      constructor: ->
        super
        a = @char('a')
        x = @char('x')
        @A = @rec @orp(( => (m = @A()) and x() and m+'x' or m), a)
    parser = new Parser()
    parse = (text) -> parser.parse(text, parser.A)
    expect(parse('a')).to.equal 'a'
    expect(parse('ax')).to.equal 'ax'
    expect(parse('axx')).to.equal 'axx'
    expect(parse('axxx')).to.equal 'axxx'

  it "should parse with A: Bx|a; B:A|b", ->
    class Parser extends peasy.Parser
      constructor: ->
        super
        a = @char('a')
        b = @char('b')
        x = @char('x')
        @A = @rec @orp((=> (m =  B()) and x() and m+'x' or m), a)
        B = @rec @orp(@A, b)
    parser = new Parser()
    parse = (text) -> parser.parse(text, parser.A)
    expect(parse('a')).to.equal 'a'
    expect(parse('ax')).to.equal 'ax'
    expect(parse('axx')).to.equal 'axx'
    expect(parse('axxx')).to.equal 'axxx'
    expect(parse('b')).to.equal 'b'
    expect(parse('bx')).to.equal 'bx'
    expect(parse('bxxx')).to.equal 'bxxx'
    expect(parse('bxg')).to.equal 'bx'
    expect(parse('bxxg')).to.equal 'bxx'
    expect(parse('bxxxg')).to.equal 'bxxx'
    expect(parse('fg')).to.equal undefined
    expect(parse('')).to.equal undefined

  it "should parse with A: Bx|a; B:C; C:A|b", ->
    class Parser extends peasy.Parser
      constructor: ->
        super
        a = @char('a')
        b = @char('b')
        x = @char('x')
        @A = @rec @orp((=> (m =  B()) and x() and m+'x' or m), a)
        B = @rec -> C()
        C = @rec @orp(@A, b)
    parser = new Parser()
    parse = (text) -> parser.parse(text, parser.A)
    expect(parse('a')).to.equal 'a'
    expect(parse('ax')).to.equal 'ax'
    expect(parse('axx')).to.equal 'axx'
    expect(parse('axxx')).to.equal 'axxx'
    expect(parse('b')).to.equal 'b'
    expect(parse('bx')).to.equal 'bx'
    expect(parse('bxxx')).to.equal 'bxxx'
    expect(parse('bxg')).to.equal 'bx'
    expect(parse('bxxg')).to.equal 'bxx'
    expect(parse('bxxxg')).to.equal 'bxxx'
    expect(parse('fg')).to.equal undefined
    expect(parse('')).to.equal undefined

  it "should parse with A: Bx|a; B:C|Ay; C:A|b", ->
    class Parser extends peasy.Parser
      constructor: ->
        super
        a = @char('a')
        b = @char('b')
        x = @char('x')
        y = @char('y')
        @A = @rec @orp((=> (m =  B()) and x() and m+'x' or m), a)
        B = @rec @orp(( => (m = @A())  and y() and m+'y'), -> C())
        C = @rec @orp(@A, b)
    parser = new Parser()
    parse = (text) -> parser.parse(text, parser.A)
    expect(parse('a')).to.equal 'a'
    expect(parse('ax')).to.equal 'ax'
    expect(parse('axx')).to.equal 'axx'
    expect(parse('axxx')).to.equal 'axxx'
    expect(parse('ay')).to.equal 'ay'
    expect(parse('ayx')).to.equal 'ayx'
    expect(parse('ayxyx')).to.equal 'ayxyx'
    expect(parse('bxx')).to.equal 'bxx'# Bx Cx Ax Bxx Cxx bxx
    expect(parse('ayxxx')).to.equal 'ayxxx'# Bx Cx Ax Bxx Cxx Axx Bxxx Ayxxx ayxxx
    expect(parse('ayxmxx')).to.equal 'ayx'
    expect(parse('b')).to.equal 'b'
    expect(parse('bx')).to.equal 'bx'
    expect(parse('bxxx')).to.equal 'bxxx'
    expect(parse('bxg')).to.equal 'bx'
    expect(parse('bxxg')).to.equal 'bxx'
    expect(parse('bxxxg')).to.equal 'bxxx'
    expect(parse('fg')).to.equal undefined
    expect(parse('')).to.equal undefined

  it "should parse with Root: Az; A: Bx|a; B:C|Ay; C:A|b", ->
    class Parser extends peasy.Parser
      constructor: ->
        super
        a = @char('a')
        b = @char('b')
        x = @char('x')
        y = @char('y')
        z = @char('z')
        @root = => (m = @A()) and z() and m+'z'
        @A = @rec @orp(( => (m =  B()) and x() and m+'x' or m), a)
        B = @rec @orp((=> (m = @A())  and y() and m+'y'), -> C())
        C = @rec @orp(@A, b)
    parser = new Parser()
    parse = (text) -> parser.parse(text)
    expect(parse('az')).to.equal 'az'
    expect(parse('axz')).to.equal 'axz'
    expect(parse('axxz')).to.equal 'axxz'
    expect(parse('axxxz')).to.equal 'axxxz'
    expect(parse('ayz')).to.equal 'ayz'
    expect(parse('ayxz')).to.equal 'ayxz'
    expect(parse('ayxyxz')).to.equal 'ayxyxz'
    expect(parse('bxxz')).to.equal 'bxxz'
    expect(parse('ayxxxz')).to.equal 'ayxxxz'
    expect(parse('ayxmxxz')).to.equal undefined
    expect(parse('bz')).to.equal 'bz'
    expect(parse('bxz')).to.equal 'bxz'
    expect(parse('bxxxz')).to.equal 'bxxxz'
    expect(parse('bxgz')).to.equal undefined
    expect(parse('bxxgz')).to.equal undefined
    expect(parse('bxxxgz')).to.equal undefined
    expect(parse('fg')).to.equal undefined
    expect(parse('')).to.equal undefined
